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

export const getCurrentBranchRevenueFromInvoiceClause = `
    WITH InvoiceItemSummary AS (
        SELECT 
            ii.invoice_column AS invoice_id,
            SUM(ii.price_column * ii.quantity_column) AS totalOriginalOrderItemAmount,
            SUM(ii.total_column) AS totalFinalOrderItemAmount,
            SUM(ii.voucher_value_column) AS totalVoucherValueOrderItemAmount
        FROM order_db.invoice_item_tbl ii
        JOIN order_db.invoice_tbl iv ON iv.id_column = ii.invoice_column
        WHERE iv.date_column >= CURRENT_DATE()
            AND iv.date_column < CURRENT_DATE() + INTERVAL 1 DAY
            AND iv.deleted_at_column IS NULL
        GROUP BY ii.invoice_column
        )
    SELECT 
        iv.branch_id_column AS branchId,
        DATE(iv.date_column) AS date,
        SUM(iv.amount_column) AS totalAmount,
        -- Total amount for bank
        SUM(CASE WHEN iv.payment_method_column = 'bank-transfer' THEN iv.amount_column ELSE 0 END) AS totalAmountBank,
        -- Total amount for cash
        SUM(CASE WHEN iv.payment_method_column = 'cash' THEN iv.amount_column ELSE 0 END) AS totalAmountCash,
        -- Total amount for internal
        SUM(CASE WHEN iv.payment_method_column = 'internal' THEN iv.amount_column ELSE 0 END) AS totalAmountInternal,
        -- Total amount for point
        SUM(CASE WHEN iv.payment_method_column = 'point' THEN iv.amount_column ELSE 0 END) AS totalAmountPoint,
        -- Total amount for credit card
        SUM(CASE WHEN iv.payment_method_column = 'credit-card' THEN iv.amount_column ELSE 0 END) AS totalAmountCreditCard,
        SUM(iv.amount_column) AS totalFinalAmountOrder,
        SUM(iv.voucher_value_column) AS totalVoucherValueOrderAmount,
        SUM(ivi.totalOriginalOrderItemAmount) AS totalOriginalAmountOrder,
        SUM(iv.loss_column) AS totalLossAmount,
        SUM(ivi.totalOriginalOrderItemAmount) AS totalOriginalOrderItemAmount,
        SUM(ivi.totalFinalOrderItemAmount) AS totalFinalOrderItemAmount,
        SUM(ivi.totalVoucherValueOrderItemAmount) AS totalVoucherValueOrderItemAmount,
        SUM(iv.accumulated_points_to_use_column) AS totalAccumulatedPointsToUse,
        SUM(iv.delivery_fee_column) AS totalDeliveryFee,
        COUNT(DISTINCT iv.id_column) AS totalOrder,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'cash' THEN iv.id_column ELSE NULL END) AS totalOrderCash,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'bank-transfer' THEN iv.id_column ELSE NULL END) AS totalOrderBank,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'internal' THEN iv.id_column ELSE NULL END) AS totalOrderInternal,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'point' THEN iv.id_column ELSE NULL END) AS totalOrderPoint,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'credit-card' THEN iv.id_column ELSE NULL END) AS totalOrderCreditCard
    FROM 
        order_db.invoice_tbl AS iv
    LEFT JOIN 
        InvoiceItemSummary AS ivi ON iv.id_column = ivi.invoice_id
    WHERE 
        iv.date_column >= CURRENT_DATE()
		AND iv.date_column < CURRENT_DATE() + INTERVAL 1 DAY
        AND iv.deleted_at_column IS NULL
        AND iv.status_column = 'paid'
    GROUP BY 
        iv.branch_id_column, DATE(iv.date_column)
    ORDER BY 
        iv.branch_id_column, DATE(iv.date_column) ASC;
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

export const getYesterdayBranchRevenueFromInvoiceClause = `
    WITH InvoiceItemSummary AS (
        SELECT 
            ii.invoice_column AS invoice_id,
            SUM(ii.price_column * ii.quantity_column) AS totalOriginalOrderItemAmount,
            SUM(ii.total_column) AS totalFinalOrderItemAmount,
            SUM(ii.voucher_value_column) AS totalVoucherValueOrderItemAmount
        FROM order_db.invoice_item_tbl ii
        JOIN order_db.invoice_tbl iv ON iv.id_column = ii.invoice_column
        WHERE iv.date_column >= CURRENT_DATE() - INTERVAL 1 DAY
            AND iv.date_column < CURRENT_DATE()
            AND iv.deleted_at_column IS NULL
        GROUP BY ii.invoice_column
        )
    SELECT 
        iv.branch_id_column AS branchId,
        DATE(iv.date_column) AS date,
        SUM(iv.amount_column) AS totalAmount,
        -- Total amount for bank
        SUM(CASE WHEN iv.payment_method_column = 'bank-transfer' THEN iv.amount_column ELSE 0 END) AS totalAmountBank,
        -- Total amount for cash
        SUM(CASE WHEN iv.payment_method_column = 'cash' THEN iv.amount_column ELSE 0 END) AS totalAmountCash,
        -- Total amount for internal
        SUM(CASE WHEN iv.payment_method_column = 'internal' THEN iv.amount_column ELSE 0 END) AS totalAmountInternal,
        -- Total amount for point
        SUM(CASE WHEN iv.payment_method_column = 'point' THEN iv.amount_column ELSE 0 END) AS totalAmountPoint,
        -- Total amount for credit card
        SUM(CASE WHEN iv.payment_method_column = 'credit-card' THEN iv.amount_column ELSE 0 END) AS totalAmountCreditCard,
        SUM(iv.amount_column) AS totalFinalAmountOrder,
        SUM(iv.voucher_value_column) AS totalVoucherValueOrderAmount,
        SUM(ivi.totalOriginalOrderItemAmount) AS totalOriginalAmountOrder,
        SUM(iv.loss_column) AS totalLossAmount,
        SUM(ivi.totalOriginalOrderItemAmount) AS totalOriginalOrderItemAmount,
        SUM(ivi.totalFinalOrderItemAmount) AS totalFinalOrderItemAmount,
        SUM(ivi.totalVoucherValueOrderItemAmount) AS totalVoucherValueOrderItemAmount,
        SUM(iv.accumulated_points_to_use_column) AS totalAccumulatedPointsToUse,
        SUM(iv.delivery_fee_column) AS totalDeliveryFee,
        COUNT(DISTINCT iv.id_column) AS totalOrder,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'cash' THEN iv.id_column ELSE NULL END) AS totalOrderCash,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'bank-transfer' THEN iv.id_column ELSE NULL END) AS totalOrderBank,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'internal' THEN iv.id_column ELSE NULL END) AS totalOrderInternal,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'point' THEN iv.id_column ELSE NULL END) AS totalOrderPoint,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'credit-card' THEN iv.id_column ELSE NULL END) AS totalOrderCreditCard
    FROM 
        order_db.invoice_tbl AS iv
    LEFT JOIN 
        InvoiceItemSummary AS ivi ON iv.id_column = ivi.invoice_id
    WHERE 
        iv.date_column >= CURRENT_DATE() - INTERVAL 1 DAY
		AND iv.date_column < CURRENT_DATE()
        AND iv.deleted_at_column IS NULL
        AND iv.status_column = 'paid'
    GROUP BY 
        iv.branch_id_column, DATE(iv.date_column)
    ORDER BY 
        iv.branch_id_column, DATE(iv.date_column) ASC;
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

