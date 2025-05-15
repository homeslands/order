import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChefAreaEntity1742355106103 implements MigrationInterface {
  name = 'AddChefAreaEntity1742355106103';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`chef_area_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`description_column\` varchar(255) NULL, UNIQUE INDEX \`IDX_ca129713de6bbebe9f8badc0f5\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_ca129713de6bbebe9f8badc0f5\` ON \`chef_area_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`chef_area_tbl\``);
  }
}
