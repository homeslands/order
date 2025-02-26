import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyOrder1733798295093 implements MigrationInterface {
  name = 'ModifyOrder1733798295093';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD \`table_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD CONSTRAINT \`FK_e0da8437b11db30e8eff8ba6e3e\` FOREIGN KEY (\`table_column\`) REFERENCES \`table_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP FOREIGN KEY \`FK_e0da8437b11db30e8eff8ba6e3e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP COLUMN \`table_column\``,
    );
  }
}
