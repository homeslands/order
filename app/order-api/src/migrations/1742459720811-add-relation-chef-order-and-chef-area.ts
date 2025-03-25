import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationChefOrderAndChefArea1742459720811
  implements MigrationInterface
{
  name = 'AddRelationChefOrderAndChefArea1742459720811';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chef_order_tbl\` ADD \`chef_area_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`chef_order_tbl\` ADD CONSTRAINT \`FK_57623a01f4c8d4695afa648cf5b\` FOREIGN KEY (\`chef_area_column\`) REFERENCES \`chef_area_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chef_order_tbl\` DROP FOREIGN KEY \`FK_57623a01f4c8d4695afa648cf5b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`chef_order_tbl\` DROP COLUMN \`chef_area_column\``,
    );
  }
}
