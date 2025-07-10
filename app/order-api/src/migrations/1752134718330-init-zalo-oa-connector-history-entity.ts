import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitZaloOaConnectorHistoryEntity1752134718330
  implements MigrationInterface
{
  name = 'InitZaloOaConnectorHistoryEntity1752134718330';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`zalo_oa_connector_history_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`token_id_column\` varchar(255) NOT NULL, \`sms_id_column\` varchar(255) NOT NULL, \`request_id_column\` varchar(255) NOT NULL, \`template_id_column\` varchar(255) NOT NULL, \`strategy_column\` varchar(255) NOT NULL, \`status_column\` varchar(255) NULL, \`type_column\` varchar(255) NULL, \`telecom_provider_column\` varchar(255) NULL, \`error_info_column\` varchar(255) NULL, UNIQUE INDEX \`IDX_6a6b90c65db4e269f30ceaf7c0\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_6a6b90c65db4e269f30ceaf7c0\` ON \`zalo_oa_connector_history_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`zalo_oa_connector_history_tbl\``);
  }
}
