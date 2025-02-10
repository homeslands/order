import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPromotionValuePromotionIdForMenuItemEntity1738898081959 implements MigrationInterface {
    name = 'AddPromotionValuePromotionIdForMenuItemEntity1738898081959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`menu_item_tbl\` ADD \`promotion_value_column\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`menu_item_tbl\` ADD \`promotion_id_column\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`menu_item_tbl\` DROP COLUMN \`promotion_id_column\``);
        await queryRunner.query(`ALTER TABLE \`menu_item_tbl\` DROP COLUMN \`promotion_value_column\``);
    }

}