export const getAllBranchRevenueFromInvoiceClause = `
    WITH InvoiceItemSummary AS (
        SELECT 
            ii.invoice_column AS invoice_id,
            SUM(ii.price_column * ii.quantity_column) AS totalOriginalOrderItemAmount,
            SUM(ii.total_column) AS totalFinalOrderItemAmount,
            SUM(ii.voucher_value_column) AS totalVoucherValueOrderItemAmount
        FROM order_db.invoice_item_tbl ii
        JOIN order_db.invoice_tbl iv ON iv.id_column = ii.invoice_column
        WHERE iv.deleted_at_column IS NULL
        GROUP BY ii.invoice_column
        )
    SELECT 
        iv.branch_id_column AS branchId,
        DATE(iv.date_column) AS date,
        SUM(iv.amount_column) AS totalAmount,
        -- Total amount for bank
        SUM(CASE WHEN iv.payment_method_column = 'bank-transfer' THEN iv.amount_column ELSE 0 END) AS totalAmountBank,
        -- Total amount for cash
        SUM(CASE WHEN iv.payment_method_column = 'cash' THEN iv.amount_column ELSE 0 END) AS totalAmountCash,
        -- Total amount for internal
        SUM(CASE WHEN iv.payment_method_column = 'internal' THEN iv.amount_column ELSE 0 END) AS totalAmountInternal,
        -- Total amount for point
        SUM(CASE WHEN iv.payment_method_column = 'point' THEN iv.amount_column ELSE 0 END) AS totalAmountPoint,
        -- Total amount for credit card
        SUM(CASE WHEN iv.payment_method_column = 'credit-card' THEN iv.amount_column ELSE 0 END) AS totalAmountCreditCard,
        SUM(iv.amount_column) AS totalFinalAmountOrder,
        SUM(iv.voucher_value_column) AS totalVoucherValueOrderAmount,
        SUM(ivi.totalOriginalOrderItemAmount) AS totalOriginalAmountOrder,
        SUM(iv.loss_column) AS totalLossAmount,
        SUM(ivi.totalOriginalOrderItemAmount) AS totalOriginalOrderItemAmount,
        SUM(ivi.totalFinalOrderItemAmount) AS totalFinalOrderItemAmount,
        SUM(ivi.totalVoucherValueOrderItemAmount) AS totalVoucherValueOrderItemAmount,
        SUM(iv.accumulated_points_to_use_column) AS totalAccumulatedPointsToUse,
        SUM(iv.delivery_fee_column) AS totalDeliveryFee,
        COUNT(DISTINCT iv.id_column) AS totalOrder,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'cash' THEN iv.id_column ELSE NULL END) AS totalOrderCash,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'bank-transfer' THEN iv.id_column ELSE NULL END) AS totalOrderBank,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'internal' THEN iv.id_column ELSE NULL END) AS totalOrderInternal,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'point' THEN iv.id_column ELSE NULL END) AS totalOrderPoint,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'credit-card' THEN iv.id_column ELSE NULL END) AS totalOrderCreditCard
    FROM 
        order_db.invoice_tbl AS iv
    LEFT JOIN 
        InvoiceItemSummary AS ivi ON iv.id_column = ivi.invoice_id
    WHERE 
        iv.deleted_at_column IS NULL
        AND iv.status_column = 'paid'
    GROUP BY 
        iv.branch_id_column, DATE(iv.date_column)
    ORDER BY 
        iv.branch_id_column, DATE(iv.date_column) ASC;
`;

