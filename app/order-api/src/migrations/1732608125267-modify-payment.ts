import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyPayment1732608125267 implements MigrationInterface {
  name = 'ModifyPayment1732608125267';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP FOREIGN KEY \`FK_c18ab30e5fe911bae91a6c02e47\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD UNIQUE INDEX \`IDX_c18ab30e5fe911bae91a6c02e4\` (\`payment_column\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_c18ab30e5fe911bae91a6c02e4\` ON \`order_tbl\` (\`payment_column\`)`,
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
      `DROP INDEX \`REL_c18ab30e5fe911bae91a6c02e4\` ON \`order_tbl\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP INDEX \`IDX_c18ab30e5fe911bae91a6c02e4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD CONSTRAINT \`FK_c18ab30e5fe911bae91a6c02e47\` FOREIGN KEY (\`payment_column\`) REFERENCES \`payment_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
