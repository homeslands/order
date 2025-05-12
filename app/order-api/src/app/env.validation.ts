import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsNotEmpty()
  DATABASE_USERNAME: string;

  @IsNotEmpty()
  DATABASE_PASSWORD: string;

  @IsNotEmpty()
  DATABASE_NAME: string;

  @IsNotEmpty()
  DATABASE_HOST: string;

  @IsNumber()
  DATABASE_PORT: number;

  @IsNotEmpty()
  VERSION: string;

  @IsNumber()
  @Min(10)
  @Max(12)
  SALT_ROUNDS: number;

  @IsNumber()
  DURATION: number;

  @IsNumber()
  REFRESHABLE_DURATION: number;

  @IsNotEmpty()
  ACB_CLIENT_ID: string;

  @IsNotEmpty()
  ACB_CLIENT_SECRET: string;

  @IsNotEmpty()
  MAIL_HOST: string;

  @IsNotEmpty()
  MAIL_USER: string;

  @IsNotEmpty()
  MAIL_FROM: string;

  @IsNotEmpty()
  MAIL_PASSWORD: string;

  @IsNotEmpty()
  SESSION_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