export const getAllBranchRevenueByDateClause = `
    WITH InvoiceItemSummary AS (
        SELECT 
            ii.invoice_column AS invoice_id,
            SUM(ii.price_column * ii.quantity_column) AS totalOriginalOrderItemAmount,
            SUM(ii.total_column) AS totalFinalOrderItemAmount,
            SUM(ii.voucher_value_column) AS totalVoucherValueOrderItemAmount
        FROM order_db.invoice_item_tbl ii
        JOIN order_db.invoice_tbl iv ON iv.id_column = ii.invoice_column
        WHERE
            iv.deleted_at_column IS NULL
        GROUP BY ii.invoice_column
        )
    SELECT 
        o.branch_column AS branchId,
        DATE(iv.created_at_column) AS date,
        SUM(iv.amount_column) AS totalAmount,
        -- Total amount for bank
        SUM(CASE WHEN iv.payment_method_column = 'bank-transfer' THEN iv.amount_column ELSE 0 END) AS totalAmountBank,
        -- Total amount for cash
        SUM(CASE WHEN iv.payment_method_column = 'cash' THEN iv.amount_column ELSE 0 END) AS totalAmountCash,
        -- Total amount for internal
        SUM(CASE WHEN iv.payment_method_column = 'internal' THEN iv.amount_column ELSE 0 END) AS totalAmountInternal,
        SUM(iv.amount_column) AS totalFinalAmountOrder,
        SUM(iv.voucher_value_column) AS totalVoucherValueOrderAmount,
        SUM(ivi.totalOriginalOrderItemAmount) AS totalOriginalAmountOrder,
        SUM(iv.loss_column) AS totalLossAmountOrder,
        SUM(ivi.totalOriginalOrderItemAmount) AS totalOriginalOrderItemAmount,
        SUM(ivi.totalFinalOrderItemAmount) AS totalFinalOrderItemAmount,
        SUM(ivi.totalVoucherValueOrderItemAmount) AS totalVoucherValueOrderItemAmount,
        COUNT(DISTINCT iv.id_column) AS totalOrder,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'cash' THEN iv.id_column ELSE NULL END) AS totalOrderCash,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'bank-transfer' THEN iv.id_column ELSE NULL END) AS totalOrderBank,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'internal' THEN iv.id_column ELSE NULL END) AS totalOrderInternal
    FROM 
        order_db.invoice_tbl AS iv
    LEFT JOIN 
        InvoiceItemSummary AS ivi ON iv.id_column = ivi.invoice_id
	LEFT JOIN
		order_db.order_tbl as o ON iv.id_column = o.invoice_column
    WHERE 
        iv.deleted_at_column IS NULL
    GROUP BY 
        o.branch_column, DATE(iv.created_at_column)
    ORDER BY 
        o.branch_column, DATE(iv.created_at_column) ASC;
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

export const getSpecificRangeBranchRevenueFromInvoiceClause = `
    WITH InvoiceItemSummary AS (
        SELECT 
            ii.invoice_column AS invoice_id,
            SUM(ii.price_column * ii.quantity_column) AS totalOriginalOrderItemAmount,
            SUM(ii.total_column) AS totalFinalOrderItemAmount,
            SUM(ii.voucher_value_column) AS totalVoucherValueOrderItemAmount
        FROM order_db.invoice_item_tbl ii
        JOIN order_db.invoice_tbl iv ON iv.id_column = ii.invoice_column
        WHERE iv.date_column >= ?
            AND iv.date_column < ?
            AND iv.deleted_at_column IS NULL
        GROUP BY ii.invoice_column
        )
    SELECT 
        iv.branch_id_column AS branchId,
        DATE(iv.date_column) AS date,
        SUM(iv.amount_column) AS totalAmount,
        -- Total amount for bank
        SUM(CASE WHEN iv.payment_method_column = 'bank-transfer' THEN iv.amount_column ELSE 0 END) AS totalAmountBank,
        -- Total amount for cash
        SUM(CASE WHEN iv.payment_method_column = 'cash' THEN iv.amount_column ELSE 0 END) AS totalAmountCash,
        -- Total amount for internal
        SUM(CASE WHEN iv.payment_method_column = 'internal' THEN iv.amount_column ELSE 0 END) AS totalAmountInternal,
        -- Total amount for point
        SUM(CASE WHEN iv.payment_method_column = 'point' THEN iv.amount_column ELSE 0 END) AS totalAmountPoint,
        -- Total amount for credit card
        SUM(CASE WHEN iv.payment_method_column = 'credit-card' THEN iv.amount_column ELSE 0 END) AS totalAmountCreditCard,
        SUM(iv.amount_column) AS totalFinalAmountOrder,
        SUM(iv.voucher_value_column) AS totalVoucherValueOrderAmount,
        SUM(ivi.totalOriginalOrderItemAmount) AS totalOriginalAmountOrder,
        SUM(iv.loss_column) AS totalLossAmount,
        SUM(ivi.totalOriginalOrderItemAmount) AS totalOriginalOrderItemAmount,
        SUM(ivi.totalFinalOrderItemAmount) AS totalFinalOrderItemAmount,
        SUM(ivi.totalVoucherValueOrderItemAmount) AS totalVoucherValueOrderItemAmount,
        SUM(iv.accumulated_points_to_use_column) AS totalAccumulatedPointsToUse,
        SUM(iv.delivery_fee_column) AS totalDeliveryFee,
        COUNT(DISTINCT iv.id_column) AS totalOrder,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'cash' THEN iv.id_column ELSE NULL END) AS totalOrderCash,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'bank-transfer' THEN iv.id_column ELSE NULL END) AS totalOrderBank,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'internal' THEN iv.id_column ELSE NULL END) AS totalOrderInternal,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'point' THEN iv.id_column ELSE NULL END) AS totalOrderPoint,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'credit-card' THEN iv.id_column ELSE NULL END) AS totalOrderCreditCard
    FROM 
        order_db.invoice_tbl AS iv
    LEFT JOIN 
        InvoiceItemSummary AS ivi ON iv.id_column = ivi.invoice_id
    WHERE 
        iv.date_column >= ?
		AND iv.date_column < ?
        AND iv.deleted_at_column IS NULL
        AND iv.status_column = 'paid'
    GROUP BY 
        iv.branch_id_column, DATE(iv.date_column)
    ORDER BY 
        iv.branch_id_column, DATE(iv.date_column) ASC;
