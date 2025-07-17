import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitZaloOaConfigEntity1752111859258 implements MigrationInterface {
  name = 'InitZaloOaConfigEntity1752111859258';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`zalo_oa_connector_config_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`strategy_column\` varchar(255) NOT NULL, \`template_id_column\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_05c4762637454701e41e9861bc\` (\`slug_column\`), UNIQUE INDEX \`IDX_09b56539b3235fa8daf3275582\` (\`strategy_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_09b56539b3235fa8daf3275582\` ON \`zalo_oa_connector_config_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_05c4762637454701e41e9861bc\` ON \`zalo_oa_connector_config_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`zalo_oa_connector_config_tbl\``);
  }
}
