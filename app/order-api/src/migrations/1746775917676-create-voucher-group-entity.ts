import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVoucherGroupEntity1746775917676
  implements MigrationInterface
{
  name = 'CreateVoucherGroupEntity1746775917676';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`voucher_group_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`title_column\` varchar(255) NOT NULL, \`description_column\` varchar(255) NULL, UNIQUE INDEX \`IDX_23c7d3e16745d0b981a4f6ab52\` (\`slug_column\`), UNIQUE INDEX \`IDX_c84fa41d5c200c38689391fedb\` (\`title_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_c84fa41d5c200c38689391fedb\` ON \`voucher_group_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_23c7d3e16745d0b981a4f6ab52\` ON \`voucher_group_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`voucher_group_tbl\``);
  }
}
