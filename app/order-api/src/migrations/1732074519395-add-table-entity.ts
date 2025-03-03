import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTableEntity1732074519395 implements MigrationInterface {
  name = 'AddTableEntity1732074519395';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`table_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`location_column\` varchar(255) NULL, \`is_empty_column\` tinyint NOT NULL DEFAULT 1, \`branch_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_12d0212c13591220442ee61eda\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`table_tbl\` ADD CONSTRAINT \`FK_a1d6fda07ea757ded7887501694\` FOREIGN KEY (\`branch_column\`) REFERENCES \`branch_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`table_tbl\` DROP FOREIGN KEY \`FK_a1d6fda07ea757ded7887501694\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_12d0212c13591220442ee61eda\` ON \`table_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`table_tbl\``);
  }
}
