import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationUserGroupAndUserGroupMemberEntity1759135283923
  implements MigrationInterface
{
  name = 'AddRelationUserGroupAndUserGroupMemberEntity1759135283923';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_group_member_tbl\` ADD \`user_group_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_group_member_tbl\` ADD CONSTRAINT \`FK_fbe3a91fdc37dd340195e244e06\` FOREIGN KEY (\`user_group_column\`) REFERENCES \`user_group_tbl\`(\`id_column\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_group_member_tbl\` DROP FOREIGN KEY \`FK_fbe3a91fdc37dd340195e244e06\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_group_member_tbl\` DROP COLUMN \`user_group_column\``,
    );
  }
}
