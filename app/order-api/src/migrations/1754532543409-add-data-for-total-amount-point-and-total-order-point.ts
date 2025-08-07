import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDataForTotalAmountPointAndTotalOrderPoint1754532543409
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE branch_revenue_tbl br
      JOIN (
        SELECT
          branch_id_column,
          DATE(date_column) AS revenue_date,
          SUM(CASE WHEN iv.payment_method_column = 'point' THEN iv.amount_column ELSE 0 END) AS totalAmountPoint,
          COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'point' THEN iv.id_column ELSE NULL END) AS totalOrderPoint
        FROM order_db.invoice_tbl iv
        GROUP BY branch_id_column, DATE(date_column)
      ) iv 
      ON iv.branch_id_column = br.branch_id_column 
      AND iv.revenue_date = DATE(br.date_column)
      SET 
        br.total_amount_point_column = iv.totalAmountPoint,
        br.total_order_point_column = iv.totalOrderPoint;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE branch_revenue_tbl
      SET 
        total_amount_point_column = 0,
        total_order_point_column = 0;
    `);
  }
}
