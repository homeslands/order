export const getAllProductAnalysisClause = `
    SELECT
        b.id_column AS branchId,
        DATE(o.created_at_column) AS orderDate,
        v.product_column AS productId,
        SUM(oi.quantity_column) AS totalProducts
    FROM 
        order_db.variant_tbl AS v
    INNER JOIN order_db.order_item_tbl AS oi
        ON v.id_column = oi.variant_column
    INNER JOIN order_db.order_tbl AS o
        ON oi.order_column = o.id_column
    INNER JOIN order_db.branch_tbl AS b
        ON o.branch_column = b.id_column
    INNER JOIN order_db.payment_tbl AS p
        ON o.payment_column = p.id_column
    WHERE
        p.status_code_column = 'completed'
    GROUP BY
        b.id_column,
        DATE(o.created_at_column),
        v.product_column
    ORDER BY
        Date(o.created_at_column) ASC
`;

export const getYesterdayProductAnalysisClause = `
    SELECT
        b.id_column AS branchId,
        DATE(o.created_at_column) AS orderDate,
        v.product_column AS productId,
        SUM(oi.quantity_column) AS totalProducts
    FROM 
        order_db.variant_tbl AS v
    INNER JOIN order_db.order_item_tbl AS oi
        ON v.id_column = oi.variant_column
    INNER JOIN order_db.order_tbl AS o
        ON oi.order_column = o.id_column
    INNER JOIN order_db.branch_tbl AS b
        ON o.branch_column = b.id_column
    INNER JOIN order_db.payment_tbl AS p
        ON o.payment_column = p.id_column
    WHERE
        o.created_at_column >= CURRENT_DATE() - INTERVAL 1 DAY
    AND
        o.created_at_column < CURRENT_DATE()
    AND 
        p.status_code_column = 'completed'
    GROUP BY
        b.id_column,
        DATE(o.created_at_column),
        v.product_column
`;

// COUNT(v.product_column) AS totalProducts
