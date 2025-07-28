import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationBranchAndInvoiceAreaEntity1753609558344
  implements MigrationInterface
{
  name = 'AddRelationBranchAndInvoiceAreaEntity1753609558344';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_area_tbl\` ADD \`branch_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_area_tbl\` ADD CONSTRAINT \`FK_af1003bbf4e02d2430f9e65a23f\` FOREIGN KEY (\`branch_column\`) REFERENCES \`branch_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_area_tbl\` DROP FOREIGN KEY \`FK_af1003bbf4e02d2430f9e65a23f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_area_tbl\` DROP COLUMN \`branch_column\``,
    );
  }
}
