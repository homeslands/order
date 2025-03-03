import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyTrackingEntity1733102741042 implements MigrationInterface {
  name = 'ModifyTrackingEntity1733102741042';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_0fec0873c97f173319b38957bf\` ON \`order_tbl\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tracking_tbl\` CHANGE \`work_flow_instance_column\` \`workflow_execution_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tracking_tbl\` DROP COLUMN \`workflow_execution_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tracking_tbl\` ADD \`workflow_execution_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tracking_tbl\` CHANGE \`status_column\` \`status_column\` varchar(255) NOT NULL DEFAULT 'PENDING'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tracking_tbl\` CHANGE \`status_column\` \`status_column\` varchar(255) NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tracking_tbl\` DROP COLUMN \`workflow_execution_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tracking_tbl\` ADD \`workflow_execution_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tracking_tbl\` CHANGE \`workflow_execution_column\` \`work_flow_instance_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_0fec0873c97f173319b38957bf\` ON \`order_tbl\` (\`invoice_column\`)`,
    );
  }
}
