import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUserGroupMemberEntity1759134677701
  implements MigrationInterface
{
  name = 'InitUserGroupMemberEntity1759134677701';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user_group_member_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`is_active_column\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_05e1f745c100dcc34db29f8eeb\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_05e1f745c100dcc34db29f8eeb\` ON \`user_group_member_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`user_group_member_tbl\``);
  }
}
