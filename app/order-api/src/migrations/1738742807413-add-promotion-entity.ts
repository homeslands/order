import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPromotionEntity1738742807413 implements MigrationInterface {
  name = 'AddPromotionEntity1738742807413';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`promotion_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`title_column\` varchar(255) NOT NULL, \`description_column\` text NULL, \`start_date_column\` datetime NOT NULL, \`end_date_column\` datetime NOT NULL, \`type_column\` varchar(255) NOT NULL, \`value_column\` int NOT NULL, \`branch_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_e4f4279c7e9d221622231232d3\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`promotion_tbl\` ADD CONSTRAINT \`FK_efb267e51c2c80767e04e17773c\` FOREIGN KEY (\`branch_column\`) REFERENCES \`branch_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`promotion_tbl\` DROP FOREIGN KEY \`FK_efb267e51c2c80767e04e17773c\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e4f4279c7e9d221622231232d3\` ON \`promotion_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`promotion_tbl\``);
  }
}
