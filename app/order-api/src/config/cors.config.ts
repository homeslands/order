import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsOptions: CorsOptions = {
  origin: [
    'http://localhost:5173',
    'https://sandbox.order.cmsiot.net',
    'https://trendcoffee.net',
    'https://coffee.homeslands.net',
  ],
  methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
