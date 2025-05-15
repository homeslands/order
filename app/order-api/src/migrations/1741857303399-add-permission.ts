import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPermission1741857303399 implements MigrationInterface {
  name = 'AddPermission1741857303399';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`permission_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`role_column\` varchar(36) NULL, \`authority_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_7f6780c50caf9d345e78b5068d\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`permission_tbl\` ADD CONSTRAINT \`FK_84eee2fc3e836ce762f3a4f7c10\` FOREIGN KEY (\`role_column\`) REFERENCES \`role_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`permission_tbl\` ADD CONSTRAINT \`FK_3085490c8c6da3735a675c97f6b\` FOREIGN KEY (\`authority_column\`) REFERENCES \`authority_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`permission_tbl\` DROP FOREIGN KEY \`FK_3085490c8c6da3735a675c97f6b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`permission_tbl\` DROP FOREIGN KEY \`FK_84eee2fc3e836ce762f3a4f7c10\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_7f6780c50caf9d345e78b5068d\` ON \`permission_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`permission_tbl\``);
  }
}
