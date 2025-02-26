import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyOrder1732263932763 implements MigrationInterface {
  name = 'ModifyOrder1732263932763';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD \`payment_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD CONSTRAINT \`FK_c18ab30e5fe911bae91a6c02e47\` FOREIGN KEY (\`payment_column\`) REFERENCES \`payment_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP FOREIGN KEY \`FK_c18ab30e5fe911bae91a6c02e47\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP COLUMN \`payment_column\``,
    );
  }
}
