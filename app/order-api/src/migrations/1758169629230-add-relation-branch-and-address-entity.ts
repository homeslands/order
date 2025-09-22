import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationBranchAndAddressEntity1758169629230
  implements MigrationInterface
{
  name = 'AddRelationBranchAndAddressEntity1758169629230';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_tbl\` ADD \`address_detail_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_tbl\` ADD UNIQUE INDEX \`IDX_e260afe9fc81c83d9e7cc24ed4\` (\`address_detail_column\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_e260afe9fc81c83d9e7cc24ed4\` ON \`branch_tbl\` (\`address_detail_column\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_tbl\` ADD CONSTRAINT \`FK_e260afe9fc81c83d9e7cc24ed4c\` FOREIGN KEY (\`address_detail_column\`) REFERENCES \`address_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_tbl\` DROP FOREIGN KEY \`FK_e260afe9fc81c83d9e7cc24ed4c\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_e260afe9fc81c83d9e7cc24ed4\` ON \`branch_tbl\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_tbl\` DROP INDEX \`IDX_e260afe9fc81c83d9e7cc24ed4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_tbl\` DROP COLUMN \`address_detail_column\``,
    );
  }
}
