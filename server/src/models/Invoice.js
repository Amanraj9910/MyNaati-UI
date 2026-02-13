/**
 * Invoice Model — tblInvoice + tblInvoiceLine
 * Queries invoices linked to an entity (via EntityId).
 */
const { query, sql } = require('../config/database');

async function findByEntityId(entityId) {
    const result = await query(
        `SELECT o.OrderID AS InvoiceId, p.EntityId, o.InvoiceNumber, o.OrderDate AS InvoiceDate,
                DATEADD(day, 30, o.OrderDate) AS DueDate, o.TotalAmount, 
                (CASE WHEN o.Verified = 1 THEN o.TotalAmount ELSE 0 END) AS PaidAmount,
                CASE WHEN o.Verified = 1 THEN 'Paid'
                     WHEN DATEADD(day, 30, o.OrderDate) < GETDATE() THEN 'Overdue'
                     ELSE 'Unpaid' END AS PaymentStatus,
                o.ReferenceNumber AS Description
         FROM tblOrder o
         INNER JOIN tblPerson p ON o.PersonId = p.PersonId
         WHERE p.EntityId = @entityId
         ORDER BY o.OrderDate DESC`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset;
}

async function countUnpaid(entityId) {
    const result = await query(
        `SELECT COUNT(*) AS count 
         FROM tblOrder o
         INNER JOIN tblPerson p ON o.PersonId = p.PersonId
         WHERE p.EntityId = @entityId AND (o.Verified = 0 OR o.Verified IS NULL)`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset[0].count;
}

async function getTotalOwed(entityId) {
    const result = await query(
        `SELECT ISNULL(SUM(TotalAmount), 0) AS totalOwed
         FROM tblOrder o
         INNER JOIN tblPerson p ON o.PersonId = p.PersonId
         WHERE p.EntityId = @entityId AND (o.Verified = 0 OR o.Verified IS NULL)`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset[0].totalOwed;
}

async function getInvoiceLines(invoiceId) {
    const result = await query(
        `SELECT oi.OrderItemID AS InvoiceLineId, oi.OrderID AS InvoiceId, 
                ISNULL(ps.Description, 'Item #' + CAST(oi.OrderItemID AS VARCHAR)) AS Description,
                oi.Quantity, oi.UnitPrice, oi.TotalPrice AS Amount
         FROM tblOrderItem oi
         LEFT JOIN tblProductSpecification ps ON oi.ProductSpecificationId = ps.ProductSpecificationId
         WHERE oi.OrderID = @invoiceId
         ORDER BY oi.OrderItemID`,
        { invoiceId: { type: sql.Int, value: invoiceId } }
    );
    return result.recordset;
}

module.exports = { findByEntityId, countUnpaid, getTotalOwed, getInvoiceLines };
