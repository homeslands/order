import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import {
  AuthChangePasswordRequestDto,
  AuthProfileResponseDto,
  AuthRefreshRequestDto,
  ForgotPasswordRequestDto,
  ForgotPasswordTokenRequestDto,
  LoginAuthRequestDto,
  LoginAuthResponseDto,
  RegisterAuthRequestDto,
  RegisterAuthResponseDto,
  UpdateAuthProfileRequestDto,
  EmailVerificationRequestDto,
  ConFirmEmailVerificationRequestDto,
} from './auth.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AppResponseDto } from 'src/app/app.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { CurrentUser } from '../user/user.decorator';
import { CurrentUserDto } from 'src/user/user.dto';
import { CustomFileInterceptor } from 'src/file/custom-interceptor';

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiResponseWithType({
    type: LoginAuthResponseDto,
    description: 'Login successful',
  })
  async login(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    requestData: LoginAuthRequestDto,
  ): Promise<AppResponseDto<LoginAuthResponseDto>> {
    const result = await this.authService.login(requestData);
    const response = {
      message: 'Login successful',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<LoginAuthResponseDto>;
    return response;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register account' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiResponseWithType({
    type: RegisterAuthResponseDto,
    description: 'Register successful',
  })
  async register(
    @Body(new ValidationPipe({ transform: true }))
    requestData: RegisterAuthRequestDto,
  ) {
    const result = await this.authService.register(requestData);
    const response = {
      message: 'Registration successful',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<RegisterAuthResponseDto>;
    return response;
  }

  @HttpCode(HttpStatus.OK)
  @Post('request-verify-email')
  @ApiOperation({ summary: 'Send request verify email' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiResponseWithType({
    type: EmailVerificationRequestDto,
    description: 'Send request successful',
  })
  async sendVerifyEmail(
    @Body(new ValidationPipe({ transform: true }))
    requestData: EmailVerificationRequestDto,
  ) {
    const result = await this.authService.createVerifyEmail(requestData);
    const response = {
      message: 'Send request successful',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<string>;
    return response;
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('confirm-email-verification')
  @ApiOperation({ summary: 'Confirm email verification' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiResponseWithType({
    type: ConFirmEmailVerificationRequestDto,
    description: 'Confirm email verification successful',
  })
  async confirmVerifyEmail(
    @Body(new ValidationPipe({ transform: true }))
    requestData: ConFirmEmailVerificationRequestDto,
  ) {
    const result = await this.authService.confirmEmailVerification(requestData);
    const response = {
      message: 'Confirm email verification successful',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<boolean>;
    return response;
  }

  @HttpCode(HttpStatus.OK)
  @Get('profile')
  @ApiOperation({ summary: 'Get profile' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiResponseWithType({
    type: AuthProfileResponseDto,
    description: 'Profile retrieved successful',
  })
  async getProfile(
    @CurrentUser(new ValidationPipe({ validateCustomDecorators: true }))
    user: CurrentUserDto,
  ): Promise<AppResponseDto<AuthProfileResponseDto>> {
    const result = await this.authService.getProfile(user);
    return {
      message: 'Profile retrieved successfully',
      status: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as unknown as AppResponseDto<AuthProfileResponseDto>;
  }

  @HttpCode(HttpStatus.OK)
  @Patch('profile')
  @ApiOperation({ summary: 'Update profile' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiResponseWithType({
    type: AuthProfileResponseDto,
    description: 'Profile updated successfully',
  })
  async updateProfile(
    @CurrentUser(new ValidationPipe({ validateCustomDecorators: true }))
    user: CurrentUserDto,
    @Body(new ValidationPipe({ transform: true }))
    requestData: UpdateAuthProfileRequestDto,
  ): Promise<AppResponseDto<AuthProfileResponseDto>> {
    const result = await this.authService.updateProfile(user, requestData);
    return {
      message: 'Profile updated successfully',
      status: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as unknown as AppResponseDto<AuthProfileResponseDto>;
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiResponseWithType({
    type: LoginAuthResponseDto,
    description: 'User refreshed token successfully',
  })
  @Public()
  async refresh(
    @Body(new ValidationPipe({ transform: true }))
    requestData: AuthRefreshRequestDto,
  ): Promise<AppResponseDto<LoginAuthResponseDto>> {
    const result = await this.authService.refresh(requestData);
    return {
      message: 'User refreshed token successfully',
      status: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as unknown as AppResponseDto<LoginAuthResponseDto>;
  }

  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  @ApiOperation({ summary: 'Change password' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiResponseWithType({
    type: AuthProfileResponseDto,
    description: 'Password changed successfully',
  })
  async changePassword(
    @CurrentUser(new ValidationPipe({ validateCustomDecorators: true }))
    user: CurrentUserDto,
    @Body(new ValidationPipe({ transform: true }))
    requestData: AuthChangePasswordRequestDto,
  ): Promise<AppResponseDto<AuthProfileResponseDto>> {
    const result = await this.authService.changePassword(user, requestData);
    return {
      message: 'Password changed successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AuthProfileResponseDto>;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot password' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiResponseWithType({
    type: AuthProfileResponseDto,
    description: 'Password changed successfully',
  })
  async forgotPassword(
    @Body(new ValidationPipe({ transform: true }))
    requestData: ForgotPasswordRequestDto,
  ) {
    await this.authService.forgotPassword(requestData);
    return {
      message: 'Password changed successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password/token')
  @ApiOperation({ summary: 'Create forgot password token' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiResponseWithType({
    type: AuthProfileResponseDto,
    description: 'Token created successfully',
  })
  async createForgotPasswordToken(
    @Body(new ValidationPipe({ transform: true }))
    requestData: ForgotPasswordTokenRequestDto,
  ) {
    const result =
      await this.authService.createForgotPasswordToken(requestData);
    return {
      message: 'Token created successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<string>;
  }

  @Patch('/upload')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Avatar have been uploaded successfully',
    type: AuthProfileResponseDto,
  })
  @ApiOperation({ summary: 'Upload avatar' })
  @ApiResponse({
    status: 200,
    description: 'Avatar have been uploaded successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseInterceptors(
    new CustomFileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser(new ValidationPipe({ validateCustomDecorators: true }))
    user: CurrentUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.authService.uploadAvatar(user, file);
    return {
      message: 'Avatar been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AuthProfileResponseDto>;
  }
}
