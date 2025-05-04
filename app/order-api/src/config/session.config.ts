import session from 'express-session';
import * as dotenv from 'dotenv';

dotenv.config();

// const secretSession = process.env.SESSION_SECRET;
const secretSession =
  'aZUkAaMFmhiXeUSGKpHknndw38YIqKtL+3Gy+/70S5sPKSVrVZSvTYFn7LY/2PTd0R1AI+0gRxGU9mepA23Z6g=+';
const nodeEnv = process.env.NODE_ENV;

export const sessionConfig = session({
  secret: secretSession,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: nodeEnv === 'production',
  },
});
