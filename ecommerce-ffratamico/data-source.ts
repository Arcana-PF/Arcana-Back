import {config} from 'dotenv';
config({path: '.env.development'});
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    entities: ['dist/**/*.entity{.ts,.js}'], // busca automaticamente todas las entidades del proyecto.
    migrations: ['src/migrations/*.ts'],
});