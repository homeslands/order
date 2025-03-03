import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrackingTable1732334802562 implements MigrationInterface {
  name = 'AddTrackingTable1732334802562';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`tracking_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`work_flow_instance_column\` varchar(255) NULL, \`status_column\` varchar(255) NOT NULL DEFAULT 'pending', UNIQUE INDEX \`IDX_1c65056b521674455bbb7b35cf\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_1c65056b521674455bbb7b35cf\` ON \`tracking_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`tracking_tbl\``);
  }
}
