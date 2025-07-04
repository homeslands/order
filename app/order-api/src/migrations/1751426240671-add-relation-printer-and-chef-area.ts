import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationPrinterAndChefArea1751426240671
  implements MigrationInterface
{
  name = 'AddRelationPrinterAndChefArea1751426240671';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`printer_tbl\` ADD \`chef_area_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`printer_tbl\` ADD CONSTRAINT \`FK_79dc05d5110b7a3b9eea5da37bc\` FOREIGN KEY (\`chef_area_column\`) REFERENCES \`chef_area_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`printer_tbl\` DROP FOREIGN KEY \`FK_79dc05d5110b7a3b9eea5da37bc\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`printer_tbl\` DROP COLUMN \`chef_area_column\``,
    );
  }
}
