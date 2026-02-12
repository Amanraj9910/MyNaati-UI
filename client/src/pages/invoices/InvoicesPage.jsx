/**
 * My Invoices Page — Lists all invoices from tblInvoice.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices } from '../../services/dashboard.service';
import { Receipt, ArrowLeft, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await getInvoices();
                setInvoices(res.data || res || []);
            } catch (err) {
                console.error('Failed to load invoices', err);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    const getStatusIcon = (status) => {
        if (status === 'Paid') return <CheckCircle size={14} />;
        if (status === 'Overdue') return <AlertCircle size={14} />;
        return <Clock size={14} />;
    };

    const getStatusClass = (status) => {
        if (status === 'Paid') return 'status-active';
        if (status === 'Overdue') return 'status-overdue';
        return 'status-pending';
    };

    return (
        <div className="page-container">
            <div className="detail-page-header">
                <Link to="/dashboard" className="back-link"><ArrowLeft size={18} /> Dashboard</Link>
                <div className="detail-page-title">
                    <Receipt size={28} className="detail-page-icon" style={{ color: '#ef4444' }} />
                    <h1>My Invoices</h1>
                </div>
            </div>

            {loading ? (
                <div className="dashboard-loading"><Loader2 className="spin" size={32} /><p>Loading invoices...</p></div>
            ) : invoices.length === 0 ? (
                <div className="detail-empty">
                    <Receipt size={48} />
                    <h3>No Invoices Found</h3>
                    <p>You don't have any invoices at this time.</p>
                </div>
            ) : (
                <div className="detail-table-card">
                    <table className="detail-table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Due Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv) => (
                                <tr key={inv.InvoiceId}>
                                    <td className="detail-primary-cell">{inv.InvoiceNumber || inv.InvoiceId}</td>
                                    <td>{inv.Description || '—'}</td>
                                    <td>{inv.InvoiceDate ? new Date(inv.InvoiceDate).toLocaleDateString() : '—'}</td>
                                    <td>{inv.DueDate ? new Date(inv.DueDate).toLocaleDateString() : '—'}</td>
                                    <td className="amount-cell">${Number(inv.TotalAmount || 0).toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(inv.PaymentStatus)}`}>
                                            {getStatusIcon(inv.PaymentStatus)} {inv.PaymentStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
