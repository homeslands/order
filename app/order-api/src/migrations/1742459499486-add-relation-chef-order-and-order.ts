import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationChefOrderAndOrder1742459499486
  implements MigrationInterface
{
  name = 'AddRelationChefOrderAndOrder1742459499486';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chef_order_tbl\` ADD \`order_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`chef_order_tbl\` ADD CONSTRAINT \`FK_11fd848ade7ded0a54069067b99\` FOREIGN KEY (\`order_column\`) REFERENCES \`order_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chef_order_tbl\` DROP FOREIGN KEY \`FK_11fd848ade7ded0a54069067b99\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`chef_order_tbl\` DROP COLUMN \`order_column\``,
    );
  }
}
