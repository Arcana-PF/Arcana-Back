import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneratedMigration1746320725999 implements MigrationInterface {
    name = 'GeneratedMigration1746320725999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_administrator_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "administrator" "public"."users_administrator_enum" NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "administrator"`);
        await queryRunner.query(`DROP TYPE "public"."users_administrator_enum"`);
    }

}
