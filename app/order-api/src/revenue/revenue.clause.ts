export const getAllRevenueClause = `
    SELECT 
        DATE(order_tbl.created_at_column) AS date,
        SUM(payment_tbl.amount_column) AS totalAmount,
        COUNT(order_tbl.id_column) AS totalOrder
    FROM 
        order_db.payment_tbl AS payment_tbl
    INNER JOIN 
        order_db.order_tbl AS order_tbl 
    ON 
        payment_tbl.id_column = order_tbl.payment_column
    WHERE 
        payment_tbl.status_code_column = 'completed'
    GROUP BY 
        DATE(order_tbl.created_at_column)
    ORDER BY
        DATE(order_tbl.created_at_column) ASC
`;

export const getCurrentRevenueClause = `
    SELECT 
        DATE(order_tbl.created_at_column) AS date,
        SUM(payment_tbl.amount_column) AS totalAmount,
        COUNT(order_tbl.id_column) AS totalOrder
    FROM 
        order_db.payment_tbl AS payment_tbl
    INNER JOIN 
        order_db.order_tbl AS order_tbl 
    ON 
        payment_tbl.id_column = order_tbl.payment_column
    WHERE 
        payment_tbl.status_code_column = 'completed'
    AND
        order_tbl.created_at_column >= CURRENT_DATE()
    AND
        order_tbl.created_at_column < CURRENT_DATE() + INTERVAL 1 DAY
    GROUP BY 
        DATE(order_tbl.created_at_column)
`;

export const getYesterdayRevenueClause = `
    SELECT 
        DATE(order_tbl.created_at_column) AS date,
        SUM(payment_tbl.amount_column) AS totalAmount,
        COUNT(order_tbl.id_column) AS totalOrder
    FROM 
        order_db.payment_tbl AS payment_tbl
    INNER JOIN 
        order_db.order_tbl AS order_tbl 
    ON 
        payment_tbl.id_column = order_tbl.payment_column
    WHERE 
        payment_tbl.status_code_column = 'completed'
    AND
        order_tbl.created_at_column >= CURRENT_DATE() - INTERVAL 1 DAY
    AND
        order_tbl.created_at_column < CURRENT_DATE()
    GROUP BY 
        DATE(order_tbl.created_at_column)
`;
