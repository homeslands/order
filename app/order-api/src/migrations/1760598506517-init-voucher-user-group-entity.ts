import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitVoucherUserGroupEntity1760598506517
  implements MigrationInterface
{
  name = 'InitVoucherUserGroupEntity1760598506517';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`voucher_user_group_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`voucher_column\` varchar(36) NULL, \`user_group_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_d04c6b108c7fd25905ec1ec65c\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` ADD \`is_user_group_column\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_user_group_tbl\` ADD CONSTRAINT \`FK_d184aaee8c5cc8b46a63ce9f0c4\` FOREIGN KEY (\`voucher_column\`) REFERENCES \`voucher_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_user_group_tbl\` ADD CONSTRAINT \`FK_2caace6490284dded84a28c3d20\` FOREIGN KEY (\`user_group_column\`) REFERENCES \`user_group_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher_user_group_tbl\` DROP FOREIGN KEY \`FK_2caace6490284dded84a28c3d20\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_user_group_tbl\` DROP FOREIGN KEY \`FK_d184aaee8c5cc8b46a63ce9f0c4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` DROP COLUMN \`is_user_group_column\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_d04c6b108c7fd25905ec1ec65c\` ON \`voucher_user_group_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`voucher_user_group_tbl\``);
  }
}
