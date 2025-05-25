import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLossPropertyForPaymentEntity1747384142960
  implements MigrationInterface
{
  name = 'AddLossPropertyForPaymentEntity1747384142960';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payment_tbl\` ADD \`loss_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payment_tbl\` DROP COLUMN \`loss_column\``,
    );
  }
}
