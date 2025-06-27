import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateGiftCardSchemaMigration1751044920837
  implements MigrationInterface
{
  name = 'UpdateGiftCardSchemaMigration1751044920837';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` ADD \`card_order_slug_column\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` ADD \`used_by_id_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` ADD \`used_by_slug_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` CHANGE \`used_at_column\` \`used_at_column\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` CHANGE \`expired_at_column\` \`expired_at_column\` timestamp NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` DROP COLUMN \`used_by_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` ADD \`used_by_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` ADD CONSTRAINT \`FK_6f7a0d74581f997b52f97f205f3\` FOREIGN KEY (\`used_by_column\`) REFERENCES \`user_tbl\`(\`id_column\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` DROP FOREIGN KEY \`FK_6f7a0d74581f997b52f97f205f3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` DROP COLUMN \`used_by_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` ADD \`used_by_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` CHANGE \`expired_at_column\` \`expired_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` CHANGE \`used_at_column\` \`used_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` DROP COLUMN \`used_by_slug_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` DROP COLUMN \`used_by_id_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` DROP COLUMN \`card_order_slug_column\``,
    );
  }
}
