import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationVoucherAndVoucherGroup1746778537642
  implements MigrationInterface
{
  name = 'AddRelationVoucherAndVoucherGroup1746778537642';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` ADD \`voucher_group_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` ADD CONSTRAINT \`FK_391d003d2ffb5d8264407600d08\` FOREIGN KEY (\`voucher_group_column\`) REFERENCES \`voucher_group_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` DROP FOREIGN KEY \`FK_391d003d2ffb5d8264407600d08\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` DROP COLUMN \`voucher_group_column\``,
    );
  }
}
