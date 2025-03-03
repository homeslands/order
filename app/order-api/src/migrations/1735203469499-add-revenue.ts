import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRevenue1735203469499 implements MigrationInterface {
  name = 'AddRevenue1735203469499';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`revenue_tbl\` DROP COLUMN \`branch_id_column\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`revenue_tbl\` ADD \`branch_id_column\` varchar(255) NOT NULL`,
    );
  }
}
