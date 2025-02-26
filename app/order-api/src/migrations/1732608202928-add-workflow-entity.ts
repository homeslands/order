import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkflowEntity1732608202928 implements MigrationInterface {
  name = 'AddWorkflowEntity1732608202928';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`workflow_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`workflow_id_column\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_d548cc6a0f95bf068a69121c3d\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_d548cc6a0f95bf068a69121c3d\` ON \`workflow_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`workflow_tbl\``);
  }
}
