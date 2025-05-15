export const getCurrentBranchRevenueClause = `
    WITH 
        OrderItemSummary AS (
            SELECT 
                order_column AS order_id,
                SUM(original_subtotal_column) AS totalOriginalOrderItemAmount,
                SUM(subtotal_column) AS totalFinalOrderItemAmount
            FROM order_db.order_item_tbl
            GROUP BY order_column
        )
    SELECT 
        o.branch_column AS branchId,
        DATE(o.created_at_column) AS date,
        SUM(p.amount_column) AS totalAmount,
        -- Total amount for bank
        SUM(CASE WHEN p.payment_method_column = 'bank-transfer' THEN p.amount_column ELSE 0 END) AS totalAmountBank,
        -- Total amount for cash
        SUM(CASE WHEN p.payment_method_column = 'cash' THEN p.amount_column ELSE 0 END) AS totalAmountCash,
        -- Total amount for internal
        SUM(CASE WHEN p.payment_method_column = 'internal' THEN p.amount_column ELSE 0 END) AS totalAmountInternal,
        SUM(o.subtotal_column) AS totalFinalAmountOrder,
        SUM(o.original_subtotal_column) AS totalOriginalAmountOrder,
        SUM(oi.totalOriginalOrderItemAmount) AS totalOriginalOrderItemAmount,
        SUM(oi.totalFinalOrderItemAmount) AS totalFinalOrderItemAmount,
        COUNT(DISTINCT o.id_column) AS totalOrder,
        COUNT(DISTINCT CASE WHEN p.payment_method_column = 'cash' THEN o.id_column ELSE NULL END) AS totalOrderCash,
        COUNT(DISTINCT CASE WHEN p.payment_method_column = 'bank-transfer' THEN o.id_column ELSE NULL END) AS totalOrderBank,
        COUNT(DISTINCT CASE WHEN p.payment_method_column = 'internal' THEN o.id_column ELSE NULL END) AS totalOrderInternal
    FROM 
        order_db.order_tbl AS o
    LEFT JOIN 
        order_db.payment_tbl AS p ON o.payment_column = p.id_column
    LEFT JOIN 
        OrderItemSummary AS oi ON o.id_column = oi.order_id
    WHERE 
        o.created_at_column >= CURRENT_DATE()
    AND 
        o.created_at_column < CURRENT_DATE() + INTERVAL 1 DAY
    AND
        p.status_code_column = 'completed'
    AND
        o.deleted_at_column IS NULL
    GROUP BY 
        o.branch_column, DATE(o.created_at_column)
    ORDER BY 
        o.branch_column, DATE(o.created_at_column) ASC;
`;

export const getYesterdayBranchRevenueClause = `
    WITH 
        OrderItemSummary AS (
            SELECT 
                order_column AS order_id,
                SUM(original_subtotal_column) AS totalOriginalOrderItemAmount,
                SUM(subtotal_column) AS totalFinalOrderItemAmount
            FROM order_db.order_item_tbl
            GROUP BY order_column
        )
    SELECT 
        o.branch_column AS branchId,
        DATE(o.created_at_column) AS date,
        SUM(p.amount_column) AS totalAmount,
        -- Total amount for bank
        SUM(CASE WHEN p.payment_method_column = 'bank-transfer' THEN p.amount_column ELSE 0 END) AS totalAmountBank,
        -- Total amount for cash
        SUM(CASE WHEN p.payment_method_column = 'cash' THEN p.amount_column ELSE 0 END) AS totalAmountCash,
        -- Total amount for internal
        SUM(CASE WHEN p.payment_method_column = 'internal' THEN p.amount_column ELSE 0 END) AS totalAmountInternal,
        SUM(o.subtotal_column) AS totalFinalAmountOrder,
        SUM(o.original_subtotal_column) AS totalOriginalAmountOrder,
        SUM(oi.totalOriginalOrderItemAmount) AS totalOriginalOrderItemAmount,
        SUM(oi.totalFinalOrderItemAmount) AS totalFinalOrderItemAmount,
        COUNT(DISTINCT o.id_column) AS totalOrder,
        COUNT(DISTINCT CASE WHEN p.payment_method_column = 'cash' THEN o.id_column ELSE NULL END) AS totalOrderCash,
        COUNT(DISTINCT CASE WHEN p.payment_method_column = 'bank-transfer' THEN o.id_column ELSE NULL END) AS totalOrderBank,
        COUNT(DISTINCT CASE WHEN p.payment_method_column = 'internal' THEN o.id_column ELSE NULL END) AS totalOrderInternal

    FROM 
        order_db.order_tbl AS o
    LEFT JOIN 
        order_db.payment_tbl AS p ON o.payment_column = p.id_column
    LEFT JOIN 
        OrderItemSummary AS oi ON o.id_column = oi.order_id
    WHERE 
        o.created_at_column >= CURRENT_DATE() - INTERVAL 1 DAY
    AND 
        o.created_at_column < CURRENT_DATE()
    AND
        p.status_code_column = 'completed'
    AND
        o.deleted_at_column IS NULL
    GROUP BY 
        o.branch_column, DATE(o.created_at_column)
    ORDER BY 
        o.branch_column, DATE(o.created_at_column) ASC;
`;

