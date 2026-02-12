/**
 * My Bills Page — Shows paid invoices / transaction history.
 * Uses same invoices endpoint but filters to paid/completed.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices } from '../../services/dashboard.service';
import { CreditCard, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function BillsPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await getInvoices();
                const all = res.data || res || [];
                setBills(all.filter(i => i.PaymentStatus === 'Paid'));
            } catch (err) {
                console.error('Failed to load bills', err);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    return (
        <div className="page-container">
            <div className="detail-page-header">
                <Link to="/dashboard" className="back-link"><ArrowLeft size={18} /> Dashboard</Link>
                <div className="detail-page-title">
                    <CreditCard size={28} className="detail-page-icon" style={{ color: '#8b5cf6' }} />
                    <h1>My Bills</h1>
                </div>
            </div>

            {loading ? (
                <div className="dashboard-loading"><Loader2 className="spin" size={32} /><p>Loading bills...</p></div>
            ) : bills.length === 0 ? (
                <div className="detail-empty">
                    <CreditCard size={48} />
                    <h3>No Bills Found</h3>
                    <p>You don't have any paid invoices yet.</p>
                </div>
            ) : (
                <div className="detail-table-card">
                    <table className="detail-table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Description</th>
                                <th>Date Paid</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((b) => (
                                <tr key={b.InvoiceId}>
                                    <td className="detail-primary-cell">{b.InvoiceNumber || b.InvoiceId}</td>
                                    <td>{b.Description || '—'}</td>
                                    <td>{b.InvoiceDate ? new Date(b.InvoiceDate).toLocaleDateString() : '—'}</td>
                                    <td className="amount-cell">${Number(b.TotalAmount || 0).toFixed(2)}</td>
                                    <td>
                                        <span className="status-badge status-active">
                                            <CheckCircle size={14} /> Paid
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
