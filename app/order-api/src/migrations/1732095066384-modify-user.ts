import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyUser1732095066384 implements MigrationInterface {
  name = 'ModifyUser1732095066384';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` ADD \`image_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` ADD \`branch_id_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` ADD CONSTRAINT \`FK_23858adffbd4ab6e7c8998e1354\` FOREIGN KEY (\`branch_id_column\`) REFERENCES \`branch_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` DROP FOREIGN KEY \`FK_23858adffbd4ab6e7c8998e1354\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` DROP COLUMN \`branch_id_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` DROP COLUMN \`image_column\``,
    );
  }
}
