import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
// import MySQLStoreFactory from 'express-mysql-session';
// import { config as dotenvConfig } from 'dotenv';

// dotenvConfig({ path: '.env' });

// export const dataOptions = {
//   type: 'mysql',
//   host: process.env.DATABASE_HOST,
//   port: +process.env.DATABASE_PORT,
//   user: process.env.DATABASE_USERNAME,
//   password: process.env.DATABASE_PASSWORD,
//   database: process.env.DATABASE_NAME,
//   createDatabaseTable: true,
//   schema: {
//     tableName: 'sessions_tbl',
//     columnNames: {
//       session_id: 'id_column',
//       expires: 'expires_column',
//       data: 'data_column',
//     },
//   },
// };

// const secretSession = process.env.SESSION_SECRET;
const secretSession =
  'aZUkAaMFmhiXeUSGKpHknndw38YIqKtL+3Gy+/70S5sPKSVrVZSvTYFn7LY/2PTd0R1AI+0gRxGU9mepA23Z6g=+';
// const nodeEnv = process.env.NODE_ENV;

// const MySQLStore = MySQLStoreFactory(session);
// // const sessionStore = new MySQLStore(dataOptions);
// const sessionStore = new MySQLStore(dataOptions, null, (err) => {
//   if (err) {
//     console.error('Session store error:', err);
//   } else {
//     console.log('Session store connected successfully');
//   }
// });

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
  },
  password: process.env.REDIS_PASSWORD,
});
redisClient.connect();

const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'sess:',
});

export const sessionConfig = session({
  secret: secretSession,
  resave: false,
  saveUninitialized: false,
  store: redisStore,
  // store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    // secure: nodeEnv === 'production',
    secure: false,
  },
});
