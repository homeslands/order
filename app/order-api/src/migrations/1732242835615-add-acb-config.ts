import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAcbConfig1732242835615 implements MigrationInterface {
  name = 'AddAcbConfig1732242835615';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`acb_connector_config_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`x_provider_id_column\` varchar(255) NULL, \`x_service_column\` varchar(255) NULL, \`x_owner_number_column\` varchar(255) NULL, \`x_owner_type_column\` varchar(255) NULL, \`beneficiary_name_column\` varchar(255) NULL, \`virtual_account_prefix_column\` varchar(255) NULL, UNIQUE INDEX \`IDX_ce3f15797d7cda48b4306cf5bd\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_ce3f15797d7cda48b4306cf5bd\` ON \`acb_connector_config_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`acb_connector_config_tbl\``);
  }
}
