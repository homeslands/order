import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateBanner1741077402875 implements MigrationInterface {
    name = 'UpdateBanner1741077402875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`banner_tbl\` ADD \`url_column\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`banner_tbl\` ADD \`use_button_url_column\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`banner_tbl\` DROP COLUMN \`use_button_url_column\``);
        await queryRunner.query(`ALTER TABLE \`banner_tbl\` DROP COLUMN \`url_column\``);
    }

}
