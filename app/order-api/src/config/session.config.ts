import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env' });
// import { RedisStore } from 'connect-redis';
// import { createClient } from 'redis';

// const redisClient = createClient({
//   socket: {
//     host: process.env.REDIS_HOST,
//     port: +process.env.REDIS_PORT,
//   },
//   password: process.env.REDIS_PASSWORD,
// });
// redisClient.connect();

// const sessionStore = new RedisStore({
//   client: redisClient,
//   prefix: 'sess:',
// });

export const dataOptions = {
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  createDatabaseTable: true,
  schema: {
    tableName: 'session_tbl',
    columnNames: {
      session_id: 'id_column',
      expires: 'expire_column',
      data: 'data_column',
    },
  },
};

const secretSession = process.env.SESSION_SECRET;
const nodeEnv = process.env.NODE_ENV;

const MySQLStore = MySQLStoreFactory(session);
const sessionStore = new MySQLStore(dataOptions);

export const sessionConfig = session({
  secret: secretSession,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: nodeEnv === 'production',
  },
});
