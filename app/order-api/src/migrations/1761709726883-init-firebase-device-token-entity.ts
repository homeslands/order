import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitFirebaseDeviceTokenEntity1761709726883
  implements MigrationInterface
{
  name = 'InitFirebaseDeviceTokenEntity1761709726883';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`firebase_device_token_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`token_column\` varchar(255) NOT NULL, \`platform_column\` varchar(255) NOT NULL, \`user_agent_column\` varchar(255) NULL, UNIQUE INDEX \`IDX_05d09b7e059dcfec05d10a8a00\` (\`slug_column\`), UNIQUE INDEX \`IDX_b95dcb8327b478bbd4bf1adf06\` (\`token_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_b95dcb8327b478bbd4bf1adf06\` ON \`firebase_device_token_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_05d09b7e059dcfec05d10a8a00\` ON \`firebase_device_token_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`firebase_device_token_tbl\``);
  }
}
