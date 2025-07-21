import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsOptions = (allowedOrigins: string) => {
  const origins = allowedOrigins.split(',') || [];
  return {
    origin: [...origins],
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  } as CorsOptions;
};
