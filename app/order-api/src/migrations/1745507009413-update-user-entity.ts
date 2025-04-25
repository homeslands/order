import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserEntity1745507009413 implements MigrationInterface {
  name = 'UpdateUserEntity1745507009413';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` CHANGE \`first_name_column\` \`first_name_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` CHANGE \`last_name_column\` \`last_name_column\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` CHANGE \`last_name_column\` \`last_name_column\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` CHANGE \`first_name_column\` \`first_name_column\` varchar(255) NOT NULL`,
    );
  }
}
