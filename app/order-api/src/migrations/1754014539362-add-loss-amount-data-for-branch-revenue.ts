import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLossAmountDataForBranchRevenue1754014539362
  implements MigrationInterface
{
  name = 'AddLossAmountDataForBranchRevenue1754014539362';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE branch_revenue_tbl br
        JOIN (
            SELECT
                branch_id_column,
                DATE(date_column) AS revenue_date,
                SUM(loss_column) AS total_loss
            FROM order_db.invoice_tbl
            GROUP BY branch_id_column, DATE(date_column)
        ) iv 
        ON iv.branch_id_column = br.branch_id_column 
        AND iv.revenue_date = DATE(br.date_column)
        SET br.loss_amount_column = iv.total_loss;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE branch_revenue_tbl
      SET loss_amount_column = 0;
    `);
  }
}
