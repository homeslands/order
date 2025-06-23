import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderIdBankTransferForPaymentEntity1750322467737
  implements MigrationInterface
{
  name = 'AddOrderIdBankTransferForPaymentEntity1750322467737';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payment_tbl\` ADD \`order_id_bank_transfer_column\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payment_tbl\` DROP COLUMN \`order_id_bank_transfer_column\``,
    );
  }
}
