import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCardOrderSchemaMigration1757060666421 implements MigrationInterface {
    name = 'UpdateCardOrderSchemaMigration1757060666421';
    tableName = 'card_order_tbl';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`card_order_tbl\` ADD \`cancel_by_slug_column\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`card_order_tbl\` ADD \`cancel_at_column\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`card_order_tbl\` ADD \`cancel_by_name_column\` varchar(255) NULL`);

        await queryRunner.query(`
            UPDATE \`${this.tableName}\`
            SET \`cancel_at_column\` = \`deleted_at_column\`,
                \`cancel_by_name_column\` = 'system'
            WHERE \`status_column\` = 'cancelled';
        `);

        await queryRunner.query(`
            UPDATE \`${this.tableName}\` 
            SET \`deleted_at_column\` = NULL
            WHERE \`status_column\` = 'cancelled'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE \`${this.tableName}\`
            SET \`deleted_at_column\` = \`cancel_at_column\`
            WHERE \`status_column\` = 'cancelled' AND \`deleted_at_column\` IS NULL;
        `);

        await queryRunner.query(`ALTER TABLE \`card_order_tbl\` DROP COLUMN \`cancel_by_name_column\``);
        await queryRunner.query(`ALTER TABLE \`card_order_tbl\` DROP COLUMN \`cancel_by_slug_column\``);
        await queryRunner.query(`ALTER TABLE \`card_order_tbl\` DROP COLUMN \`cancel_at_column\``);
    }

}
