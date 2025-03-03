import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRole1733470750502 implements MigrationInterface {
  name = 'AddRole1733470750502';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`role_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`description_column\` tinytext NOT NULL, UNIQUE INDEX \`IDX_6bd2be4fe4d2853ae1af05a063\` (\`slug_column\`), UNIQUE INDEX \`IDX_4218ccecf3d0a11080f2e8a8d8\` (\`name_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` ADD \`role_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` ADD CONSTRAINT \`FK_ab858d693156c6db97be6a070d8\` FOREIGN KEY (\`role_column\`) REFERENCES \`role_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` DROP FOREIGN KEY \`FK_ab858d693156c6db97be6a070d8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` DROP COLUMN \`role_column\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_4218ccecf3d0a11080f2e8a8d8\` ON \`role_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_6bd2be4fe4d2853ae1af05a063\` ON \`role_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`role_tbl\``);
  }
}
