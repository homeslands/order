import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitVoucherPaymentMethodEntity1756106496272
  implements MigrationInterface
{
  name = 'InitVoucherPaymentMethodEntity1756106496272';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`voucher_payment_method_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`payment_method_column\` varchar(255) NOT NULL, \`voucher_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_c62460cb46a1bc5fadce1a5476\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_payment_method_tbl\` ADD CONSTRAINT \`FK_edb56af47f2020cc1a18317080b\` FOREIGN KEY (\`voucher_column\`) REFERENCES \`voucher_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher_payment_method_tbl\` DROP FOREIGN KEY \`FK_edb56af47f2020cc1a18317080b\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c62460cb46a1bc5fadce1a5476\` ON \`voucher_payment_method_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`voucher_payment_method_tbl\``);
  }
}
