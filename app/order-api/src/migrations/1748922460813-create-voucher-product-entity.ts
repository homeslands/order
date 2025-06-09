import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVoucherProductEntity1748922460813
  implements MigrationInterface
{
  name = 'CreateVoucherProductEntity1748922460813';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`voucher_product_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`voucher_column\` varchar(36) NULL, \`product_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_c2abc2bd95962fb8b4c5835c39\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_product_tbl\` ADD CONSTRAINT \`FK_59880b4ae3d442666755266d79e\` FOREIGN KEY (\`voucher_column\`) REFERENCES \`voucher_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_product_tbl\` ADD CONSTRAINT \`FK_6b406ccb46211eb0b3aa0627c12\` FOREIGN KEY (\`product_column\`) REFERENCES \`product_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher_product_tbl\` DROP FOREIGN KEY \`FK_6b406ccb46211eb0b3aa0627c12\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_product_tbl\` DROP FOREIGN KEY \`FK_59880b4ae3d442666755266d79e\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c2abc2bd95962fb8b4c5835c39\` ON \`voucher_product_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`voucher_product_tbl\``);
  }
}
