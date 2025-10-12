import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AuthChangePasswordRequestDto,
  AuthJwtPayload,
  AuthProfileResponseDto,
  AuthRefreshRequestDto,
  ForgotPasswordRequestDto,
  ForgotPasswordTokenRequestDto,
  LoginAuthRequestDto,
  LoginAuthResponseDto,
  RegisterAuthRequestDto,
  RegisterAuthResponseDto,
  UpdateAuthProfileRequestDto,
  InitiateVerifyEmailRequestDto,
  ConfirmEmailVerificationCodeRequestDto,
  VerifyEmailResponseDto,
  VerifyPhoneNumberResponseDto,
  ConfirmPhoneNumberVerificationCodeRequestDto,
} from './auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { IsNull, MoreThan, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AuthException } from './auth.exception';
import {
  AuthValidation,
  FORGOT_TOKEN_EXPIRED,
  INVALID_OLD_PASSWORD,
} from './auth.validation';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { Branch } from 'src/branch/branch.entity';
import { BranchValidation } from 'src/branch/branch.validation';
import { BranchException } from 'src/branch/branch.exception';
import { FileService } from 'src/file/file.service';
import { MailService } from 'src/mail/mail.service';
import { ForgotPasswordToken } from './entity/forgot-password-token.entity';
import { CurrentUserDto } from 'src/user/user.dto';
import { Role } from 'src/role/role.entity';
import { RoleEnum } from 'src/role/role.enum';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfigKey } from 'src/system-config/system-config.constant';
import { RoleException } from 'src/role/role.exception';
import { RoleValidation } from 'src/role/role.validation';
import { VerifyEmailToken } from './entity/verify-email-token.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { AuthUtils, checkActiveUser } from './auth.utils';
import { UserUtils } from 'src/user/user.utils';
import { getRandomString } from 'src/helper';
import { VerifyPhoneNumberToken } from './entity/verify-phone-number-token.entity';
import { ZaloOaConnectorClient } from 'src/zalo-oa-connector/zalo-oa-connector.client';
import {
  ZaloOaInitiateSmsRequestDto,
  ZaloOaInitiateSmsResponseDto,
  ZaloOaInitiateSmsTemplateDataDto,
} from 'src/zalo-oa-connector/zalo-oa-connector.dto';
import { ZaloOaStrategy } from 'src/zalo-oa-connector/zalo-oa-connector.constants';
import { ZaloOaConnectorConfig } from 'src/zalo-oa-connector/entity/zalo-oa-connector.entity';
import { ZaloOaConnectorException } from 'src/zalo-oa-connector/zalo-oa-connector.exception';
import { ZaloOaConnectorValidation } from 'src/zalo-oa-connector/zalo-oa-connector.validation';
import { ZaloOaConnectorHistory } from 'src/zalo-oa-connector/entity/zalo-oa-connector-history.entity';
import { SharedBalanceService } from 'src/shared/services/shared-balance.service';
@Injectable()
export class AuthService {
  private saltOfRounds: number;
  private duration: number;
  private refeshableDuration: number;
  private zaloOaApiKey: string;
  private zaloOaSecretKey: string;
  private zaloOaId: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectRepository(ForgotPasswordToken)
    private readonly forgotPasswordRepository: Repository<ForgotPasswordToken>,
    @InjectRepository(VerifyEmailToken)
    private readonly verifyEmailRepository: Repository<VerifyEmailToken>,
    @InjectRepository(VerifyPhoneNumberToken)
    private readonly verifyPhoneNumberRepository: Repository<VerifyPhoneNumberToken>,
    private readonly fileService: FileService,
    private readonly mailService: MailService,
    private readonly systemConfigService: SystemConfigService,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly authUtils: AuthUtils,
    private readonly userUtils: UserUtils,
    private readonly zaloOaConnectorClient: ZaloOaConnectorClient,
    @InjectRepository(ZaloOaConnectorConfig)
    private readonly zaloOaConnectorConfigRepository: Repository<ZaloOaConnectorConfig>,
    private readonly sharedBalanceService: SharedBalanceService
  ) {
    this.saltOfRounds = this.configService.get<number>('SALT_ROUNDS');
    this.duration = this.configService.get<number>('DURATION');
    this.refeshableDuration = this.configService.get<number>(
      'REFRESHABLE_DURATION',
    );
    this.zaloOaApiKey = this.configService.get<string>('ZALO_OA_API_KEY');
    this.zaloOaSecretKey = this.configService.get<string>('ZALO_OA_SECRET_KEY');
    this.zaloOaId = this.configService.get<string>('ZALO_OA_ID');
  }

  async getZaloOaConnectorConfig(
    strategy: string,
  ): Promise<ZaloOaConnectorConfig> {
    const context = `${AuthService.name}.${this.getZaloOaConnectorConfig.name}`;
    const zaloOaConnectorConfig =
      await this.zaloOaConnectorConfigRepository.findOne({
        where: {
          strategy,
        },
      });
    if (!zaloOaConnectorConfig) {
      this.logger.error(
        `Zalo OA connector config not found for strategy ${ZaloOaStrategy.VERIFY_ACCOUNT}`,
        null,
        context,
      );
      throw new ZaloOaConnectorException(
        ZaloOaConnectorValidation.ZALO_OA_CONNECTOR_CONFIG_NOT_FOUND,
      );
    }
    return zaloOaConnectorConfig;
  }

  /**
   *  Retrieves the frontend URL configuration.
   *
   * This method fetches the frontend URL from the system configuration
   * service using the predefined `SystemConfigKey.FRONTEND_URL` key.
   * @returns {Promise<string>} The frontend URL as a string
   */
  async getFrontendUrl(): Promise<string> {
    const context = `${AuthService.name}.${this.getFrontendUrl.name}`;
    this.logger.log(`Get frontend url`, context);
    const url = await this.systemConfigService.get(
      SystemConfigKey.FRONTEND_URL,
    );
    if (!url) {
      this.logger.error(`Frontend URL not found`, context);
    }

    return url;
  }

  /**
   * Handles the forgot password
   *
   * This method verifies the provided forgot password token and updates the user's password
   * if the token is valid and has not expired. After successfully updating the password,
   * the token is marked as expired.
   *
   * @param {ForgotPasswordRequestDto} requestData - The data required for processing the forgot password request.
   * @returns {Promise<number>} A promise that resolves to `0` if the forgot password process executes successfully.
   * @throws {AuthException} Throws exception if the token is expired, invalid, or the user does not exist.
   */
  async forgotPassword(requestData: ForgotPasswordRequestDto): Promise<number> {
    const context = `${AuthService.name}.${this.forgotPassword.name}`;
    const existToken = await this.forgotPasswordRepository.findOne({
      where: {
        token: requestData.token,
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!existToken) {
      this.logger.warn(`Forgot token is not existed`, context);
      throw new AuthException(
        AuthValidation.FORGOT_TOKEN_EXPIRED,
        FORGOT_TOKEN_EXPIRED,
      );
    }

    // Verify token
    let isExpiredToken = false;
    try {
      this.jwtService.verify(requestData.token);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      isExpiredToken = true;
    }
    if (isExpiredToken) {
      this.logger.warn(`Forgot token is expired`, context);
      throw new AuthException(
        AuthValidation.FORGOT_TOKEN_EXPIRED,
        FORGOT_TOKEN_EXPIRED,
      );
    }

    // Get payload
    const payload: AuthJwtPayload = this.jwtService.decode(requestData.token);
    this.logger.log(`Payload: ${JSON.stringify(payload)}`);

    const user = await this.userUtils.getUser({
      where: {
        id: payload.sub,
      },
    });

    const hashedPass = await bcrypt.hash(
      requestData.newPassword,
      this.saltOfRounds,
    );

    user.password = hashedPass;
    await this.userRepository.save(user);
    this.logger.log(`User ${user.id} has been updated password`, context);

    // Set token expired after forgot password successfully
    existToken.expiresAt = new Date(Date.now() - 120000); // Set expiry time to the past
    await this.forgotPasswordRepository.save(existToken);
    this.logger.log(`Token ${existToken.token} is expired`, context);

    return 0;
  }

  /**
   * Handles the creation of a forgot password token
   *
   * This method create forgot password token base on user id. After the token created successfully,
   * It's assigned with the frontend URL and returned to the client through email
   *
   * @param {ForgotPasswordTokenRequestDto} requestData The data required for processing the creation password token
   * @returns {Promise<string>} Return URL to help client forgot password
   * @throws {AuthException} throws exception if user not found, token is invalid
   */
  async createForgotPasswordToken(
    requestData: ForgotPasswordTokenRequestDto,
  ): Promise<string> {
    const context = `${AuthService.name}.${this.createForgotPasswordToken.name}`;
    const user = await this.userUtils.getUser({
      where: {
        email: requestData.email,
      },
    });

    const existingToken = await this.forgotPasswordRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
        expiresAt: MoreThan(new Date()),
      },
    });

    if (existingToken) {
      this.logger.warn(`User ${user.id} already has a valid token`, context);
      throw new AuthException(AuthValidation.FORGOT_TOKEN_EXISTS);
    }

    const payload: AuthJwtPayload = { sub: user.id, jti: uuidv4() };
    const expiresIn = 120; // 2 minutes
    const token = this.jwtService.sign(payload, {
      expiresIn: expiresIn,
    });

    const forgotPasswordToken = new ForgotPasswordToken();
    Object.assign(forgotPasswordToken, {
      expiresAt: moment().add(expiresIn, 'seconds').toDate(),
      token,
      user,
    } as ForgotPasswordToken);

    const url = `${await this.getFrontendUrl()}/reset-password?token=${token}`;

    await this.transactionManagerService.execute(
      async (manager) => {
        await manager.save(forgotPasswordToken);
        await this.mailService.sendForgotPasswordToken(user, url);
      },
      () => {
        this.logger.log(
          `User ${user.firstName} ${user.lastName} created forgot password token`,
          context,
        );
      },
      (error) => {
        this.logger.error(
          `Error when create forgot password token`,
          error.stack,
          context,
        );
        throw new AuthException(
          AuthValidation.ERROR_CREATE_FORGOT_PASSWORD_TOKEN,
        );
      },
    );

    return url;
  }

  async initiateVerifyEmail(
    currentUserDto: CurrentUserDto,
    requestData: InitiateVerifyEmailRequestDto,
  ): Promise<VerifyEmailResponseDto> {
    const context = `${AuthService.name}.${this.initiateVerifyEmail.name}`;
    this.logger.log(
      `Request initiate verify email ${JSON.stringify(requestData)}`,
      context,
    );
    const user = await this.userUtils.getUser({
      where: {
        id: currentUserDto.userId ?? IsNull(),
        phonenumber: Not('default-customer'),
      },
    });

    if (user.isVerifiedEmail) {
      this.logger.warn(`User ${user.id} already verified email`, context);
      throw new AuthException(AuthValidation.USER_ALREADY_VERIFIED_EMAIL);
    }

    const existingToken = await this.verifyEmailRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
        expiresAt: MoreThan(new Date()),
      },
    });
    if (existingToken) {
      this.logger.warn(
        `User ${user.id} already has a valid email token`,
        context,
      );
      throw new AuthException(AuthValidation.VERIFY_EMAIL_TOKEN_ALREADY_EXISTS);
    }

    // Check email in system except current user
    const existedEmailInSystem = await this.userRepository.findOne({
      where: {
        email: requestData.email,
        id: Not(user.id),
      },
    });
    if (existedEmailInSystem) {
      this.logger.warn(AuthValidation.EMAIL_ALREADY_EXISTS.message, context);
      throw new AuthException(AuthValidation.EMAIL_ALREADY_EXISTS);
    }

    const existedEmailCurrentUser = await this.userRepository.findOne({
      where: {
        email: requestData.email,
        id: user.id,
      },
    });
    if (existedEmailCurrentUser) {
      if (user.isVerifiedEmail) {
        this.logger.warn(
          AuthValidation.THIS_EMAIL_ALREADY_VERIFY.message,
          context,
        );
        throw new AuthException(AuthValidation.THIS_EMAIL_ALREADY_VERIFY);
      }
    }

    const token = getRandomString().slice(0, 6).toUpperCase();
    const verifyEmailToken = new VerifyEmailToken();
    Object.assign(verifyEmailToken, {
      expiresAt: moment()
        .add(60 * 10, 'seconds')
        .toDate(),
      token,
      user,
      email: requestData.email,
    } as VerifyEmailToken);

    const result =
      await this.transactionManagerService.execute<VerifyEmailToken>(
        async (manager) => {
          const createdToken = await manager.save(verifyEmailToken);
          await this.mailService.sendVerifyEmail(
            user,
            token,
            requestData.email,
            moment(createdToken.expiresAt).format('DD/MM/YYYY HH:mm'),
          );
          return createdToken;
        },
        () => {
          this.logger.log(
            `User ${user.id} created initiate verify email token`,
            context,
          );
        },
        (error) => {
          this.logger.error(
            `Error when create initiate verify email token`,
            error.stack,
            context,
          );
          throw new AuthException(
            AuthValidation.ERROR_CREATE_VERIFY_EMAIL_TOKEN,
          );
        },
      );

    return this.mapper.map(result, VerifyEmailToken, VerifyEmailResponseDto);
  }

  async resendVerifyEmailCode(
    currentUserDto: CurrentUserDto,
  ): Promise<VerifyEmailResponseDto> {
    const context = `${AuthService.name}.${this.resendVerifyEmailCode.name}`;
    this.logger.log(
      `Request resend verify email code ${JSON.stringify(currentUserDto)}`,
      context,
    );
    const user = await this.userUtils.getUser({
      where: {
        id: currentUserDto.userId ?? IsNull(),
        phonenumber: Not('default-customer'),
      },
    });

    if (user.isVerifiedEmail) {
      this.logger.warn(`User ${user.id} already verified email`, context);
      throw new AuthException(AuthValidation.USER_ALREADY_VERIFIED_EMAIL);
    }

    const existingToken: VerifyEmailToken =
      await this.verifyEmailRepository.findOne({
        where: {
          user: {
            id: user.id,
          },
          expiresAt: MoreThan(new Date()),
        },
      });
    if (!existingToken) {
      this.logger.warn(`Verify email token is not existed`, context);
      throw new AuthException(AuthValidation.VERIFY_EMAIL_TOKEN_NOT_FOUND);
    }

    await this.mailService.sendVerifyEmail(
      user,
      existingToken.token,
      existingToken.email,
      moment(existingToken.expiresAt).format('DD/MM/YYYY HH:mm'),
    );

    return this.mapper.map(
      existingToken,
      VerifyEmailToken,
      VerifyEmailResponseDto,
    );
  }

  async confirmEmailVerificationCode(
    currentUserDto: CurrentUserDto,
    requestData: ConfirmEmailVerificationCodeRequestDto,
  ): Promise<boolean> {
    const context = `${AuthService.name}.${this.confirmEmailVerificationCode.name}`;

    const user = await this.userUtils.getUser({
      where: {
        id: currentUserDto.userId ?? IsNull(),
        phonenumber: Not('default-customer'),
      },
    });

    if (user.isVerifiedEmail) {
      this.logger.warn(`User ${user.id} already verified email`, context);
      throw new AuthException(AuthValidation.USER_ALREADY_VERIFIED_EMAIL);
    }

    const existToken = await this.verifyEmailRepository.findOne({
      where: {
        token: requestData.code,
        // expiresAt: MoreThan(new Date()),
        user: { id: user.id },
      },
    });
    if (!existToken) {
      this.logger.warn(`Verify token is not existed`, context);
      throw new AuthException(AuthValidation.VERIFY_EMAIL_TOKEN_NOT_FOUND);
    }

    if (new Date().getTime() > existToken.expiresAt.getTime()) {
      this.logger.warn(
        AuthValidation.VERIFY_EMAIL_TOKEN_IS_EXPIRED.message,
        context,
      );
      throw new AuthException(AuthValidation.VERIFY_EMAIL_TOKEN_IS_EXPIRED);
    }

    user.email = existToken.email;
    user.isVerifiedEmail = true;

    // Set token expired after forgot password successfully
    existToken.expiresAt = new Date(Date.now() - 120000); // Set expiry time to the past

    await this.transactionManagerService.execute(
      async (manager) => {
        await manager.save(user);
        await manager.save(existToken);
      },
      () => {
        this.logger.log(
          `User ${user.id} confirmed email verification token`,
          context,
        );
      },
      (error) => {
        this.logger.error(
          `Error when confirm email verification`,
          error.stack,
          context,
        );
        throw new AuthException(
          AuthValidation.CONFIRM_EMAIL_VERIFICATION_ERROR,
        );
      },
    );

    return true;
  }

  /**
   *  Retrieves the frontend URL configuration.
   *
   * This method fetches the frontend URL from the system configuration
   * service using the predefined `SystemConfigKey.FRONTEND_URL` key.
   * @returns {Promise<string>} The frontend URL as a string
   */
  async getBackendUrl(): Promise<string> {
    const context = `${AuthService.name}.${this.getBackendUrl.name}`;
    this.logger.log(`Get backend url`, context);
    const url = await this.systemConfigService.get(SystemConfigKey.BACKEND_URL);
    if (!url) {
      this.logger.error(`Backend URL not found`, context);
    }

    return url;
  }

  async initiateVerifyPhoneNumber(
    currentUserDto: CurrentUserDto,
  ): Promise<VerifyPhoneNumberResponseDto> {
    const context = `${AuthService.name}.${this.initiateVerifyPhoneNumber.name}`;
    this.logger.log(`Request initiate verify phone number`, context);
    const user = await this.userUtils.getUser({
      where: {
        id: currentUserDto.userId ?? IsNull(),
        phonenumber: Not('default-customer'),
      },
    });

    if (user.isVerifiedPhonenumber) {
      this.logger.warn(
        `User ${user.id} already verified phone number`,
        context,
      );
      throw new AuthException(AuthValidation.USER_ALREADY_VERIFIED_PHONENUMBER);
    }

    this.logger.log(`User ${user.slug} initiate verify phone number`, context);

    const existingToken = await this.verifyPhoneNumberRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
        expiresAt: MoreThan(new Date()),
      },
    });
    if (existingToken) {
      this.logger.warn(
        `User ${user.id} already has a valid phone number token`,
        context,
      );
      throw new AuthException(
        AuthValidation.VERIFY_PHONE_NUMBER_TOKEN_ALREADY_EXISTS,
      );
    }

    const token = getRandomString().slice(0, 6).toUpperCase();
    const verifyPhoneNumberToken = new VerifyPhoneNumberToken();
    Object.assign(verifyPhoneNumberToken, {
      expiresAt: moment()
        .add(60 * 10, 'seconds')
        .toDate(),
      token,
      user,
    } as VerifyPhoneNumberToken);

    const result =
      await this.transactionManagerService.execute<VerifyPhoneNumberToken>(
        async (manager) => {
          const zaloOaConnectorConfig = await this.getZaloOaConnectorConfig(
            ZaloOaStrategy.VERIFY_ACCOUNT,
          );

          const zaloOaInitiateSmsRequestDto = new ZaloOaInitiateSmsRequestDto();
          zaloOaInitiateSmsRequestDto.ApiKey = this.zaloOaApiKey;
          zaloOaInitiateSmsRequestDto.SecretKey = this.zaloOaSecretKey;
          zaloOaInitiateSmsRequestDto.OAID = this.zaloOaId;
          zaloOaInitiateSmsRequestDto.Phone = user.phonenumber;
          zaloOaInitiateSmsRequestDto.TempData = {
            otp: token,
            time: moment(verifyPhoneNumberToken.expiresAt).format(
              'HH:mm DD/MM/YYYY',
            ),
          } as ZaloOaInitiateSmsTemplateDataDto;
          zaloOaInitiateSmsRequestDto.TempID = zaloOaConnectorConfig.templateId;
          zaloOaInitiateSmsRequestDto.campaignid =
            zaloOaConnectorConfig.strategy;
          zaloOaInitiateSmsRequestDto.RequestId = getRandomString();

          const backendUrl = await this.getBackendUrl();
          zaloOaInitiateSmsRequestDto.CallbackUrl = `${backendUrl}/zalo-oa-connector/callback/status`;

          const zaloOaInitiateResponse: ZaloOaInitiateSmsResponseDto =
            await this.zaloOaConnectorClient.initiateSms(
              zaloOaInitiateSmsRequestDto,
            );

          if (zaloOaInitiateResponse.ErrorMessage) {
            this.logger.error(
              `Error when initiate sms verify account: ${zaloOaInitiateResponse.ErrorMessage}`,
              context,
            );
            throw new ZaloOaConnectorException(
              ZaloOaConnectorValidation.ERROR_INITIATE_SMS_VERIFY_ACCOUNT,
            );
          }
          const createdToken = await manager.save(verifyPhoneNumberToken);
          if (zaloOaInitiateResponse.SMSID) {
            const zaloOaConnectorHistory = new ZaloOaConnectorHistory();
            Object.assign(zaloOaConnectorHistory, {
              tokenId: createdToken.id,
              smsId: zaloOaInitiateResponse.SMSID,
              requestId: zaloOaInitiateSmsRequestDto.RequestId,
              templateId: zaloOaConnectorConfig.templateId,
              strategy: zaloOaConnectorConfig.strategy,
            } as ZaloOaConnectorHistory);

            await manager.save(zaloOaConnectorHistory);
          }
          return createdToken;
        },
        () => {
          this.logger.log(
            `User ${user.id} created initiate verify phone number token`,
            context,
          );
        },
        (error) => {
          this.logger.error(
            `Error when create initiate verify phone number token`,
            error.stack,
            context,
          );
          throw new AuthException(
            AuthValidation.ERROR_CREATE_VERIFY_PHONE_NUMBER_TOKEN,
          );
        },
      );

    return this.mapper.map(
      result,
      VerifyPhoneNumberToken,
      VerifyPhoneNumberResponseDto,
    );
  }

  async resendVerifyPhoneNumberCode(
    currentUserDto: CurrentUserDto,
  ): Promise<VerifyPhoneNumberResponseDto> {
    const context = `${AuthService.name}.${this.resendVerifyPhoneNumberCode.name}`;
    this.logger.log(`Request resend verify phone number code}`, context);
    const user = await this.userUtils.getUser({
      where: {
        id: currentUserDto.userId ?? IsNull(),
        phonenumber: Not('default-customer'),
      },
    });

    if (user.isVerifiedPhonenumber) {
      this.logger.warn(
        `User ${user.id} already verified phone number`,
        context,
      );
      throw new AuthException(AuthValidation.USER_ALREADY_VERIFIED_PHONENUMBER);
    }

    const existingToken: VerifyPhoneNumberToken =
      await this.verifyPhoneNumberRepository.findOne({
        where: {
          user: {
            id: user.id,
          },
          expiresAt: MoreThan(new Date()),
        },
      });
    if (!existingToken) {
      this.logger.warn(`Verify phone number token is not existed`, context);
      throw new AuthException(
        AuthValidation.VERIFY_PHONE_NUMBER_TOKEN_NOT_FOUND,
      );
    }

    const result =
      await this.transactionManagerService.execute<VerifyPhoneNumberToken>(
        async (manager) => {
          const zaloOaConnectorConfig = await this.getZaloOaConnectorConfig(
            ZaloOaStrategy.VERIFY_ACCOUNT,
          );

          const zaloOaInitiateSmsRequestDto = new ZaloOaInitiateSmsRequestDto();
          zaloOaInitiateSmsRequestDto.ApiKey = this.zaloOaApiKey;
          zaloOaInitiateSmsRequestDto.SecretKey = this.zaloOaSecretKey;
          zaloOaInitiateSmsRequestDto.OAID = this.zaloOaId;
          zaloOaInitiateSmsRequestDto.Phone = user.phonenumber;
          zaloOaInitiateSmsRequestDto.TempData = {
            otp: existingToken.token,
            time: moment(existingToken.expiresAt).format('HH:mm DD/MM/YYYY'),
          } as ZaloOaInitiateSmsTemplateDataDto;
          zaloOaInitiateSmsRequestDto.TempID = zaloOaConnectorConfig.templateId;
          zaloOaInitiateSmsRequestDto.campaignid =
            zaloOaConnectorConfig.strategy;
          zaloOaInitiateSmsRequestDto.RequestId = getRandomString();

          const backendUrl = await this.getBackendUrl();
          zaloOaInitiateSmsRequestDto.CallbackUrl = `${backendUrl}/zalo-oa-connector/callback/status`;

          const zaloOaInitiateResponse: ZaloOaInitiateSmsResponseDto =
            await this.zaloOaConnectorClient.initiateSms(
              zaloOaInitiateSmsRequestDto,
            );
          if (zaloOaInitiateResponse.ErrorMessage) {
            this.logger.error(
              `Error when initiate sms verify account: ${zaloOaInitiateResponse.ErrorMessage}`,
              context,
            );
            throw new ZaloOaConnectorException(
              ZaloOaConnectorValidation.ERROR_INITIATE_SMS_VERIFY_ACCOUNT,
            );
          }
          if (zaloOaInitiateResponse.SMSID) {
            const zaloOaConnectorHistory = new ZaloOaConnectorHistory();
            Object.assign(zaloOaConnectorHistory, {
              tokenId: existingToken.id,
              smsId: zaloOaInitiateResponse.SMSID,
              requestId: zaloOaInitiateSmsRequestDto.RequestId,
              templateId: zaloOaConnectorConfig.templateId,
              strategy: zaloOaConnectorConfig.strategy,
            } as ZaloOaConnectorHistory);
            await manager.save(zaloOaConnectorHistory);
          }
          const updatedToken = await manager.save(existingToken);
          return updatedToken;
        },
        () => {
          this.logger.log(
            `User ${user.id} resend verify phone number code`,
            context,
          );
        },
        (error) => {
          this.logger.error(
            `Error when resend verify phone number code`,
            error.stack,
            context,
          );
          throw new AuthException(
            AuthValidation.ERROR_CREATE_VERIFY_PHONE_NUMBER_TOKEN,
          );
        },
      );

    return this.mapper.map(
      result,
      VerifyPhoneNumberToken,
      VerifyPhoneNumberResponseDto,
    );
  }

  async confirmPhoneNumberVerificationCode(
    currentUserDto: CurrentUserDto,
    requestData: ConfirmPhoneNumberVerificationCodeRequestDto,
  ): Promise<boolean> {
    const context = `${AuthService.name}.${this.confirmPhoneNumberVerificationCode.name}`;

    const user = await this.userUtils.getUser({
      where: {
        id: currentUserDto.userId ?? IsNull(),
        phonenumber: Not('default-customer'),
      },
    });

    if (user.isVerifiedPhonenumber) {
      this.logger.warn(
        `User ${user.id} already verified phone number`,
        context,
      );
      throw new AuthException(AuthValidation.USER_ALREADY_VERIFIED_PHONENUMBER);
    }

    const existToken = await this.verifyPhoneNumberRepository.findOne({
      where: {
        token: requestData.code,
        // expiresAt: MoreThan(new Date()),
        user: { id: user.id },
      },
    });
    if (!existToken) {
      this.logger.warn(`Verify phone number token is not existed`, context);
      throw new AuthException(
        AuthValidation.VERIFY_PHONE_NUMBER_TOKEN_NOT_FOUND,
      );
    }

    if (new Date().getTime() > existToken.expiresAt.getTime()) {
      this.logger.warn(
        AuthValidation.VERIFY_PHONE_NUMBER_TOKEN_IS_EXPIRED.message,
        context,
      );
      throw new AuthException(
        AuthValidation.VERIFY_PHONE_NUMBER_TOKEN_IS_EXPIRED,
      );
    }

    user.isVerifiedPhonenumber = true;

    // Set token expired after forgot password successfully
    existToken.expiresAt = new Date(Date.now() - 120000); // Set expiry time to the past

    await this.transactionManagerService.execute(
      async (manager) => {
        await manager.save(user);
        await manager.save(existToken);
      },
      () => {
        this.logger.log(
          `User ${user.id} confirmed phone number verification token`,
          context,
        );
      },
      (error) => {
        this.logger.error(
          `Error when confirm phone number verification`,
          error.stack,
          context,
        );
        throw new AuthException(
          AuthValidation.CONFIRM_PHONE_NUMBER_VERIFICATION_ERROR,
        );
      },
    );

    return true;
  }

  /**
   * Handles the avatar upload.
   *
   * This method removes the user's old avatar, uploads a new avatar,
   * updates the user's avatar information in the database, and returns the updated user profile.
   *
   * @param {CurrentUserDto} user - The currently authenticated user's details.
   * @param {Express.Multer.File} file - The new avatar file to be uploaded.
   * @returns {Promise<AuthProfileResponseDto>} The updated user profile mapped to the `AuthProfileResponseDto`.
   */
  async uploadAvatar(
    user: CurrentUserDto,
    file: Express.Multer.File,
  ): Promise<AuthProfileResponseDto> {
    const context = `${AuthService.name}.${this.uploadAvatar.name}`;
    const userEntity = await this.userUtils.getUser({
      where: { id: user.userId },
      relations: ['branch', 'role.permissions.authority.authorityGroup'],
    });

    // Delete old avatar
    await this.fileService.removeFile(userEntity.image);

    // Save new avatar
    const uploadedFile = await this.fileService.uploadFile(file);
    userEntity.image = uploadedFile.name;
    await this.userRepository.save(userEntity);
    this.logger.log(`User ${user.userId} uploaded avatar`, context);

    return this.mapper.map(userEntity, User, AuthProfileResponseDto);
  }

  /**
   * Processes a password change request.
   *
   * This method validates the current user's password against the password provided by the client.
   * If the passwords match, it hashes the new password, updates the user's password in the system, and returns an `AuthProfileResponseDto`
   *
   * @param {CurrentUserDto} user The currently authenticated user's details.
   * @param {AuthChangePasswordRequestDto} requestData the new data to be updated
   * @returns {Promise<AuthProfileResponseDto>}
   */
  async changePassword(
    user: CurrentUserDto,
    requestData: AuthChangePasswordRequestDto,
  ): Promise<AuthProfileResponseDto> {
    const context = `${AuthService.name}.${this.changePassword.name}`;
    const userEntity = await this.userUtils.getUser({
      where: { id: user.userId },
    });

    // Validate same old password
    const isMatch = await bcrypt.compare(
      requestData.oldPassword,
      userEntity.password,
    );
    if (!isMatch) {
      this.logger.warn(
        `User ${user.userId} provided invalid old password`,
        context,
      );
      throw new AuthException(
        AuthValidation.INVALID_OLD_PASSWORD,
        INVALID_OLD_PASSWORD,
      );
    }

    const hashedPass = await bcrypt.hash(
      requestData.newPassword,
      this.saltOfRounds,
    );
    userEntity.password = hashedPass;
    await this.userRepository.save(userEntity);
    this.logger.log(`User ${user.userId} changed password`, context);

    return this.mapper.map(userEntity, User, AuthProfileResponseDto);
  }

  /**
   * Handles user profile updates.
   *
   * This method allows user can update their profile
   *
   * @param {CurrentUserDto} currentUserDto The currently authenticated user's details.
   * @param {UpdateAuthProfileRequestDto} requestData
   * @returns {Promise<AuthProfileResponseDto>} Updated user profile
   * @throws {BranchException} Throw if branch is not found
   * @throws {AuthException} Throw if user is not found
   */
  async updateProfile(
    currentUserDto: CurrentUserDto,
    requestData: UpdateAuthProfileRequestDto,
  ): Promise<AuthProfileResponseDto> {
    const context = `${AuthService.name}.${this.updateProfile.name}`;

    const user = await this.userUtils.getUser({
      where: { id: currentUserDto.userId },
    });

    Object.assign(user, {
      ...requestData,
    });

    if (requestData.branch) {
      const branch = await this.branchRepository.findOne({
        where: { slug: requestData.branch },
      });
      if (!branch) {
        this.logger.warn(`Branch ${requestData.branch} not found`, context);
        throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
      }
      user.branch = branch;
    }

    try {
      const updatedUser = await this.userRepository.save(user);
      this.logger.log(`User ${user.id} updated profile`, context);
      return this.mapper.map(updatedUser, User, AuthProfileResponseDto);
    } catch (error) {
      this.logger.error(
        `Error when updating user: ${error.message}`,
        error.stack,
        context,
      );
      throw new AuthException(AuthValidation.ERROR_UPDATE_USER);
    }
  }

  /**
   * Validate user
   * @param {string} phonenumber
   * @param {string} pass
   * @returns {Promise<User|null>} User if found, null otherwise
   */
  async validateUser(phonenumber: string, pass: string): Promise<User | null> {
    const context = `${AuthService.name}.${this.validateUser.name}`;
    const user = await this.userRepository.findOne({
      where: { phonenumber },
      relations: ['role.permissions.authority.authorityGroup'],
    });
    if (!user) {
      this.logger.warn(`User ${phonenumber} is not found`, `${context}`);
      return null;
    }
    if (user.phonenumber === 'default-customer') {
      this.logger.warn(`User ${phonenumber} is default customer`, context);
      return null;
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      this.logger.warn(
        `User ${phonenumber} provided invalid password`,
        context,
      );
      return null;
    }
    return user;
  }

  /**
   * Generate token base on Auth jwt payload
   * @param {AuthJwtPayload} payload
   * @returns {Promise<LoginAuthResponseDto>} Access token, refresh token, expire time, refresh expire time
   */
  async generateToken(payload: AuthJwtPayload): Promise<LoginAuthResponseDto> {
    const refreshPayload: AuthJwtPayload = {
      sub: payload.sub,
      jti: payload.jti,
      exp: Math.floor(Date.now() / 1000) + this.refeshableDuration,
    };
    return {
      accessToken: this.jwtService.sign({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + this.duration,
      }),
      expireTime: moment().add(this.duration, 'seconds').toString(),
      refreshToken: this.jwtService.sign(refreshPayload),
      expireTimeRefreshToken: moment()
        .add(this.refeshableDuration, 'seconds')
        .toString(),
    };
  }

  /**
   * Handles user authentication
   *
   * This method creates new access token for user that can access any resource in system.
   *
   * @param {LoginAuthRequestDto} loginAuthDto
   * @returns {Promise<LoginAuthResponseDto>} Access token
   * @throws {UnauthorizedException} Invalid credentials
   */
  async login(
    loginAuthDto: LoginAuthRequestDto,
  ): Promise<LoginAuthResponseDto> {
    const user = await this.validateUser(
      loginAuthDto.phonenumber,
      loginAuthDto.password,
    );
    if (!user) {
      throw new AuthException(AuthValidation.INVALID_CREDENTIALS);
    }

    checkActiveUser(user);

    const payload: AuthJwtPayload = {
      sub: user.id,
      jti: uuidv4(),
      scope: this.authUtils.buildScope(user),
    };
    this.logger.log(
      `User ${user.phonenumber} logged in`,
      `${AuthService.name}.${this.login.name}`,
    );
    return this.generateToken(payload);
  }

  /**
   * Handles user registration
   *
   * This method creates new user if user does not exsit in systems
   *
   * @param {RegisterAuthRequestDto} requestData Required data
   * @returns {Promise<RegisterAuthResponseDto>} User registered successfully
   * @throws {AuthException} User already exists
   */
  async register(
    requestData: RegisterAuthRequestDto,
  ): Promise<RegisterAuthResponseDto> {
    const context = `${AuthService.name}.${this.register.name}`;
    const userExists = await this.userRepository.findOne({
      where: {
        phonenumber: requestData.phonenumber,
      },
    });
    if (userExists) {
      this.logger.warn(
        `User ${requestData.phonenumber} already exists`,
        context,
      );
      throw new AuthException(AuthValidation.USER_EXISTS);
    }

    const role = await this.roleRepository.findOne({
      where: {
        name: RoleEnum.Customer,
      },
    });
    if (!role)
      throw new RoleException(
        RoleValidation.ROLE_NOT_FOUND,
        `Role ${RoleEnum.Customer} not found`,
      );

    const user = this.mapper.map(requestData, RegisterAuthRequestDto, User);

    this.logger.warn(`Salt of rounds: ${this.saltOfRounds}`, context);
    const hashedPass = await bcrypt.hash(
      requestData.password,
      this.saltOfRounds,
    );

    Object.assign(user, { password: hashedPass, role });

    const createdUser = await this.transactionManagerService.execute<User>(
      async (manager) => {
        return await manager.save(user);
      },
      (result) => {
        this.logger.log(`User ${result.phonenumber} registered`, context);
      },
      (error) => {
        this.logger.error(
          `Error when register user: ${error.message}`,
          error.stack,
          context,
        );
        throw new AuthException(
          AuthValidation.ERROR_REGISTER_USER,
          error.message,
        );
      },
    );

    if (createdUser) await this.sharedBalanceService.create({ userSlug: createdUser.slug });

    return this.mapper.map(createdUser, User, RegisterAuthResponseDto);
  }

  /**
   * Handle retrieve user profile
   *
   * This method retrieves detailed user information.
   *
   * @param {string} userId
   * @returns {Promise<AuthProfileResponseDto>} User profile
   * @throws {AuthException} Throw if user not found
   */
  async getProfile({
    userId,
  }: {
    userId: string;
  }): Promise<AuthProfileResponseDto> {
    const user = await this.userUtils.getUser({
      where: { id: userId },
      relations: [
        'branch.addressDetail',
        'role.permissions.authority.authorityGroup',
      ],
    });
    return this.mapper.map(user, User, AuthProfileResponseDto);
  }

  /**
   * Handles the refresh access token
   *
   * This method generates new access token if access token is expired.
   *
   * @param {AuthRefreshRequestDto} requestData Required data
   * @returns {Promise<LoginAuthResponseDto>}
   */
  async refresh(
    requestData: AuthRefreshRequestDto,
  ): Promise<LoginAuthResponseDto> {
    const context = `${AuthService.name}.${this.refresh.name}`;
    // Validate access token
    let isExpiredAccessToken = false;
    try {
      this.jwtService.verify(requestData.accessToken);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      isExpiredAccessToken = true;
    }
    if (!isExpiredAccessToken) {
      this.logger.warn(`Access token is not expired`, context);
      throw new UnauthorizedException();
    }

    // Validate refresh token
    let isExpiredRefreshToken = false;
    try {
      this.jwtService.verify(requestData.refreshToken);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      isExpiredRefreshToken = true;
    }
    if (isExpiredRefreshToken) {
      this.logger.warn(`Refresh token is expired`, context);
      throw new UnauthorizedException();
    }

    const payload: AuthJwtPayload = this.jwtService.decode(
      requestData.refreshToken,
    );

    // Get user
    const user = await this.userUtils.getUser({
      where: {
        id: payload.sub,
      },
      relations: ['branch', 'role.permissions.authority.authorityGroup'],
    });
    checkActiveUser(user);

    payload.scope = this.authUtils.buildScope(user);

    return this.generateToken(payload);
  }
}
