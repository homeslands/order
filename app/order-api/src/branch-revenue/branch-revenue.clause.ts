export const getCurrentBranchRevenueClause = `
    SELECT 
        order_tbl.branch_column AS branchId,
        DATE(order_tbl.created_at_column) AS date,
        SUM(payment_tbl.amount_column) AS totalAmount,
        SUM(order_tbl.subtotal_column) AS totalFinalAmountOrder, -- final order
        SUM(order_tbl.original_subtotal_column) AS totalOriginalAmountOrder, -- original order
        SUM(order_item_tbl.original_subtotal_column) AS totalOriginalOrderItemAmount, -- original order item
        SUM(order_item_tbl.subtotal_column) AS totalFinalOrderItemAmount, -- final order item
        COUNT(DISTINCT order_tbl.id_column) AS totalOrder
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
        order_tbl.branch_column,
        DATE(order_tbl.created_at_column)
`;

export const getYesterdayBranchRevenueClause = `
    SELECT 
        order_tbl.branch_column AS branchId,
        DATE(order_tbl.created_at_column) AS date,
        SUM(payment_tbl.amount_column) AS totalAmount,
        SUM(order_tbl.subtotal_column) AS totalFinalAmountOrder, -- final order
        SUM(order_tbl.original_subtotal_column) AS totalOriginalAmountOrder, -- original order
        SUM(order_item_tbl.original_subtotal_column) AS totalOriginalOrderItemAmount, -- original order item
        SUM(order_item_tbl.subtotal_column) AS totalFinalOrderItemAmount, -- final order item
        COUNT(DISTINCT order_tbl.id_column) AS totalOrder
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
        order_tbl.branch_column,
        DATE(order_tbl.created_at_column)
`;

export const getAllBranchRevenueClause = `
    SELECT 
        order_tbl.branch_column AS branchId,
        DATE(order_tbl.created_at_column) AS date,
        SUM(payment_tbl.amount_column) AS totalAmount,
        SUM(order_tbl.subtotal_column) AS totalFinalAmountOrder, -- final order
        SUM(order_tbl.original_subtotal_column) AS totalOriginalAmountOrder, -- original order
        SUM(order_item_tbl.original_subtotal_column) AS totalOriginalOrderItemAmount, -- original order item
        SUM(order_item_tbl.subtotal_column) AS totalFinalOrderItemAmount, -- final order item
        COUNT(DISTINCT order_tbl.id_column) AS totalOrder
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
        order_tbl.branch_column,
        DATE(order_tbl.created_at_column)
    ORDER BY
        order_tbl.branch_column,
        DATE(order_tbl.created_at_column) ASC
`;

export const getSpecificRangeBranchRevenueClause = `
    SELECT 
        order_tbl.branch_column AS branchId,
        DATE(order_tbl.created_at_column) AS date,
        SUM(payment_tbl.amount_column) AS totalAmount,
        SUM(order_tbl.subtotal_column) AS totalFinalAmountOrder, -- final order
        SUM(order_tbl.original_subtotal_column) AS totalOriginalAmountOrder, -- original order
        SUM(order_item_tbl.original_subtotal_column) AS totalOriginalOrderItemAmount, -- original order item
        SUM(order_item_tbl.subtotal_column) AS totalFinalOrderItemAmount, -- final order item
        COUNT(DISTINCT order_tbl.id_column) AS totalOrder
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
        order_tbl.branch_column,
        DATE(order_tbl.created_at_column)
    ORDER BY
        order_tbl.branch_column,
        DATE(date) ASC
`;
