import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvoiceInvoiceitem1732786760096
  implements MigrationInterface
{
  name = 'CreateInvoiceInvoiceitem1732786760096';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_c18ab30e5fe911bae91a6c02e4\` ON \`order_tbl\``,
    );
    await queryRunner.query(
      `CREATE TABLE \`invoice_item_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`quantity_column\` int NOT NULL, \`price_column\` int NOT NULL, \`product_name_column\` varchar(255) NOT NULL, \`size_column\` varchar(255) NOT NULL, \`total_column\` int NOT NULL, \`invoice_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_75a9552c416ccfa1953742d5a3\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`invoice_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`payment_method_column\` varchar(255) NOT NULL, \`amount_column\` int NOT NULL, \`status_column\` varchar(255) NOT NULL, \`logo_column\` varchar(255) NOT NULL, \`table_name_column\` varchar(255) NOT NULL, \`branch_address_column\` varchar(255) NOT NULL, \`cashier_column\` varchar(255) NOT NULL, \`customer_column\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_1043c2b9ccea9edbaf3ca9a50f\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD \`invoice_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD UNIQUE INDEX \`IDX_0fec0873c97f173319b38957bf\` (\`invoice_column\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_0fec0873c97f173319b38957bf\` ON \`order_tbl\` (\`invoice_column\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_item_tbl\` ADD CONSTRAINT \`FK_d6cb86b67ebf04d48bfe45cb73e\` FOREIGN KEY (\`invoice_column\`) REFERENCES \`invoice_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD CONSTRAINT \`FK_0fec0873c97f173319b38957bf8\` FOREIGN KEY (\`invoice_column\`) REFERENCES \`invoice_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP FOREIGN KEY \`FK_0fec0873c97f173319b38957bf8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_item_tbl\` DROP FOREIGN KEY \`FK_d6cb86b67ebf04d48bfe45cb73e\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_0fec0873c97f173319b38957bf\` ON \`order_tbl\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP INDEX \`IDX_0fec0873c97f173319b38957bf\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP COLUMN \`invoice_column\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_1043c2b9ccea9edbaf3ca9a50f\` ON \`invoice_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`invoice_tbl\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_75a9552c416ccfa1953742d5a3\` ON \`invoice_item_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`invoice_item_tbl\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_c18ab30e5fe911bae91a6c02e4\` ON \`order_tbl\` (\`payment_column\`)`,
    );
  }
}
