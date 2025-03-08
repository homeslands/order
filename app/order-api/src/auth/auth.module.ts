import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { ConfigModule } from '@nestjs/config';
import { AuthProfile } from './auth.mapper';
import { Branch } from 'src/branch/branch.entity';
import { FileModule } from 'src/file/file.module';
import { MailModule } from 'src/mail/mail.module';
import { ForgotPasswordToken } from './forgot-password-token.entity';
import { Role } from 'src/role/role.entity';
import { SystemConfigModule } from 'src/system-config/system-config.module';
import { VerifyEmailToken } from './verify-email-token.entity';
import { DbModule } from 'src/db/db.module';

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
    ]),
    ConfigModule,
    FileModule,
    MailModule,
    SystemConfigModule,
    DbModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, AuthProfile],
})
export class AuthModule {}
