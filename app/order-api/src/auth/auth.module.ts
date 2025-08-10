import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './passport/jwt/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { ConfigModule } from '@nestjs/config';
import { AuthProfile } from './auth.mapper';
import { Branch } from 'src/branch/branch.entity';
import { FileModule } from 'src/file/file.module';
import { MailModule } from 'src/mail/mail.module';
import { ForgotPasswordToken } from './entity/forgot-password-token.entity';
import { Role } from 'src/role/role.entity';
import { SystemConfigModule } from 'src/system-config/system-config.module';
import { VerifyEmailToken } from './entity/verify-email-token.entity';
import { DbModule } from 'src/db/db.module';
import { AuthUtils } from './auth.utils';
import { ZaloOaConnectorConfig } from 'src/zalo-oa-connector/entity/zalo-oa-connector.entity';
import { VerifyPhoneNumberToken } from './entity/verify-phone-number-token.entity';
import { ZaloOaConnectorModule } from 'src/zalo-oa-connector/zalo-oa-connector.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
    TypeOrmModule.forFeature([
      User,
      Branch,
      ForgotPasswordToken,
      Role,
      VerifyEmailToken,
      ZaloOaConnectorConfig,
      VerifyPhoneNumberToken,
    ]),
    ConfigModule,
    FileModule,
    MailModule,
    SystemConfigModule,
    DbModule,
    UserModule,
    ZaloOaConnectorModule,
    SharedModule
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, AuthProfile, AuthUtils],
})
export class AuthModule { }
