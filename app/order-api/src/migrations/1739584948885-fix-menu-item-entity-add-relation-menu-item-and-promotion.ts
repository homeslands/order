import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixMenuItemEntityAddRelationMenuItemAndPromotion1739584948885
  implements MigrationInterface
{
  name = 'FixMenuItemEntityAddRelationMenuItemAndPromotion1739584948885';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` DROP COLUMN \`promotion_id_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` DROP COLUMN \`promotion_value_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` ADD \`promotion_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` ADD CONSTRAINT \`FK_01dcf2df911787c9a3e849a689a\` FOREIGN KEY (\`promotion_column\`) REFERENCES \`promotion_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` DROP FOREIGN KEY \`FK_01dcf2df911787c9a3e849a689a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` DROP COLUMN \`promotion_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` ADD \`promotion_value_column\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` ADD \`promotion_id_column\` varchar(255) NULL`,
    );
  }
}
