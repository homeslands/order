import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVoucher1738809867163 implements MigrationInterface {
  name = 'CreateVoucher1738809867163';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`voucher_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`code_column\` varchar(255) NOT NULL, \`title_column\` varchar(255) NOT NULL, \`description_column\` varchar(255) NULL, \`max_usage_column\` int NOT NULL, \`min_order_value_column\` int NOT NULL DEFAULT '0', \`start_date_column\` datetime NOT NULL, \`end_date_column\` datetime NOT NULL, UNIQUE INDEX \`IDX_b96104224304d04ca3fba7c02f\` (\`slug_column\`), UNIQUE INDEX \`IDX_c54f532ec43d72ca0035230f56\` (\`code_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_c54f532ec43d72ca0035230f56\` ON \`voucher_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_b96104224304d04ca3fba7c02f\` ON \`voucher_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`voucher_tbl\``);
  }
}
