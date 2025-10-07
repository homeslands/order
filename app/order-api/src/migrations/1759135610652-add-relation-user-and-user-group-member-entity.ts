import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationUserAndUserGroupMemberEntity1759135610652
  implements MigrationInterface
{
  name = 'AddRelationUserAndUserGroupMemberEntity1759135610652';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_group_member_tbl\` ADD \`user_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_group_member_tbl\` ADD CONSTRAINT \`FK_c6b35ebe32de8f34eff35174670\` FOREIGN KEY (\`user_column\`) REFERENCES \`user_tbl\`(\`id_column\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_group_member_tbl\` DROP FOREIGN KEY \`FK_c6b35ebe32de8f34eff35174670\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_group_member_tbl\` DROP COLUMN \`user_column\``,
    );
  }
}
