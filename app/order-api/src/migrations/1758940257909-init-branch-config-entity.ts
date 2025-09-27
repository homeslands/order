import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitBranchConfigEntity1758940257909 implements MigrationInterface {
  name = 'InitBranchConfigEntity1758940257909';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`branch_config_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`key_column\` varchar(255) NOT NULL, \`value_column\` varchar(255) NOT NULL, \`description_column\` text NULL, UNIQUE INDEX \`IDX_51fb182884db306c6e2eac04dd\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_51fb182884db306c6e2eac04dd\` ON \`branch_config_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`branch_config_tbl\``);
  }
}
