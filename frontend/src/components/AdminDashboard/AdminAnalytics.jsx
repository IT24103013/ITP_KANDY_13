import React, { useState, useEffect } from 'react';
import apiFetch from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function AdminAnalytics() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingReview, setIsGeneratingReview] = useState(false);
    const [isGeneratingFinance, setIsGeneratingFinance] = useState(false);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/api/v1/admin/analytics/summary');
            if (res.ok) {
                const data = await res.json();
                setSummary(data);
            }
        } catch (err) {
            console.error("Failed to fetch analytics", err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateUserReport = async () => {
        setIsGenerating(true);
        try {
            const response = await apiFetch('/api/users');
            if (!response.ok) throw new Error("Failed to fetch users");
            const users = await response.json();

            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.setTextColor(26, 31, 46);
            doc.text("Samarasinghe Motors", 14, 22);
            doc.setFontSize(14);
            doc.setTextColor(100);
            doc.text("User Management & Directory Report", 14, 30);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);

            const tableColumn = ["ID", "Full Name", "Email", "NIC", "Phone", "Role", "Status"];
            const tableRows = users.map(user => [
                user.userId, user.fullName, user.email, user.nic, user.phone, user.role, user.status
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 55,
                theme: 'striped',
                headStyles: { fillColor: [201, 160, 82], textColor: [255, 255, 255] },
            });

            doc.save(`User_Report_${new Date().getTime()}.pdf`);
        } catch (error) {
            alert("Could not generate report.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateReviewReport = async () => {
        setIsGeneratingReview(true);
        try {
            const response = await apiFetch('/api/v1/admin/analytics/reviews');
            if (!response.ok) throw new Error("Failed to fetch reviews");
            const data = await response.json();

            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.text("Samarasinghe Motors", 14, 22);
            doc.setFontSize(14);
            doc.text("Reviews & Feedback Performance Report", 14, 30);
            
            doc.setFontSize(11);
            doc.text(`Average Rating: ${data.overallAverage.toFixed(2)} / 5.0`, 14, 45);
            doc.text(`Total Reviews: ${data.totalReviews}`, 14, 51);

            doc.text("Top 5 Performing Vehicles", 14, 65);
            autoTable(doc, {
                head: [["Rank", "Vehicle", "Rating", "Count"]],
                body: data.topPerformers.map((v, i) => [i + 1, v.name, `${v.avgRating.toFixed(2)}`, v.reviewCount]),
                startY: 70,
                headStyles: { fillColor: [34, 197, 94] }
            });

            doc.save(`Reviews_Report_${new Date().getTime()}.pdf`);
        } catch (error) {
            alert("Could not generate review report.");
        } finally {
            setIsGeneratingReview(false);
        }
    };

    const handleGenerateFinanceReport = async () => {
        setIsGeneratingFinance(true);
        try {
            const response = await apiFetch('/api/v1/admin/analytics/finance');
            if (!response.ok) throw new Error("Failed to fetch finance data");
            const data = await response.json();

            const doc = new jsPDF();
            
            // Branding
            doc.setFontSize(24);
            doc.setTextColor(22, 26, 34);
            doc.text("Samarasinghe Motors", 14, 22);
            
            doc.setFontSize(14);
            doc.setTextColor(201, 160, 82); // Gold
            doc.text("Financial Statement & Revenue Analysis", 14, 30);
            
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(`Reporting Period: Fiscal Year ${new Date().getFullYear()}`, 14, 38);
            doc.text(`Statement Date: ${new Date().toLocaleString()}`, 14, 43);

            // Summary Highlights
            doc.setFillColor(245, 246, 248);
            doc.rect(14, 50, 182, 35, 'F');
            
            doc.setFontSize(11);
            doc.setTextColor(22, 26, 34);
            doc.text("EXECUTIVE SUMMARY", 20, 58);
            
            doc.setFontSize(10);
            doc.text(`Total Gross Revenue (Approved):`, 20, 66);
            doc.setFont(undefined, 'bold');
            doc.text(`Rs. ${data.totalGrossRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`, 85, 66);
            
            doc.setFont(undefined, 'normal');
            doc.text(`Total Transactions Tracked:`, 20, 72);
            doc.text(`${data.allPayments.length}`, 85, 72);
            
            const approvedCount = data.statusCount["APPROVED"] || 0;
            doc.text(`Approval Success Rate:`, 20, 78);
            const rate = data.allPayments.length > 0 ? (approvedCount / data.allPayments.length * 100).toFixed(1) : 0;
            doc.text(`${rate}%`, 85, 78);

            // Revenue by Status Table
            doc.setFont(undefined, 'bold');
            doc.text("Revenue Breakdown by Payment Status", 14, 98);
            const statusColumns = ["Payment Status", "Transaction Count", "Subtotal"];
            const statusRows = Object.entries(data.statusCount).map(([status, count]) => [
                status, 
                count, 
                `Rs. ${(data.statusRevenue[status] || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`
            ]);

            autoTable(doc, {
                head: [statusColumns],
                body: statusRows,
                startY: 103,
                theme: 'grid',
                headStyles: { fillColor: [22, 26, 34], textColor: [201, 160, 82] }
            });

            // Detailed Transactions (New Page if needed)
            const currentY = doc.lastAutoTable.finalY + 15;
            doc.text("Detailed Transaction History", 14, currentY);
            
            const transColumns = ["ID", "Booking ID", "Date", "Amount", "Status"];
            const transRows = data.allPayments.map(p => [
                `#${p.paymentId}`, 
                `#${p.booking?.bookingId || 'N/A'}`, 
                p.paymentDate, 
                `Rs. ${p.amount.toLocaleString()}`, 
                p.status
            ]);

            autoTable(doc, {
                head: [transColumns],
                body: transRows,
                startY: currentY + 5,
                theme: 'striped',
                headStyles: { fillColor: [201, 160, 82], textColor: [255, 255, 255] },
                styles: { fontSize: 8 }
            });

            doc.save(`Financial_Report_${new Date().getTime()}.pdf`);
        } catch (error) {
            console.error(error);
            alert("Could not generate financial report.");
        } finally {
            setIsGeneratingFinance(false);
        }
    };

    if (loading) return <div className="loading-state">Gathering business intelligence...</div>;
    if (!summary) return <div className="empty-state">Unable to load analytics data.</div>;

    return (
        <div className="analytics-container">
            <div className="metrics-grid">
                <div className="metric-card gold-border">
                    <div className="metric-header">
                        <span className="metric-title">Total Revenue</span>
                        <span className="metric-icon">💰</span>
                    </div>
                    <div className="metric-value">Rs. {summary.totalRevenue.toLocaleString()}</div>
                    <div className="metric-trend up">Overall platform earnings</div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Total Bookings</span>
                        <span className="metric-icon">📅</span>
                    </div>
                    <div className="metric-value">{summary.totalBookings}</div>
                    <div className="metric-trend default">Rental volume</div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Total Customers</span>
                        <span className="metric-icon">👥</span>
                    </div>
                    <div className="metric-value">{summary.totalUsers}</div>
                    <div className="metric-trend up">Registered accounts</div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Total Vehicles</span>
                        <span className="metric-icon">🚗</span>
                    </div>
                    <div className="metric-value">{summary.totalVehicles}</div>
                    <div className="metric-trend default">Fleet size</div>
                </div>
            </div>

            <div className="analytics-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '40px' }}>
                <div className="chart-card dark-card">
                    <h3>Vehicle Inventory by Type</h3>
                    <div className="stat-list">
                        {Object.entries(summary.vehiclesByType).map(([type, count]) => (
                            <div key={type} className="stat-item">
                                <span>{type}</span>
                                <div className="stat-bar-container">
                                    <div className="stat-bar" style={{ width: `${(count / summary.totalVehicles) * 100}%` }}></div>
                                </div>
                                <span>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chart-card dark-card">
                    <h3>Booking Status Distribution</h3>
                    <div className="stat-list">
                        {Object.entries(summary.bookingsByStatus).map(([status, count]) => (
                            <div key={status} className="stat-item">
                                <span>{status}</span>
                                <div className="stat-bar-container">
                                    <div className="stat-bar gold" style={{ width: `${(count / summary.totalBookings) * 100}%` }}></div>
                                </div>
                                <span>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reports Section */}
            <div className="reports-section-card" style={{ marginTop: '40px', padding: '24px', backgroundColor: '#0f1117', borderRadius: '16px', border: '1px solid #1e2130' }}>
                <h3 style={{ fontFamily: 'Rajdhani', color: '#fff', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Reports & Exports</h3>
                <div className="report-buttons-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    <button 
                        className="report-gen-btn" 
                        onClick={handleGenerateUserReport}
                        disabled={isGenerating}
                        style={{
                            padding: '12px',
                            backgroundColor: '#1e2130',
                            color: '#c9a052',
                            border: '1px solid #c9a052',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontFamily: 'Rajdhani',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        {isGenerating ? "Generating..." : "Download User Report"}
                    </button>

                    <button 
                        className="report-gen-btn" 
                        onClick={handleGenerateReviewReport}
                        disabled={isGeneratingReview}
                        style={{
                            padding: '12px',
                            backgroundColor: '#1e2130',
                            color: '#4ade80',
                            border: '1px solid #4ade80',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontFamily: 'Rajdhani',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        {isGeneratingReview ? "Generating..." : "Download Review Report"}
                    </button>

                    <button 
                        className="report-gen-btn" 
                        onClick={handleGenerateFinanceReport}
                        disabled={isGeneratingFinance}
                        style={{
                            padding: '12px',
                            backgroundColor: '#1e2130',
                            color: '#facc15',
                            border: '1px solid #facc15',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontFamily: 'Rajdhani',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        {isGeneratingFinance ? "Generating..." : "Download Financial Report"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminAnalytics;
