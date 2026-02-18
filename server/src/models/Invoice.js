/**
 * Invoice Model — tblOrder + tblOrderItem
 * tblOrder schema: OrderID, NAATINumber, OrderDate, DeliveryName, DeliveryAddress, SuburbId, CountryId, ExternalPaymentTransactionId
 * tblOrderItem schema: OrderItemID, Product, Skill, Level, Direction, Expiry, Quantity, Price, GSTApplies, OrderItemType, ProductSpecificationId, AccreditationResultId, OrderID
 * Note: No TotalPrice, TotalAmount, Verified, InvoiceNumber, ReferenceNumber, or PersonId columns.
 * tblInvoice does NOT exist in this database.
 */
const { query, sql } = require('../config/database');

async function findByNaatiNumber(naatiNumber) {
    if (!naatiNumber) return [];

    const result = await query(
        `SELECT o.OrderID AS InvoiceId, o.NAATINumber, o.OrderDate AS InvoiceDate,
                DATEADD(day, 30, o.OrderDate) AS DueDate, 
                (SELECT ISNULL(SUM(oi.Price * oi.Quantity), 0) FROM tblOrderItem oi WHERE oi.OrderID = o.OrderID) AS TotalAmount,
                (CASE WHEN o.ExternalPaymentTransactionId IS NOT NULL THEN 
                    (SELECT ISNULL(SUM(oi.Price * oi.Quantity), 0) FROM tblOrderItem oi WHERE oi.OrderID = o.OrderID) 
                ELSE 0 END) AS PaidAmount,
                CASE WHEN o.ExternalPaymentTransactionId IS NOT NULL THEN 'Paid'
                     WHEN DATEADD(day, 30, o.OrderDate) < GETDATE() THEN 'Overdue'
                     ELSE 'Unpaid' END AS PaymentStatus,
                o.DeliveryName AS Description
         FROM tblOrder o
         WHERE o.NAATINumber = @naatiNumber
         ORDER BY o.OrderDate DESC`,
        { naatiNumber: { type: sql.Int, value: naatiNumber } }
    );
    return result.recordset;
}

async function countUnpaid(naatiNumber) {
    if (!naatiNumber) return 0;
    const result = await query(
        `SELECT COUNT(*) AS count 
         FROM tblOrder o
         WHERE o.NAATINumber = @naatiNumber AND o.ExternalPaymentTransactionId IS NULL`,
        { naatiNumber: { type: sql.Int, value: naatiNumber } }
    );
    return result.recordset[0].count;
}

async function getTotalOwed(naatiNumber) {
    if (!naatiNumber) return 0;
    const result = await query(
        `SELECT ISNULL(SUM(oi.Price * oi.Quantity), 0) AS totalOwed
         FROM tblOrder o
         INNER JOIN tblOrderItem oi ON o.OrderID = oi.OrderID
         WHERE o.NAATINumber = @naatiNumber AND o.ExternalPaymentTransactionId IS NULL`,
        { naatiNumber: { type: sql.Int, value: naatiNumber } }
    );
    return result.recordset[0].totalOwed;
}

async function getInvoiceLines(invoiceId) {
    const result = await query(
        `SELECT oi.OrderItemID AS InvoiceLineId, oi.OrderID AS InvoiceId,
                oi.Product AS Description,
                oi.Quantity, oi.Price, (oi.Price * oi.Quantity) AS Amount,
                oi.GSTApplies
         FROM tblOrderItem oi
         WHERE oi.OrderID = @invoiceId
         ORDER BY oi.OrderItemID`,
        { invoiceId: { type: sql.Int, value: invoiceId } }
    );
    return result.recordset;
}

module.exports = { findByNaatiNumber, countUnpaid, getTotalOwed, getInvoiceLines };
