import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCardVersionSchemaMigration1754359435458 implements MigrationInterface {
    name = 'AddCardVersionSchemaMigration1754359435458'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`card_tbl\` ADD \`version_column\` int NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`card_tbl\` DROP COLUMN \`version_column\``);
    }

}
