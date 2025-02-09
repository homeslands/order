import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOrder1738982045147 implements MigrationInterface {
    name = 'UpdateOrder1738982045147'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_tbl\` ADD \`voucher_column\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_tbl\` ADD CONSTRAINT \`FK_941f908221df950160f9c28ae20\` FOREIGN KEY (\`voucher_column\`) REFERENCES \`voucher_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_tbl\` DROP FOREIGN KEY \`FK_941f908221df950160f9c28ae20\``);
        await queryRunner.query(`ALTER TABLE \`order_tbl\` DROP COLUMN \`voucher_column\``);
    }

}
