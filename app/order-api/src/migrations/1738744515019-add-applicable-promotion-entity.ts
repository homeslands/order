import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApplicablePromotionEntity1738744515019
  implements MigrationInterface
{
  name = 'AddApplicablePromotionEntity1738744515019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`applicable_promotion_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`type_column\` varchar(255) NOT NULL, \`applicable_id_column\` varchar(255) NOT NULL, \`promotion_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_7aa210406efa9ad41876dbece2\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`applicable_promotion_tbl\` ADD CONSTRAINT \`FK_8aec04ade552df984c6d3354c60\` FOREIGN KEY (\`promotion_column\`) REFERENCES \`promotion_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`applicable_promotion_tbl\` DROP FOREIGN KEY \`FK_8aec04ade552df984c6d3354c60\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_7aa210406efa9ad41876dbece2\` ON \`applicable_promotion_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`applicable_promotion_tbl\``);
  }
}