export const getAllBranchRevenueClause = `
    WITH 
        OrderItemSummary AS (
            SELECT 
                order_column AS order_id,
                SUM(original_subtotal_column) AS totalOriginalOrderItemAmount,
                SUM(subtotal_column) AS totalFinalOrderItemAmount
            FROM order_db.order_item_tbl
            GROUP BY order_column
        )
    SELECT 
        o.branch_column AS branchId,
        DATE(o.created_at_column) AS date,
        SUM(p.amount_column) AS totalAmount,
        -- Total amount for bank
        SUM(CASE WHEN p.payment_method_column = 'bank-transfer' THEN p.amount_column ELSE 0 END) AS totalAmountBank,
        -- Total amount for cash
        SUM(CASE WHEN p.payment_method_column = 'cash' THEN p.amount_column ELSE 0 END) AS totalAmountCash,
        -- Total amount for internal
        SUM(CASE WHEN p.payment_method_column = 'internal' THEN p.amount_column ELSE 0 END) AS totalAmountInternal,
        SUM(o.subtotal_column) AS totalFinalAmountOrder,
        SUM(o.original_subtotal_column) AS totalOriginalAmountOrder,
        SUM(oi.totalOriginalOrderItemAmount) AS totalOriginalOrderItemAmount,
        SUM(oi.totalFinalOrderItemAmount) AS totalFinalOrderItemAmount,
        COUNT(DISTINCT o.id_column) AS totalOrder,
        COUNT(DISTINCT CASE WHEN p.payment_method_column = 'cash' THEN o.id_column ELSE NULL END) AS totalOrderCash,
        COUNT(DISTINCT CASE WHEN p.payment_method_column = 'bank-transfer' THEN o.id_column ELSE NULL END) AS totalOrderBank,
        COUNT(DISTINCT CASE WHEN p.payment_method_column = 'internal' THEN o.id_column ELSE NULL END) AS totalOrderInternal
    FROM 
        order_db.order_tbl AS o
    LEFT JOIN 
        order_db.payment_tbl AS p ON o.payment_column = p.id_column
    LEFT JOIN 
        OrderItemSummary AS oi ON o.id_column = oi.order_id
    WHERE
        p.status_code_column = 'completed'
    AND
        o.deleted_at_column IS NULL
    GROUP BY 
        o.branch_column, DATE(o.created_at_column)
    ORDER BY 
        o.branch_column, DATE(o.created_at_column) ASC;
`;

