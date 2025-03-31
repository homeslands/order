export const getAllRevenueClause = `
    SELECT 
        DATE(order_tbl.created_at_column) AS date,
        SUM(payment_tbl.amount_column) AS totalAmount, -- final order in payment
        SUM(order_tbl.subtotal_column) AS totalFinalAmountOrder, -- final order
        SUM(order_tbl.original_subtotal_column) AS totalOriginalAmountOrder, -- original order
        SUM(order_item_tbl.original_subtotal_column) AS totalOriginalOrderItemAmount, -- original order item
        SUM(order_item_tbl.subtotal_column) AS totalFinalOrderItemAmount, -- final order item
        COUNT(order_tbl.id_column) AS totalOrder
    FROM 
        order_db.payment_tbl AS payment_tbl
    INNER JOIN 
        order_db.order_tbl AS order_tbl 
    ON 
        payment_tbl.id_column = order_tbl.payment_column
    INNER JOIN
        order_db.order_item_tbl AS order_item_tbl
    ON
        order_tbl.id_column = order_item_tbl.order_column
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
        SUM(payment_tbl.amount_column) AS totalAmount, -- final order in payment
        SUM(order_tbl.subtotal_column) AS totalFinalAmountOrder, -- final order
        SUM(order_tbl.original_subtotal_column) AS totalOriginalAmountOrder, -- original order
        SUM(order_item_tbl.original_subtotal_column) AS totalOriginalOrderItemAmount, -- original order item
        SUM(order_item_tbl.subtotal_column) AS totalFinalOrderItemAmount, -- final order item
        COUNT(order_tbl.id_column) AS totalOrder
    FROM 
        order_db.payment_tbl AS payment_tbl
    INNER JOIN 
        order_db.order_tbl AS order_tbl 
    ON 
        payment_tbl.id_column = order_tbl.payment_column
    INNER JOIN
        order_db.order_item_tbl AS order_item_tbl
    ON
        order_tbl.id_column = order_item_tbl.order_column
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
        SUM(payment_tbl.amount_column) AS totalAmount, -- final order in payment
        SUM(order_tbl.subtotal_column) AS totalFinalAmountOrder, -- final order
        SUM(order_tbl.original_subtotal_column) AS totalOriginalAmountOrder, -- original order
        SUM(order_item_tbl.original_subtotal_column) AS totalOriginalOrderItemAmount, -- original order item
        SUM(order_item_tbl.subtotal_column) AS totalFinalOrderItemAmount, -- final order item
        COUNT(order_tbl.id_column) AS totalOrder
    FROM 
        order_db.payment_tbl AS payment_tbl
    INNER JOIN 
        order_db.order_tbl AS order_tbl 
    ON 
        payment_tbl.id_column = order_tbl.payment_column
    INNER JOIN
        order_db.order_item_tbl AS order_item_tbl
    ON
        order_tbl.id_column = order_item_tbl.order_column
    WHERE 
        payment_tbl.status_code_column = 'completed'
    AND
        order_tbl.created_at_column >= CURRENT_DATE() - INTERVAL 1 DAY
    AND
        order_tbl.created_at_column < CURRENT_DATE()
    GROUP BY 
        DATE(order_tbl.created_at_column)
`;

export const getSpecificRangeRevenueClause = `
    SELECT 
        DATE(order_tbl.created_at_column) AS date,
        SUM(payment_tbl.amount_column) AS totalAmount, -- final order in payment
        SUM(order_tbl.subtotal_column) AS totalFinalAmountOrder, -- final order
        SUM(order_tbl.original_subtotal_column) AS totalOriginalAmountOrder, -- original order
        SUM(order_item_tbl.original_subtotal_column) AS totalOriginalOrderItemAmount, -- original order item
        SUM(order_item_tbl.subtotal_column) AS totalFinalOrderItemAmount, -- final order item
        COUNT(order_tbl.id_column) AS totalOrder
    FROM 
        order_db.payment_tbl AS payment_tbl
    INNER JOIN 
        order_db.order_tbl AS order_tbl 
    ON 
        payment_tbl.id_column = order_tbl.payment_column
    INNER JOIN
        order_db.order_item_tbl AS order_item_tbl
    ON
        order_tbl.id_column = order_item_tbl.order_column
    WHERE 
        payment_tbl.status_code_column = 'completed'
    AND
        order_tbl.created_at_column >= ?
    AND
        order_tbl.created_at_column < ?
    GROUP BY 
        DATE(order_tbl.created_at_column)
    ORDER BY
        DATE(date) ASC
`;
