import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'], // Path to compiled entity files
  migrations: ['dist/migration/*.js'],     // Path to compiled migration files
  synchronize: false,                      // Avoid auto-sync in production
});