export const getSpecificRangeBranchRevenueClause = `
    WITH 
        OrderItemSummary AS (
            SELECT 
                order_column AS order_id,
                SUM(original_subtotal_column) AS totalOriginalOrderItemAmount,
                SUM(subtotal_column) AS totalFinalOrderItemAmount
            FROM order_db.order_item_tbl
            GROUP BY order_column
        )
    SELECT 
        o.branch_column AS branchId,
        DATE(o.created_at_column) AS date,
        SUM(p.amount_column) AS totalAmount,
        -- Total amount for bank
		SUM(CASE WHEN p.payment_method_column = 'bank-transfer' THEN p.amount_column ELSE 0 END) AS totalAmountBank,
        -- Total amount for cash
		SUM(CASE WHEN p.payment_method_column = 'cash' THEN p.amount_column ELSE 0 END) AS totalAmountCash,
        -- Total amount for internal
		SUM(CASE WHEN p.payment_method_column = 'internal' THEN p.amount_column ELSE 0 END) AS totalAmountInternal,
        SUM(o.subtotal_column) AS totalFinalAmountOrder,
        SUM(o.original_subtotal_column) AS totalOriginalAmountOrder,
        SUM(oi.totalOriginalOrderItemAmount) AS totalOriginalOrderItemAmount,
        SUM(oi.totalFinalOrderItemAmount) AS totalFinalOrderItemAmount,
        COUNT(DISTINCT o.id_column) AS totalOrder,
        COUNT(DISTINCT CASE WHEN p.payment_method_column = 'cash' THEN o.id_column ELSE NULL END) AS totalOrderCash,
        COUNT(DISTINCT CASE WHEN p.payment_method_column = 'bank-transfer' THEN o.id_column ELSE NULL END) AS totalOrderBank,
        COUNT(DISTINCT CASE WHEN p.payment_method_column = 'internal' THEN o.id_column ELSE NULL END) AS totalOrderInternal
    FROM 
        order_db.order_tbl AS o
    LEFT JOIN 
        order_db.payment_tbl AS p ON o.payment_column = p.id_column
    LEFT JOIN 
        OrderItemSummary AS oi ON o.id_column = oi.order_id
    WHERE 
        o.created_at_column >= ?
    AND 
        o.created_at_column < ?
    AND
        p.status_code_column = 'completed'
    AND
        o.deleted_at_column IS NULL
    GROUP BY 
        o.branch_column, DATE(o.created_at_column)
    ORDER BY 
        o.branch_column, DATE(o.created_at_column) ASC;
`;

export const getSpecificRangeBranchRevenueByHourClause = `
    WITH OrderItemSummary AS (
        SELECT 
            order_column AS order_id,
            SUM(original_subtotal_column) AS totalOriginalOrderItemAmount,
            SUM(subtotal_column) AS totalFinalOrderItemAmount
        FROM order_db.order_item_tbl
        GROUP BY order_column
    )
    SELECT 
        o.branch_column AS branchId,
        DATE_FORMAT(o.created_at_column, '%Y-%m-%d %H:00:00') AS date,
        SUM(p.amount_column) AS totalAmount,
        -- Total amount for bank
        SUM(CASE WHEN p.payment_method_column = 'bank-transfer' THEN p.amount_column ELSE 0 END) AS totalAmountBank,
        -- Total amount for cash
        SUM(CASE WHEN p.payment_method_column = 'cash' THEN p.amount_column ELSE 0 END) AS totalAmountCash,
        -- Total amount for internal
        SUM(CASE WHEN p.payment_method_column = 'internal' THEN p.amount_column ELSE 0 END) AS totalAmountInternal,
        SUM(o.subtotal_column) AS totalFinalAmountOrder,
        SUM(o.original_subtotal_column) AS totalOriginalAmountOrder,
        SUM(oi.totalOriginalOrderItemAmount) AS totalOriginalOrderItemAmount,
        SUM(oi.totalFinalOrderItemAmount) AS totalFinalOrderItemAmount,
        COUNT(DISTINCT o.id_column) AS totalOrder,
        COUNT(DISTINCT CASE WHEN p.payment_method_column = 'cash' THEN o.id_column ELSE NULL END) AS totalOrderCash,
        COUNT(DISTINCT CASE WHEN p.payment_method_column = 'bank-transfer' THEN o.id_column ELSE NULL END) AS totalOrderBank,
        COUNT(DISTINCT CASE WHEN p.payment_method_column = 'internal' THEN o.id_column ELSE NULL END) AS totalOrderInternal
    FROM 
        order_db.order_tbl AS o
    LEFT JOIN 
        order_db.payment_tbl AS p ON o.payment_column = p.id_column
    LEFT JOIN 
        OrderItemSummary AS oi ON o.id_column = oi.order_id
    WHERE 
        o.created_at_column >= ?
        AND o.created_at_column < ?
        AND p.status_code_column = 'completed'
        AND o.branch_column = ?
        AND o.deleted_at_column IS NULL
    GROUP BY 
        DATE_FORMAT(o.created_at_column, '%Y-%m-%d %H:00:00')
    ORDER BY 
        DATE_FORMAT(o.created_at_column, '%Y-%m-%d %H:00:00') ASC;
    `;
