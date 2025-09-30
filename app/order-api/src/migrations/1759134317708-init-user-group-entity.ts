import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUserGroupEntity1759134317708 implements MigrationInterface {
  name = 'InitUserGroupEntity1759134317708';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user_group_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`description_column\` varchar(255) NULL, \`is_active_column\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_a66be0c9ab13e88b7a62d3a75d\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_a66be0c9ab13e88b7a62d3a75d\` ON \`user_group_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`user_group_tbl\``);
  }
}
