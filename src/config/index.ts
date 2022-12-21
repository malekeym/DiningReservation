import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const ADMINS: Array<number> = JSON.parse(process.env.ADMINS || '[]');
export const ADMIN_TIMEOUT_MESSAGE = Number(process.env.ADMIN_TIMEOUT_MESSAGE) || 10_000;
export const {
  NODE_ENV,
  PORT,
  REDIS_URL,
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  DB_USER,
  DB_PASSWORD,
  BOT_TOKEN,
  SECRET_SALT,
  INITIALIZATION_VECTOR,
} = process.env;
