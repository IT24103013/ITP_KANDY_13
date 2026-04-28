import React, { useState, useEffect } from 'react';
import apiFetch, { BASE_URL } from '../../services/api';
import './PaymentHistory.css';

function PaymentHistory({ currentUserId }) {
    const [historyData, setHistoryData] = useState([]);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchMyHistory = async () => {
            try {
                const response = await apiFetch(`/api/payments/customer/${currentUserId}`);

                if (response.ok) {
                    let data = await response.json();
                    setHistoryData(data);
                    if (data.length === 0) {
                        setMessage("You don't have any payment history yet.");
                        setIsError(false);
                    }
                } else {
                    const errorText = await response.text();
                    setMessage(errorText || "Error fetching data.");
                    setIsError(true);
                }
            } catch (error) {
                console.error(error);
                setMessage("Network Error! Please check if the backend is running.");
                setIsError(true);
            }
        };

        fetchMyHistory();
    }, [currentUserId]);

    // Function to determine the CSS class for status
    const getStatusClass = (status) => {
        return `status-cell status-${status}`;
    };

    // Derived stats
    const totalAmount = historyData.reduce((sum, p) => sum + p.amount, 0);
    const approvedCount = historyData.filter(p => p.status === 'Approved').length;
    const rejectedCount = historyData.filter(p => p.status === 'Rejected').length;
    const pendingCount = historyData.filter(p => p.status === 'Pending').length;

    const handleDownloadInvoice = async (paymentId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`${BASE_URL}/api/payments/${paymentId}/invoice`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `Invoice-${paymentId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                alert("Failed to download invoice. Ensure it's approved.");
            }
        } catch (error) {
            console.error("error downloading invoice:", error);
        }
    };

    return (
        <div className="history-container">

            {/* ---- Page Header ---- */}
            <div className="history-header">
                <h1 className="history-page-title">My Payment History</h1>
                <p className="history-page-subtitle">Track all your booking payments and their current status</p>
            </div>

            {/* ---- Stats Row ---- */}
            {historyData.length > 0 && (
                <div className="history-stats-row">
                    <div className="hist-stat-card">
                        <div className="hist-stat-icon gold">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <div className="hist-stat-info">
                            <span className="hist-stat-value">{totalAmount.toLocaleString()}</span>
                            <span className="hist-stat-label">Total Paid (Rs.)</span>
                        </div>
                    </div>
                    <div className="hist-stat-card">
                        <div className="hist-stat-icon green">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div className="hist-stat-info">
                            <span className="hist-stat-value">{approvedCount}</span>
                            <span className="hist-stat-label">Approved</span>
                        </div>
                    </div>
                    <div className="hist-stat-card">
                        <div className="hist-stat-icon amber">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div className="hist-stat-info">
                            <span className="hist-stat-value">{pendingCount}</span>
                            <span className="hist-stat-label">Pending</span>
                        </div>
                    </div>
                    <div className="hist-stat-card">
                        <div className="hist-stat-icon red">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </div>
                        <div className="hist-stat-info">
                            <span className="hist-stat-value">{rejectedCount}</span>
                            <span className="hist-stat-label">Rejected</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ---- Main Card ---- */}
            <div className="history-card">
                <div className="history-card-header">
                    <h2 className="history-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        Transactions
                    </h2>
                    {historyData.length > 0 && (
                        <div className="history-total-badge">
                            <span>Total</span>
                            Rs. {totalAmount.toLocaleString()}
                        </div>
                    )}
                </div>

                {/* ---- Message ---- */}
                {message && (
                    <div className={`message-box ${isError ? 'error-msg' : 'success-msg'}`}>
                        {isError ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        )}
                        {message}
                    </div>
                )}

                {/* ---- Table ---- */}
                <div className="table-wrapper">
                    {historyData.length === 0 && !message ? (
                        <div className="empty-state">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                            <p>No payment records found.</p>
                        </div>
                    ) : (
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Booking ID</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                    <th>Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyData.map((payment) => (
                                    <tr key={payment.paymentId}>
                                        <td>
                                            <div className="date-cell">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                    <line x1="16" y1="2" x2="16" y2="6" />
                                                    <line x1="8" y1="2" x2="8" y2="6" />
                                                    <line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                                {payment.paymentDate}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="booking-id-cell">#{payment.booking.bookingId}</span>
                                        </td>
                                        <td>
                                            <span className="amount-cell">{payment.amount.toLocaleString()}</span>
                                        </td>
                                        <td className={getStatusClass(payment.status)}>
                                            <span className="status-badge">{payment.status}</span>
                                        </td>
                                        <td className="remarks-cell">
                                            {payment.remarks ? payment.remarks : '—'}
                                        </td>
                                        <td>
                                            {payment.status === 'Approved' ? (
                                                <button 
                                                    className="btn-download-inv"
                                                    onClick={() => handleDownloadInvoice(payment.paymentId)}
                                                    title="Download Invoice"
                                                    style={{
                                                        background: 'none',
                                                        border: '1px solid #c9a052',
                                                        color: '#c9a052',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14, height:14}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                    PDF
                                                </button>
                                            ) : (
                                                <span style={{color:'#999', fontSize:'12px'}}>N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PaymentHistory;