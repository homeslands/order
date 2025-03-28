import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotification1743148244877 implements MigrationInterface {
  name = 'CreateNotification1743148244877';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`notification_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`message_column\` varchar(255) NOT NULL, \`is_read_column\` tinyint NOT NULL DEFAULT 0, \`sender_id_column\` varchar(255) NULL, \`receiver_id_column\` varchar(255) NOT NULL, \`receiver_name_column\` varchar(255) NULL, \`sender_name_column\` varchar(255) NULL, \`type_column\` varchar(255) NOT NULL, \`metadata_column\` json NULL, UNIQUE INDEX \`IDX_e9e8349d3beb9b1ab765cf45fa\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_e9e8349d3beb9b1ab765cf45fa\` ON \`notification_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`notification_tbl\``);
  }
}
