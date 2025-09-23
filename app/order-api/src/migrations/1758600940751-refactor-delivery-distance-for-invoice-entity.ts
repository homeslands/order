import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorDeliveryDistanceForInvoiceEntity1758600940751
  implements MigrationInterface
{
  name = 'RefactorDeliveryDistanceForInvoiceEntity1758600940751';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` MODIFY \`delivery_distance_column\` decimal(5,1) NOT NULL DEFAULT '0.0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` MODIFY \`delivery_distance_column\` int NOT NULL DEFAULT '0'`,
    );
  }
}
