import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationOrderAndAddressEntity1758184141522
  implements MigrationInterface
{
  name = 'AddRelationOrderAndAddressEntity1758184141522';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD \`delivery_to_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD UNIQUE INDEX \`IDX_696f7e05e01b344fb31aaa0955\` (\`delivery_to_column\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_696f7e05e01b344fb31aaa0955\` ON \`order_tbl\` (\`delivery_to_column\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD CONSTRAINT \`FK_696f7e05e01b344fb31aaa09554\` FOREIGN KEY (\`delivery_to_column\`) REFERENCES \`address_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP FOREIGN KEY \`FK_696f7e05e01b344fb31aaa09554\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_696f7e05e01b344fb31aaa0955\` ON \`order_tbl\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP INDEX \`IDX_696f7e05e01b344fb31aaa0955\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP COLUMN \`delivery_to_column\``,
    );
  }
}
