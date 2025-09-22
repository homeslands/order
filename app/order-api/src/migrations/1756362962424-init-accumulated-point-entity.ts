import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAccumulatedPointEntity1756362962424
  implements MigrationInterface
{
  name = 'InitAccumulatedPointEntity1756362962424';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`accumulated_point_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`total_points_column\` int NOT NULL DEFAULT '0', UNIQUE INDEX \`IDX_c1aa7c43cf197a6497c9792d45\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_c1aa7c43cf197a6497c9792d45\` ON \`accumulated_point_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`accumulated_point_tbl\``);
  }
}