`;

export const getSpecificRangeBranchRevenueByHourClause = `
    WITH OrderItemSummary AS (
        SELECT 
            order_column AS order_id,
            SUM(original_subtotal_column) AS totalOriginalOrderItemAmount,
            SUM(subtotal_column) AS totalFinalOrderItemAmount,
            SUM(voucher_value_column) AS totalVoucherValueOrderItemAmount
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
        SUM(o.loss_column) AS totalLossAmountOrder,
        SUM(oi.totalOriginalOrderItemAmount) AS totalOriginalOrderItemAmount,
        SUM(oi.totalFinalOrderItemAmount) AS totalFinalOrderItemAmount,
        SUM(oi.totalVoucherValueOrderItemAmount) AS totalVoucherValueOrderItemAmount,
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

export const getSpecificRangeBranchRevenueByHourFromInvoiceClause = `
    WITH InvoiceItemSummary AS (
        SELECT 
            ii.invoice_column AS invoice_id,
            SUM(ii.price_column * ii.quantity_column) AS totalOriginalOrderItemAmount,
            SUM(ii.total_column) AS totalFinalOrderItemAmount,
            SUM(ii.voucher_value_column) AS totalVoucherValueOrderItemAmount
        FROM order_db.invoice_item_tbl ii
        JOIN order_db.invoice_tbl iv ON iv.id_column = ii.invoice_column
        WHERE iv.date_column >= ?
            AND iv.date_column < ?
            AND iv.branch_id_column = ?
            AND iv.deleted_at_column IS NULL
        GROUP BY ii.invoice_column
        )
    SELECT 
        iv.branch_id_column AS branchId,
        DATE_FORMAT(iv.date_column, '%Y-%m-%d %H:00:00') AS date,
        SUM(iv.amount_column) AS totalAmount,
        -- Total amount for bank
        SUM(CASE WHEN iv.payment_method_column = 'bank-transfer' THEN iv.amount_column ELSE 0 END) AS totalAmountBank,
        -- Total amount for cash
        SUM(CASE WHEN iv.payment_method_column = 'cash' THEN iv.amount_column ELSE 0 END) AS totalAmountCash,
        -- Total amount for internal
        SUM(CASE WHEN iv.payment_method_column = 'internal' THEN iv.amount_column ELSE 0 END) AS totalAmountInternal,
        -- Total amount for point
        SUM(CASE WHEN iv.payment_method_column = 'point' THEN iv.amount_column ELSE 0 END) AS totalAmountPoint,
        -- Total amount for credit card
        SUM(CASE WHEN iv.payment_method_column = 'credit-card' THEN iv.amount_column ELSE 0 END) AS totalAmountCreditCard,
        SUM(iv.amount_column) AS totalFinalAmountOrder,
        SUM(iv.voucher_value_column) AS totalVoucherValueOrderAmount,
        SUM(ivi.totalOriginalOrderItemAmount) AS totalOriginalAmountOrder,
        SUM(iv.loss_column) AS totalLossAmount,
        SUM(ivi.totalOriginalOrderItemAmount) AS totalOriginalOrderItemAmount,
        SUM(ivi.totalFinalOrderItemAmount) AS totalFinalOrderItemAmount,
        SUM(ivi.totalVoucherValueOrderItemAmount) AS totalVoucherValueOrderItemAmount,
        SUM(iv.accumulated_points_to_use_column) AS totalAccumulatedPointsToUse,
        SUM(iv.delivery_fee_column) AS totalDeliveryFee,
        COUNT(DISTINCT iv.id_column) AS totalOrder,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'cash' THEN iv.id_column ELSE NULL END) AS totalOrderCash,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'bank-transfer' THEN iv.id_column ELSE NULL END) AS totalOrderBank,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'internal' THEN iv.id_column ELSE NULL END) AS totalOrderInternal,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'point' THEN iv.id_column ELSE NULL END) AS totalOrderPoint,
        COUNT(DISTINCT CASE WHEN iv.payment_method_column = 'credit-card' THEN iv.id_column ELSE NULL END) AS totalOrderCreditCard
    FROM 
        order_db.invoice_tbl AS iv
    LEFT JOIN 
        InvoiceItemSummary AS ivi ON iv.id_column = ivi.invoice_id
    WHERE 
        iv.date_column >= ?
		AND iv.date_column < ?
        AND iv.branch_id_column = ?
        AND iv.deleted_at_column IS NULL
        AND iv.status_column = 'paid'
    GROUP BY 
        DATE_FORMAT(iv.date_column, '%Y-%m-%d %H:00:00')
    ORDER BY 
        DATE_FORMAT(iv.date_column, '%Y-%m-%d %H:00:00') ASC;
        `;
