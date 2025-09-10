import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCostPriceForVariantEntity1757469008434
  implements MigrationInterface
{
  name = 'AddCostPriceForVariantEntity1757469008434';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`variant_tbl\` ADD \`cost_price_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`variant_tbl\` DROP COLUMN \`cost_price_column\``,
    );
  }
}
