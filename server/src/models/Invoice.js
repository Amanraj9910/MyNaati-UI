/**
 * Invoice Model — tblInvoice + tblInvoiceLine
 * Queries invoices linked to an entity (via EntityId).
 */
const { query, sql } = require('../config/database');

async function findByEntityId(entityId) {
    const result = await query(
        `SELECT i.InvoiceId, i.EntityId, i.InvoiceNumber, i.InvoiceDate,
                i.DueDate, i.TotalAmount, i.PaidAmount, i.StatusId,
                i.Description,
                CASE WHEN i.PaidAmount >= i.TotalAmount THEN 'Paid'
                     WHEN i.DueDate < GETDATE() THEN 'Overdue'
                     ELSE 'Unpaid' END AS PaymentStatus
         FROM tblInvoice i
         WHERE i.EntityId = @entityId
         ORDER BY i.InvoiceDate DESC`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset;
}

async function countUnpaid(entityId) {
    const result = await query(
        `SELECT COUNT(*) AS count FROM tblInvoice
         WHERE EntityId = @entityId AND (PaidAmount < TotalAmount OR PaidAmount IS NULL)`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset[0].count;
}

async function getTotalOwed(entityId) {
    const result = await query(
        `SELECT ISNULL(SUM(TotalAmount - ISNULL(PaidAmount, 0)), 0) AS totalOwed
         FROM tblInvoice
         WHERE EntityId = @entityId AND (PaidAmount < TotalAmount OR PaidAmount IS NULL)`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset[0].totalOwed;
}

async function getInvoiceLines(invoiceId) {
    const result = await query(
        `SELECT il.InvoiceLineId, il.InvoiceId, il.Description,
                il.Quantity, il.UnitPrice, il.Amount
         FROM tblInvoiceLine il
         WHERE il.InvoiceId = @invoiceId
         ORDER BY il.InvoiceLineId`,
        { invoiceId: { type: sql.Int, value: invoiceId } }
    );
    return result.recordset;
}

module.exports = { findByEntityId, countUnpaid, getTotalOwed, getInvoiceLines };
