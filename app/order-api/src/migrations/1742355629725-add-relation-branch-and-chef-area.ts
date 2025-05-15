import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationBranchAndChefArea1742355629725
  implements MigrationInterface
{
  name = 'AddRelationBranchAndChefArea1742355629725';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chef_area_tbl\` ADD \`branch_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`chef_area_tbl\` ADD CONSTRAINT \`FK_70df3e1d427506855cdaefc141c\` FOREIGN KEY (\`branch_column\`) REFERENCES \`branch_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chef_area_tbl\` DROP FOREIGN KEY \`FK_70df3e1d427506855cdaefc141c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`chef_area_tbl\` DROP COLUMN \`branch_column\``,
    );
  }
}
