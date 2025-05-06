import { registerAs } from '@nestjs/config';
import {config} from 'dotenv';
config({path: '.env.development'});
import { DataSource, DataSourceOptions } from "typeorm";

const isDocker = process.env.NODE_ENV === 'docker';

export const AppDataSource: DataSourceOptions = ({
    type: 'postgres',
    host: isDocker ? process.env.DB_HOST_DOCKER : process.env.DB_HOST,
    port: parseInt(isDocker ? process.env.DB_PORT_DOCKER : process.env.DB_PORT!, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: process.env.NODE_ENV === 'docker' ? false : false,
    entities: ['dist/**/*.entity{.ts,.js}'], // busca automaticamente todas las entidades del proyecto.
    migrations: ['dist/migrations/*{.ts,.js}'],
    subscribers: [],
    ssl: true
});

export const postgresDataSourceConfig = registerAs(
    'postgres', //Este es un alias que puede tener cualquier nombre.
    () => AppDataSource,
);

export const PostgresDataSource = new DataSource(AppDataSource);