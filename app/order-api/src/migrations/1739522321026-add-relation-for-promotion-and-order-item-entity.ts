import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRelationForPromotionAndOrderItemEntity1739522321026 implements MigrationInterface {
    name = 'AddRelationForPromotionAndOrderItemEntity1739522321026'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_item_tbl\` ADD \`promotion_column\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_item_tbl\` ADD CONSTRAINT \`FK_efa4c84737d2b4e77c9b7515a5f\` FOREIGN KEY (\`promotion_column\`) REFERENCES \`promotion_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_item_tbl\` DROP FOREIGN KEY \`FK_efa4c84737d2b4e77c9b7515a5f\``);
        await queryRunner.query(`ALTER TABLE \`order_item_tbl\` DROP COLUMN \`promotion_column\``);
    }

}
