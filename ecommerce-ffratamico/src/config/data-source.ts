import { registerAs } from '@nestjs/config';
import {config} from 'dotenv';
config({path: '.env.development'});
import { DataSource, DataSourceOptions } from "typeorm";

export const AppDataSource: DataSourceOptions = ({
    type: 'postgres',
    host: process.env.RENDER_DB_HOST,
    port: parseInt(process.env.RENDER_DB_PORT!, 10),
    username: process.env.RENDER_DB_USERNAME,
    password: process.env.RENDER_DB_PASSWORD,
    database: process.env.RENDER_DB_NAME,
    synchronize: false,
    dropSchema: false,
    entities: ['dist/**/*.entity{.js,.ts}'], // busca automaticamente todas las entidades del proyecto.
    migrations: ['dist/migrations/*{.ts,.js}'],
    ssl: true,
});

export const postgresDataSourceConfig = registerAs(
    'postgres', //Este es un alias que puede tener cualquier nombre.
    () => AppDataSource,
);

export const PostgresDataSource = new DataSource(AppDataSource);