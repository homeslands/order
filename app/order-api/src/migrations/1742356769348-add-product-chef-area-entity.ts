import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductChefAreaEntity1742356769348
  implements MigrationInterface
{
  name = 'AddProductChefAreaEntity1742356769348';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`product_chef_area_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`product_column\` varchar(36) NULL, \`chef_area_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_6b8e40058a873179dd979dfd76\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_chef_area_tbl\` ADD CONSTRAINT \`FK_bf83c48a5eba38a76baccdd9f05\` FOREIGN KEY (\`product_column\`) REFERENCES \`product_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_chef_area_tbl\` ADD CONSTRAINT \`FK_f8a8dfc805ad53001efb6d7d71e\` FOREIGN KEY (\`chef_area_column\`) REFERENCES \`chef_area_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_chef_area_tbl\` DROP FOREIGN KEY \`FK_f8a8dfc805ad53001efb6d7d71e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_chef_area_tbl\` DROP FOREIGN KEY \`FK_bf83c48a5eba38a76baccdd9f05\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_6b8e40058a873179dd979dfd76\` ON \`product_chef_area_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`product_chef_area_tbl\``);
  }
}
