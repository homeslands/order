import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyWorkflowRelationBranch1732608287179
  implements MigrationInterface
{
  name = 'ModifyWorkflowRelationBranch1732608287179';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`workflow_tbl\` ADD \`branch_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`workflow_tbl\` ADD CONSTRAINT \`FK_88f3da00dbdb10ef59dc0f6eb86\` FOREIGN KEY (\`branch_column\`) REFERENCES \`branch_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`workflow_tbl\` DROP FOREIGN KEY \`FK_88f3da00dbdb10ef59dc0f6eb86\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`workflow_tbl\` DROP COLUMN \`branch_column\``,
    );
  }
}
