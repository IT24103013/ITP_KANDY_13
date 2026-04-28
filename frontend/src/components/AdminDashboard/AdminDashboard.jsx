import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiFetch, { BASE_URL } from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PromotionManager from '../Promotion/PromotionManager';
import AdminAnalytics from './AdminAnalytics';
import './AdminDashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('payment');
    const [pendingPayments, setPendingPayments] = useState([]);
    const [allPayments, setAllPayments] = useState([]);
    const [users, setUsers] = useState([]);
    const [rentVehicles, setRentVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
    const [vehicleFormData, setVehicleFormData] = useState({
        name: '', type: 'Sedan', year: 2024, dailyRate: '', status: 'Available',
        description: '', mileageLimit: 100, extraMileageCharge: '',
        avgFuelEfficiency: '', gearType: 'Auto', seats: 4, fuelType: 'Petrol'
    });
    const [vehicleImage, setVehicleImage] = useState(null);
    const [inquiries, setInquiries] = useState([]);
    const [trendingVehicles, setTrendingVehicles] = useState([]);
    const [inquiryActionObj, setInquiryActionObj] = useState(null); // { id, type: 'status' | 'finalize' }
    const [vehicleTab, setVehicleTab] = useState('rent');
    const [saleVehicles, setSaleVehicles] = useState([]);
    const [showAddSaleModal, setShowAddSaleModal] = useState(false);
    const [saleFormData, setSaleFormData] = useState({
        name: '', conditionStatus: 'Used', yearReg: 2020, yom: 2020, edition: '', scanReportUrl: '',
        status: 'Available', brand: 'Toyota', transmission: 'Auto', bodyType: 'Sedan',
        engineCap: '1500cc', mileage: '', color: 'White', price: '', description: ''
    });
    const [saleImage, setSaleImage] = useState(null);
    const [message, setMessage] = useState(null);
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingPayment, setEditingPayment] = useState(null);
    const [newPaymentDate, setNewPaymentDate] = useState('');
    const dateInputRef = useRef(null);

    const storedUserStr = localStorage.getItem('user');
    const user = storedUserStr ? JSON.parse(storedUserStr) : null;

    useEffect(() => {
        if (!user || user.role?.toUpperCase() !== 'ADMIN') {
            navigate('/');
        }
    }, [user, navigate]);

    const showMessage = useCallback((msg, error = false) => {
        setMessage(msg);
        setIsError(error);
        setTimeout(() => {
            setMessage(null);
        }, 5000);
    }, []);

    const fetchPendingPayments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiFetch('/api/payments/pending');
            if (!response.ok) throw new Error("Failed to fetch pending payments");
            const data = await response.json();
            setPendingPayments(data);
        } catch (error) {
            console.error(error);
            showMessage("Could not load pending payments.", true);
        } finally {
            setLoading(false);
        }
    }, [showMessage]);

    const fetchAllPayments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiFetch('/api/payments/all');
            if (!response.ok) throw new Error("Failed to fetch all payments");
            const data = await response.json();
            setAllPayments(data);
        } catch (error) {
            console.error(error);
            showMessage("Could not load payment history.", true);
        } finally {
            setLoading(false);
        }
    }, [showMessage]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiFetch('/api/users');
            if (!response.ok) throw new Error("Failed to fetch users");
            const data = await response.json();
            setUsers(data);
        } catch {
            console.error("Failed to fetch users");
            showMessage("Could not load user directory.", true);
        } finally {
            setLoading(false);
        }
    }, [showMessage]);

    const fetchRentVehicles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiFetch('/api/vehicles/rent');
            if (!response.ok) throw new Error("Failed to fetch rent vehicles");
            const data = await response.json();
            setRentVehicles(data);
        } catch {
            console.error("Failed to fetch rent vehicles");
            showMessage("Could not load rent vehicles.", true);
        } finally {
            setLoading(false);
        }
    }, [showMessage]);

    const fetchSaleVehicles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiFetch('/api/vehicles/sale');
            if (!response.ok) throw new Error("Failed to fetch sale vehicles");
            const data = await response.json();
            setSaleVehicles(data);
        } catch {
            showMessage("Could not load sale vehicles.", true);
        } finally {
            setLoading(false);
        }
    }, [showMessage]);

    const fetchInquiries = useCallback(async () => {
        setLoading(true);
        try {
            const [inquiriesRes, trendingRes] = await Promise.all([
                apiFetch('/api/inquiries/admin/all'),
                apiFetch('/api/inquiries/trending')
            ]);

            if (inquiriesRes.ok) {
                const data = await inquiriesRes.json();
                setInquiries(data);
            }
            if (trendingRes.ok) {
                const trendingData = await trendingRes.json();
                setTrendingVehicles(trendingData);
            }
        } catch {
            showMessage("Could not load inquiries.", true);
        } finally {
            setLoading(false);
        }
    }, [showMessage]);

    const handleGeneratePDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.text("Samarasinghe Motors", 14, 22);

        doc.setFontSize(14);
        doc.setTextColor(150);
        doc.text("Trending Vehicles & Inquiry Analytics Report", 14, 30);

        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
        doc.text(`Total Vehicles Tracked: ${trendingVehicles.length}`, 14, 46);

        const tableColumn = ["Rank", "Vehicle ID", "Brand", "Model / Name", "Total Inquiries"];
        const tableRows = [];

        trendingVehicles.forEach((vehicle, index) => {
            const vehicleData = [
                index + 1,
                `#${vehicle.vehicleId}`,
                vehicle.brand || 'N/A',
                vehicle.name || 'N/A',
                `${vehicle.totalInquiries} Inquiries`
            ];
            tableRows.push(vehicleData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            theme: 'grid',
            headStyles: { fillColor: [22, 26, 34], textColor: [226, 183, 97] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { top: 55 }
        });

        doc.save(`Analytics_Report_${new Date().getTime()}.pdf`);
    };

    useEffect(() => {
        if (activeTab === 'payment') {
            fetchPendingPayments();
        } else if (activeTab === 'payment-history') {
            fetchAllPayments();
        } else if (activeTab === 'user') {
            fetchUsers();
        } else if (activeTab === 'rent-vehicle') {
            if (vehicleTab === 'rent') fetchRentVehicles();
            if (vehicleTab === 'sale') fetchSaleVehicles();
        } else if (activeTab === 'inquiries') {
            fetchInquiries();
        }
    }, [activeTab, vehicleTab, fetchPendingPayments, fetchAllPayments, fetchUsers, fetchRentVehicles, fetchSaleVehicles, fetchInquiries]);

    const handleReview = async (id, status) => {
        let remarks = "";
        if (status === 'REJECT') {
            remarks = window.prompt("Please enter a reason for rejection (e.g., Bank slip is not clear):");
            if (remarks === null) return; // User cancelled the prompt
            if (!remarks.trim()) {
                showMessage("Rejection reason is required.", true);
                return;
            }
        }

        try {
            const response = await apiFetch(`/api/payments/${id}/review`, {
                method: 'PUT',
                body: JSON.stringify({ status, remarks })
            });

            if (response.ok) {
                showMessage(`Payment ${status.toLowerCase()}ed successfully!`);
                fetchPendingPayments();
            } else {
                const text = await response.text();
                showMessage(text || `Failed to ${status.toLowerCase()} payment`, true);
            }
        } catch (error) {
            console.error(error);
            showMessage("Network Error! Please check if backend is running.", true);
        }
    };

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
                showMessage("Failed to download invoice. Ensure it's approved.", true);
            }
        } catch (error) {
            console.error("error downloading invoice:", error);
            showMessage("Error downloading invoice", true);
        }
    };

    const handleUpdateInquiryStatus = async (id, status, adminReply) => {
        try {
            const response = await apiFetch(`/api/inquiries/admin/status`, {
                method: 'PUT',
                body: JSON.stringify({ inquiryId: id, status, adminReply })
            });
            if (response.ok) {
                showMessage("Inquiry updated!");
                setInquiryActionObj(null);
                fetchInquiries();
            } else {
                showMessage("Failed to update inquiry", true);
            }
        } catch {
            showMessage("Network error", true);
        }
    };

    const handleFinalizeSale = async (vehicleId, inquiryId) => {
        if (!window.confirm("Finalize this sale? This will mark the vehicle as sold.")) return;
        try {
            const response = await apiFetch(`/api/inquiries/admin/finalize-sale`, {
                method: 'POST',
                body: JSON.stringify({ vehicleId, inquiryId })
            });
            if (response.ok) {
                showMessage("Sale finalized!");
                fetchInquiries();
            } else {
                showMessage("Failed to finalize", true);
            }
        } catch {
            showMessage("Network error", true);
        }
    };

    const handleDeleteInquiry = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this inquiry record?")) return;
        try {
            const response = await apiFetch(`/api/inquiries/admin/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showMessage("Inquiry record deleted successfully!");
                fetchInquiries();
            } else {
                const text = await response.text();
                showMessage(text || "Failed to delete inquiry", true);
            }
        } catch {
            showMessage("Network Error!", true);
        }
    };

    const handleUpdatePaymentDate = async () => {
        if (!newPaymentDate) {
            showMessage("Please select a valid date.", true);
            return;
        }

        try {
            const response = await apiFetch(`/api/payments/${editingPayment.paymentId}/review`, {
                method: 'PUT',
                body: JSON.stringify({
                    status: editingPayment.status,
                    paymentDate: newPaymentDate
                })
            });

            if (response.ok) {
                showMessage("Payment date updated successfully!");
                fetchPendingPayments();
                setEditingPayment(null);
            } else {
                const text = await response.text();
                showMessage(text || "Failed to update date", true);
            }
        } catch (error) {
            console.error(error);
            showMessage("Network Error!", true);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this user account?")) return;
        try {
            const response = await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showMessage("User account deleted successfully!");
                fetchUsers();
                setShowEditModal(false);
            } else {
                const text = await response.text();
                showMessage(text || "Failed to delete user", true);
            }
        } catch {
            showMessage("Network Error!", true);
        }
    };

    const handleViewCustomerReport = async (userId) => {
        try {
            const response = await apiFetch(`/api/reports/customer/${userId}/pdf`);
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            } else {
                showMessage("Failed to generate report", true);
            }
        } catch (error) {
            console.error("Error generating report:", error);
            showMessage("Network Error!", true);
        }
    };

    const handleUpdateUserByAdmin = async (e) => {
        e.preventDefault();
        try {
            const response = await apiFetch(`/api/users/${selectedUser.userId}/admin`, {
                method: 'PUT',
                body: JSON.stringify(selectedUser)
            });
            if (response.ok) {
                showMessage("User updated successfully!");
                fetchUsers();
                setShowEditModal(false);
            } else {
                const text = await response.text();
                showMessage(text || "Failed to update user", true);
            }
        } catch {
            showMessage("Network Error!", true);
        }
    };

    const handleAddRentVehicleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const payload = { ...vehicleFormData, admin: { userId: user?.userId } };
        formData.append('vehicleData', JSON.stringify(payload));
        if (vehicleImage) {
            formData.append('image', vehicleImage);
        }

        const isEdit = !!vehicleFormData.vehicleRentId;
        const url = isEdit ? `${BASE_URL}/api/vehicles/rent/${vehicleFormData.vehicleRentId}` : `${BASE_URL}/api/vehicles/rent`;

        try {
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token || ''}`
                },
                body: formData
            });
            if (response.ok) {
                showMessage(`Vehicle successfully ${isEdit ? 'updated' : 'added'}!`);
                setShowAddVehicleModal(false);
                fetchRentVehicles();
            } else {
                showMessage(`Failed to ${isEdit ? 'update' : 'add'} vehicle`, true);
            }
        } catch {
            showMessage("Network error!", true);
        }
    };

    const handleDeleteRentVehicle = async (id) => {
        if (!window.confirm("Are you sure you want to delete this rent vehicle?")) return;
        try {
            const response = await apiFetch(`/api/vehicles/rent/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showMessage("Vehicle deleted successfully!");
                fetchRentVehicles();
            } else {
                showMessage("Failed to delete vehicle", true);
            }
        } catch {
            showMessage("Network Error!", true);
        }
    };

    const handleAddSaleVehicleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const payload = { ...saleFormData, admin: { userId: user?.userId || user?.id } };
        formData.append('vehicleData', JSON.stringify(payload));
        if (saleImage) {
            formData.append('image', saleImage);
        }

        const isEdit = !!saleFormData.vehicleSaleId;
        const url = isEdit ? `${BASE_URL}/api/vehicles/sale/${saleFormData.vehicleSaleId}` : `${BASE_URL}/api/vehicles/sale`;

        try {
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${user?.token || ''}` },
                body: formData
            });
            if (response.ok) {
                showMessage(`Sale vehicle successfully ${isEdit ? 'updated' : 'added'}!`);
                setShowAddSaleModal(false);
                fetchSaleVehicles();
            } else {
                showMessage(`Failed to ${isEdit ? 'update' : 'add'} sale vehicle`, true);
            }
        } catch {
            showMessage("Network error!", true);
        }
    };

    const handleDeleteSaleVehicle = async (id) => {
        if (!window.confirm("Are you sure you want to delete this sale vehicle?")) return;
        try {
            const response = await apiFetch(`/api/vehicles/sale/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showMessage("Sale vehicle deleted successfully!");
                fetchSaleVehicles();
            } else {
                showMessage("Failed to delete sale vehicle", true);
            }
        } catch {
            showMessage("Network Error!", true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user || user.role?.toUpperCase() !== 'ADMIN') return null;

    return (
        <div className="admin-layout">
            {/* SIDEBAR */}
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <span><Link to="/" className="brand-logo">Samarasinghe Motors</Link></span>
                </div>

                <nav className="sidebar-nav">


                    <button
                        className={`nav-btn ${activeTab === 'user' ? 'active' : ''}`}
                        onClick={() => setActiveTab('user')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        User Management
                    </button>






                    <button
                        className={`nav-btn ${activeTab === 'rent-vehicle' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rent-vehicle')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        Vehicle Management
                    </button>

                    <button
                        className={`nav-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inquiries')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                        Sale Inquiries
                    </button>

                    <button
                        className={`nav-btn ${activeTab === 'payment' ? 'active' : ''}`}
                        onClick={() => setActiveTab('payment')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                        Payment Management
                        {pendingPayments.length > 0 && activeTab === 'payment' && (
                            <span className="badge">{pendingPayments.length} </span>
                        )}
                    </button>

                    <button
                        className={`nav-btn ${activeTab === 'payment-history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('payment-history')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="6" y1="8" x2="6" y2="8"></line><line x1="6" y1="12" x2="6" y2="12"></line><line x1="6" y1="16" x2="6" y2="16"></line>
                        </svg>
                        Payment History
                    </button>

                    <button
                        className={`nav-btn ${activeTab === 'promotions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('promotions')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                            <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                        Promotions
                    </button>

                    <button
                        className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                        Analytics
                    </button>

                    {/* Add visual padding for lower items */}
                    <div style={{ flexGrow: 1 }}></div>

                    <button className="nav-btn" onClick={handleLogout}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                    </button>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="admin-main">
                {/* Header Navbar */}
                <header className="admin-topbar">
                    <div className="topbar-title">
                        {activeTab === 'payment' ? (
                            <>
                                <h1>Payment Overview</h1>
                                <p>verify & review &bull; realtime metrics</p>
                            </>
                        ) : activeTab === 'payment-history' ? (
                            <>
                                <h1>Payment History</h1>
                                <p>transactions &bull; complete payment records</p>
                            </>
                        ) : activeTab === 'user' ? (
                            <>
                                <h1>User Management</h1>
                                <p>customers & admins &bull; system records</p>
                            </>
                        ) : activeTab === 'analytics' ? (
                            <>
                                <h1>Business Insights</h1>
                                <p>data &bull; trends &bull; performance</p>
                            </>
                        ) : (
                            <>
                                <h1>System Dashboard</h1>
                                <p>manage operations</p>
                            </>
                        )}
                    </div>
                    <div className="topbar-actions">
                        <div className="search-box">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                    </div>
                </header>

                {message && (
                    <div className={`admin-alert ${isError ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                <div className="admin-content">
                    {activeTab === 'payment' && (
                        <>
                            {/* Dashboard Metric Cards */}
                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <span className="metric-title">total pending</span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="5" width="20" height="14" rx="2" />
                                            <line x1="2" y1="10" x2="22" y2="10" />
                                        </svg>
                                    </div>
                                    <div className="metric-value">{pendingPayments.length}</div>
                                    <div className="metric-trend up">&uarr; Needs action</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <span className="metric-title">today's reviews</span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                        </svg>
                                    </div>
                                    <div className="metric-value">0</div>
                                    <div className="metric-trend default">- pending update</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <span className="metric-title">system status</span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </div>
                                    <div className="metric-value">Online</div>
                                    <div className="metric-trend up">&uarr; All systems operational</div>
                                </div>
                            </div>

                            <div className="section-header">
                                <h2>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#c9a052" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22, marginRight: 10, verticalAlign: 'middle' }}>
                                        <rect x="2" y="5" width="20" height="14" rx="2" />
                                        <line x1="2" y1="10" x2="22" y2="10" />
                                    </svg>
                                    Pending Payments
                                    {pendingPayments.length > 0 && (
                                        <span className="awaiting-badge">&bull; {pendingPayments.length} AWAITING</span>
                                    )}
                                </h2>
                                <button className="refresh-btn" onClick={fetchPendingPayments}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
                                    Refresh
                                </button>
                            </div>

                            {loading ? (
                                <div className="loading-state">Syncing secure data...</div>
                            ) : pendingPayments.length === 0 ? (
                                <div className="empty-state">No pending payments for review.</div>
                            ) : (
                                <div className="pending-table-wrapper">
                                    <table className="pending-table">
                                        <thead>
                                            <tr>
                                                <th>PAYMENT ID</th>
                                                <th>CUSTOMER</th>
                                                <th>BOOKING ID</th>
                                                <th>AMOUNT</th>
                                                <th>DATE</th>
                                                <th>BANK SLIP</th>
                                                <th>ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingPayments.map((payment) => (
                                                <tr key={payment.paymentId}>
                                                    <td className="fw-bold">#{payment.paymentId}</td>
                                                    <td>
                                                        <div className="user-cell" style={{ gap: '10px' }}>
                                                            <div className="user-avatar" style={{ width: '30px', height: '30px', fontSize: '11px', fontWeight: 'bold' }}>
                                                                ID:{payment.booking?.customer?.userId || '?'}
                                                            </div>
                                                            <div className="u-name" style={{ fontSize: '13px' }}>
                                                                {payment.booking?.customer?.fullName || 'Unknown Customer'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="fw-bold">
                                                        #{payment.booking?.bookingId || payment.bookingId || 'N/A'}
                                                    </td>
                                                    <td className="text-gold fw-bold">
                                                        Rs. {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                                    </td>
                                                    <td className="text-muted">
                                                        {payment.paymentDate}
                                                    </td>
                                                    <td>
                                                        <a
                                                            href={`${BASE_URL}${payment.bankSlipUrl}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="btn-view-slip"
                                                        >
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                            View Slip
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons-group">
                                                            <button
                                                                className="btn-edit-date"
                                                                onClick={() => {
                                                                    setEditingPayment(payment);
                                                                    setNewPaymentDate(payment.paymentDate);
                                                                }}
                                                                title="Edit Date"
                                                            >
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                            </button>
                                                            <button
                                                                className="btn-approve"
                                                                onClick={() => handleReview(payment.paymentId, 'APPROVE')}
                                                            >
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                                Approve
                                                            </button>
                                                            <button
                                                                className="btn-reject"
                                                                onClick={() => handleReview(payment.paymentId, 'REJECT')}
                                                            >
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'payment-history' && (
                        <div className="payment-history-section">
                            <div className="section-header">
                                <h2>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#c9a052" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22, marginRight: 10, verticalAlign: 'middle' }}>
                                        <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="6" y1="8" x2="6" y2="8"></line><line x1="6" y1="12" x2="6" y2="12"></line><line x1="6" y1="16" x2="6" y2="16"></line>
                                    </svg>
                                    All Transaction Records
                                </h2>
                                <button className="refresh-btn" onClick={fetchAllPayments}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
                                    Refresh
                                </button>
                            </div>

                            {loading ? (
                                <div className="loading-state">Fetching all payment records...</div>
                            ) : allPayments.length === 0 ? (
                                <div className="empty-state">No payment records found.</div>
                            ) : (
                                <div className="user-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>PAYMENT ID</th>
                                                <th>CUSTOMER</th>
                                                <th>BOOKING ID</th>
                                                <th>AMOUNT</th>
                                                <th>DATE</th>
                                                <th>STATUS</th>
                                                <th>REMARKS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allPayments.filter(payment => {
                                                const pId = String(payment.paymentId || payment.id || '');
                                                const bId = String(payment.booking?.bookingId || payment.booking?.id || '');
                                                const customerName = (payment.booking?.customer?.fullName || '').toLowerCase();
                                                const search = searchTerm.toLowerCase();
                                                return pId.includes(searchTerm) || bId.includes(searchTerm) || customerName.includes(search);
                                            }).map((payment) => (
                                                <tr key={payment.paymentId || payment.id}>
                                                    <td className="u-name">#{payment.paymentId || payment.id || 'N/A'}</td>
                                                    <td>
                                                        <div className="user-cell" style={{ gap: '10px' }}>
                                                            <div className="user-avatar" style={{ width: '30px', height: '30px', fontSize: '11px', fontWeight: 'bold' }}>
                                                                ID:{payment.booking?.customer?.userId || '?'}
                                                            </div>
                                                            <div className="u-name" style={{ fontSize: '13px' }}>
                                                                {payment.booking?.customer?.fullName || 'Unknown Customer'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="u-name">
                                                        #{payment.booking?.bookingId || payment.booking?.id || payment.bookingId || 'N/A'}
                                                    </td>
                                                    <td className="text-gold fw-bold">
                                                        Rs. {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                                    </td>
                                                    <td className="text-muted">
                                                        {payment.paymentDate}
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${payment.status?.toLowerCase() === 'approved' ? 'available' : payment.status?.toLowerCase() === 'rejected' ? 'maintenance' : 'rented'}`}>
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={payment.remarks || 'N/A'}>
                                                        {payment.remarks || '-'}
                                                    </td>
                                                    <td>
                                                        {payment.status?.toLowerCase() === 'approved' ? (
                                                            <button
                                                                className="btn-view-slip"
                                                                onClick={() => handleDownloadInvoice(payment.paymentId || payment.id)}
                                                                title="Download Invoice PDF"
                                                            >
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                                                </svg>
                                                                Invoice
                                                            </button>
                                                        ) : (
                                                            <span className="text-muted" style={{ fontSize: '12px' }}>N/A</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'user' && (
                        <div className="user-management-section">
                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <span className="metric-title">total users</span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                                    </div>
                                    <div className="metric-value">{users.length}</div>
                                    <div className="metric-trend up">&uarr; System accounts</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <span className="metric-title">active users</span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    </div>
                                    <div className="metric-value">{users.filter(u => u.status === 'ACTIVE').length}</div>
                                    <div className="metric-trend up">&uarr; Regular status</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <span className="metric-title">blocked users</span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                    </div>
                                    <div className="metric-value">{users.filter(u => u.status === 'BLOCKED').length}</div>
                                    <div className="metric-trend down">Restricted access</div>
                                </div>
                            </div>

                            <div className="section-header">
                                <h2><svg viewBox="0 0 24 24" fill="none" stroke="#c9a052" strokeWidth="2" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> User Directory &bull; manage accounts</h2>
                            </div>

                            {loading ? (
                                <div className="loading-state">Fetching user records...</div>
                            ) : (
                                <div className="user-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>User Info</th>
                                                <th>NIC</th>
                                                <th>Contact</th>
                                                <th>Role</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.filter(u =>
                                                u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                u.nic?.toLowerCase().includes(searchTerm.toLowerCase())
                                            ).map(u => (
                                                <tr key={u.userId}>
                                                    <td>
                                                        <div className="user-cell">
                                                            <div className="user-avatar">{u.fullName?.charAt(0)}</div>
                                                            <div>
                                                                <div className="u-name">{u.fullName}</div>
                                                                <div className="u-email">{u.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{u.nic}</td>
                                                    <td>{u.phone}</td>
                                                    <td>
                                                        <span className={`role-badge ${u.role?.toUpperCase() === 'ADMIN' ? 'admin' : 'customer'}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-pill ${u.status === 'ACTIVE' ? 'active' : 'blocked'}`}>
                                                            {u.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="table-actions">
                                                            {u.role?.toUpperCase() === 'CUSTOMER' && (
                                                                <button
                                                                    className="icon-action report"
                                                                    onClick={() => handleViewCustomerReport(u.userId)}
                                                                    title="View 90-Day Activity Report"
                                                                >
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                                        <polyline points="14 2 14 8 20 8"></polyline>
                                                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                                                        <polyline points="10 9 9 9 8 9"></polyline>
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            <button
                                                                className="icon-action edit"
                                                                onClick={() => { setSelectedUser(u); setShowEditModal(true); }}
                                                                title="Edit Profile"
                                                            >
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                            </button>
                                                            <button
                                                                className="icon-action delete"
                                                                onClick={() => handleDeleteUser(u.userId)}
                                                                title="Delete Account"
                                                            >
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Edit Modal */}
                            {showEditModal && selectedUser && (
                                <div className="modal-overlay">
                                    <div className="admin-modal">
                                        <div className="modal-header">
                                            <h3>Modify User Account</h3>
                                            <button className="close-btn" onClick={() => setShowEditModal(false)}>&times;</button>
                                        </div>
                                        <form onSubmit={handleUpdateUserByAdmin} className="admin-form">
                                            <div className="form-grid">
                                                <div className="form-group">
                                                    <label>Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={selectedUser.fullName}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Phone Number</label>
                                                    <input
                                                        type="text"
                                                        value={selectedUser.phone}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>NIC Number</label>
                                                    <input
                                                        type="text"
                                                        value={selectedUser.nic}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, nic: e.target.value })}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>System Role</label>
                                                    <select
                                                        value={selectedUser.role}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                                                    >
                                                        <option value="Customer">Customer</option>
                                                        <option value="Admin">Admin</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Account Status</label>
                                                    <select
                                                        value={selectedUser.status}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                                                    >
                                                        <option value="ACTIVE">ACTIVE</option>
                                                        <option value="BLOCKED">BLOCKED</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Reset Password</label>
                                                    <input
                                                        type="password"
                                                        placeholder="Enter new password to reset"
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="action-btn danger" onClick={() => handleDeleteUser(selectedUser.userId)}>Delete Account</button>
                                                <button type="submit" className="action-btn success">Save & Update</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'rent-vehicle' && (
                        <div className="rent-vehicle-section">
                            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <h2>🚙 Vehicle Management</h2>
                                    <div className="tab-pills" style={{ display: 'flex', gap: '10px', background: '#1a1a1a', padding: '5px', borderRadius: '8px' }}>
                                        <button className={`pill-btn ${vehicleTab === 'rent' ? 'active' : ''}`} onClick={() => setVehicleTab('rent')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: vehicleTab === 'rent' ? '#c9a052' : 'transparent', color: vehicleTab === 'rent' ? '#000' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Rent Vehicles</button>
                                        <button className={`pill-btn ${vehicleTab === 'sale' ? 'active' : ''}`} onClick={() => setVehicleTab('sale')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: vehicleTab === 'sale' ? '#c9a052' : 'transparent', color: vehicleTab === 'sale' ? '#000' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Sale Vehicles</button>
                                    </div>
                                </div>
                                {vehicleTab === 'rent' && (
                                    <button className="action-btn success" onClick={() => {
                                        setVehicleFormData({
                                            name: '', type: 'Sedan', year: 2024, dailyRate: '', status: 'Available',
                                            description: '', mileageLimit: 100, extraMileageCharge: '',
                                            avgFuelEfficiency: '', gearType: 'Auto', seats: 4, fuelType: 'Petrol'
                                        });
                                        setVehicleImage(null);
                                        setShowAddVehicleModal(true);
                                    }}>
                                        + Add Rent Vehicle
                                    </button>
                                )}
                                {vehicleTab === 'sale' && (
                                    <button className="action-btn success" onClick={() => {
                                        setSaleFormData({
                                            name: '', conditionStatus: 'Used', yearReg: 2020, yom: 2020, edition: '', scanReportUrl: '',
                                            status: 'Available', brand: 'Toyota', transmission: 'Auto', bodyType: 'Sedan',
                                            engineCap: '1500cc', mileage: '', color: 'White', price: '', description: ''
                                        });
                                        setSaleImage(null);
                                        setShowAddSaleModal(true);
                                    }}>
                                        + Add Sale Vehicle
                                    </button>
                                )}
                            </div>

                            {vehicleTab === 'rent' && (
                                <>
                                    <div className="user-table-wrapper">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Vehicle</th>
                                                    <th>Specs</th>
                                                    <th>Conditions</th>
                                                    <th>Status</th>
                                                    <th>Rate (Rs.)</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rentVehicles.map(v => (
                                                    <tr key={v.vehicleRentId}>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                {v.images && v.images.length > 0 ? (
                                                                    <img src={v.images[0].imgUrl} alt="car" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 5 }} />
                                                                ) : (
                                                                    <div style={{ width: 60, height: 40, background: '#333', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚗</div>
                                                                )}
                                                                <div>
                                                                    <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{v.name}</div>
                                                                    <div className="text-muted" style={{ fontSize: '11px' }}>{v.year} &bull; {v.type}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontSize: '12px' }}>⛽ {v.fuelType} ({v.avgFuelEfficiency || 'N/A'})</div>
                                                            <div className="text-muted" style={{ fontSize: '11px' }}>⚙️ {v.gearType} &bull; 💺 {v.seats} Seats</div>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontSize: '12px' }}>Limit: {v.mileageLimit || 'N/A'} km</div>
                                                            <div className="text-muted" style={{ fontSize: '11px' }}>Extra: Rs. {v.extraMileageCharge || 0}/km</div>
                                                        </td>
                                                        <td><span className={`status-pill ${v.status === 'Available' ? 'active' : 'blocked'}`}>{v.status}</span></td>
                                                        <td className="text-gold fw-bold">Rs. {v.dailyRate}</td>
                                                        <td>
                                                            <div className="table-actions">
                                                                <button
                                                                    className="icon-action track"
                                                                    onClick={() => window.open('https://en.aika168.com/Monitor.aspx', '_blank')}
                                                                    title="Track Vehicle"
                                                                >
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                                        <circle cx="12" cy="10" r="3"></circle>
                                                                    </svg>
                                                                </button>
                                                                <button className="icon-action edit" onClick={() => {
                                                                    setVehicleFormData(v);
                                                                    setVehicleImage(null);
                                                                    setShowAddVehicleModal(true);
                                                                }}>
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                                </button>
                                                                <button className="icon-action delete" onClick={() => handleDeleteRentVehicle(v.vehicleRentId)}>
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Add Rent Vehicle Modal */}
                                    {showAddVehicleModal && (
                                        <div className="modal-overlay">
                                            <div className="admin-modal" style={{ maxWidth: '800px' }}>
                                                <div className="modal-header">
                                                    <h3>{vehicleFormData.vehicleRentId ? 'Edit' : 'Add New'} Rent Vehicle</h3>
                                                    <button className="close-btn" onClick={() => setShowAddVehicleModal(false)}>&times;</button>
                                                </div>
                                                <form onSubmit={handleAddRentVehicleSubmit} className="admin-form">
                                                    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                                                        <div className="form-group"><label>Name</label><input type="text" required value={vehicleFormData.name} onChange={e => setVehicleFormData({ ...vehicleFormData, name: e.target.value })} /></div>
                                                        <div className="form-group"><label>Type</label><input type="text" required value={vehicleFormData.type} onChange={e => setVehicleFormData({ ...vehicleFormData, type: e.target.value })} /></div>
                                                        <div className="form-group"><label>Year</label><input type="number" min="1900" max="2100" required value={vehicleFormData.year} onChange={e => setVehicleFormData({ ...vehicleFormData, year: e.target.value })} /></div>

                                                        <div className="form-group"><label>Daily Rate (Rs.)</label><input type="number" min="0" step="0.01" required value={vehicleFormData.dailyRate} onChange={e => setVehicleFormData({ ...vehicleFormData, dailyRate: e.target.value })} /></div>
                                                        <div className="form-group"><label>Mileage Limit</label><input type="number" min="0" value={vehicleFormData.mileageLimit} onChange={e => setVehicleFormData({ ...vehicleFormData, mileageLimit: e.target.value })} /></div>
                                                        <div className="form-group"><label>Extra Mileage (Rs)</label><input type="number" min="0" step="0.01" value={vehicleFormData.extraMileageCharge} onChange={e => setVehicleFormData({ ...vehicleFormData, extraMileageCharge: e.target.value })} /></div>

                                                        <div className="form-group"><label>Gear Type</label><select value={vehicleFormData.gearType} onChange={e => setVehicleFormData({ ...vehicleFormData, gearType: e.target.value })}><option value="Auto">Auto</option><option value="Manual">Manual</option></select></div>
                                                        <div className="form-group"><label>Fuel Type</label><select value={vehicleFormData.fuelType} onChange={e => setVehicleFormData({ ...vehicleFormData, fuelType: e.target.value })}><option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="Hybrid">Hybrid</option><option value="Electric">Electric</option></select></div>
                                                        <div className="form-group"><label>Seats</label><input type="number" min="1" max="100" required value={vehicleFormData.seats} onChange={e => setVehicleFormData({ ...vehicleFormData, seats: e.target.value })} /></div>

                                                        <div className="form-group"><label>Fuel Efficiency (km/l)</label><input type="text" value={vehicleFormData.avgFuelEfficiency} onChange={e => setVehicleFormData({ ...vehicleFormData, avgFuelEfficiency: e.target.value })} /></div>
                                                        <div className="form-group"><label>Status</label><select value={vehicleFormData.status} onChange={e => setVehicleFormData({ ...vehicleFormData, status: e.target.value })}><option value="Available">Available</option><option value="Reserved">Reserved</option><option value="Rented">Rented</option></select></div>
                                                        <div className="form-group"><label>Vehicle Image</label><input type="file" accept="image/*" onChange={e => setVehicleImage(e.target.files[0])} style={{ padding: '8px' }} /></div>
                                                    </div>
                                                    <div className="form-group" style={{ marginTop: '15px' }}><label>Description</label><textarea rows="3" value={vehicleFormData.description} onChange={e => setVehicleFormData({ ...vehicleFormData, description: e.target.value })}></textarea></div>
                                                    <div className="modal-footer"><button type="submit" className="action-btn success">{vehicleFormData.vehicleRentId ? 'Update' : 'Save'} Vehicle</button></div>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {vehicleTab === 'sale' && (
                                <>
                                    <div className="user-table-wrapper">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Vehicle</th>
                                                    <th>Specs</th>
                                                    <th>Condition</th>
                                                    <th>Price (Rs.)</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {saleVehicles.map(v => (
                                                    <tr key={v.vehicleSaleId}>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                {v.images && v.images.length > 0 ? (
                                                                    <img src={v.images[0].imgUrl} alt="car" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 5 }} />
                                                                ) : (
                                                                    <div style={{ width: 60, height: 40, background: '#333', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚗</div>
                                                                )}
                                                                <div>
                                                                    <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{v.name}</div>
                                                                    <div className="text-muted" style={{ fontSize: '11px' }}>{v.brand} &bull; {v.yom}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontSize: '12px' }}>⚙️ {v.transmission} ({v.engineCap})</div>
                                                            <div className="text-muted" style={{ fontSize: '11px' }}>🚙 {v.bodyType} &bull; 🎨 {v.color}</div>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontSize: '12px' }}>{v.conditionStatus} &bull; {v.mileage} km</div>
                                                            {v.scanReportUrl && <a href={v.scanReportUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#3b82f6' }}>Scan Report</a>}
                                                        </td>
                                                        <td className="text-gold fw-bold">
                                                            <div style={{ fontSize: '13px' }}>Rs. {v.price}</div>
                                                            <div><span className={`status-pill ${v.status === 'Available' ? 'active' : 'blocked'}`}>{v.status}</span></div>
                                                        </td>
                                                        <td>
                                                            <div className="table-actions">
                                                                <button
                                                                    className="icon-action track"
                                                                    onClick={() => window.open('https://en.aika168.com/Monitor.aspx', '_blank')}
                                                                    title="Track Vehicle"
                                                                >
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                                        <circle cx="12" cy="10" r="3"></circle>
                                                                    </svg>
                                                                </button>
                                                                <button className="icon-action edit" onClick={() => {
                                                                    setSaleFormData(v);
                                                                    setSaleImage(null);
                                                                    setShowAddSaleModal(true);
                                                                }} title="Edit Vehicle">
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                                </button>
                                                                <button className="icon-action delete" onClick={() => handleDeleteSaleVehicle(v.vehicleSaleId)} title="Delete Vehicle">
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {showAddSaleModal && (
                                        <div className="modal-overlay">
                                            <div className="admin-modal" style={{ maxWidth: '800px' }}>
                                                <div className="modal-header">
                                                    <h3>{saleFormData.vehicleSaleId ? 'Edit' : 'Add New'} Sale Vehicle</h3>
                                                    <button className="close-btn" onClick={() => setShowAddSaleModal(false)}>&times;</button>
                                                </div>
                                                <form onSubmit={handleAddSaleVehicleSubmit} className="admin-form">
                                                    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                                                        <div className="form-group"><label>Name</label><input type="text" required value={saleFormData.name} onChange={e => setSaleFormData({ ...saleFormData, name: e.target.value })} /></div>
                                                        <div className="form-group"><label>Brand</label><input type="text" value={saleFormData.brand} onChange={e => setSaleFormData({ ...saleFormData, brand: e.target.value })} /></div>
                                                        <div className="form-group"><label>Body Type</label><input type="text" value={saleFormData.bodyType} onChange={e => setSaleFormData({ ...saleFormData, bodyType: e.target.value })} /></div>

                                                        <div className="form-group"><label>YOM</label><input type="number" min="1900" max="2100" required value={saleFormData.yom} onChange={e => setSaleFormData({ ...saleFormData, yom: e.target.value })} /></div>
                                                        <div className="form-group"><label>Year Registered</label><input type="number" min="1900" max="2100" value={saleFormData.yearReg} onChange={e => setSaleFormData({ ...saleFormData, yearReg: e.target.value })} /></div>
                                                        <div className="form-group"><label>Price (Rs.)</label><input type="number" min="0" step="0.01" required value={saleFormData.price} onChange={e => setSaleFormData({ ...saleFormData, price: e.target.value })} /></div>

                                                        <div className="form-group"><label>Transmission</label><select value={saleFormData.transmission} onChange={e => setSaleFormData({ ...saleFormData, transmission: e.target.value })}><option value="Auto">Auto</option><option value="Manual">Manual</option><option value="Tiptronic">Tiptronic</option></select></div>
                                                        <div className="form-group"><label>Condition</label><select value={saleFormData.conditionStatus} onChange={e => setSaleFormData({ ...saleFormData, conditionStatus: e.target.value })}><option value="Brand New">Brand New</option><option value="Used">Used</option><option value="Reconditioned">Reconditioned</option></select></div>
                                                        <div className="form-group"><label>Mileage (km)</label><input type="number" min="0" value={saleFormData.mileage} onChange={e => setSaleFormData({ ...saleFormData, mileage: e.target.value })} /></div>

                                                        <div className="form-group"><label>Engine Capacity</label><input type="text" value={saleFormData.engineCap} onChange={e => setSaleFormData({ ...saleFormData, engineCap: e.target.value })} /></div>
                                                        <div className="form-group"><label>Color</label><input type="text" value={saleFormData.color} onChange={e => setSaleFormData({ ...saleFormData, color: e.target.value })} /></div>
                                                        <div className="form-group"><label>Status</label><select value={saleFormData.status} onChange={e => setSaleFormData({ ...saleFormData, status: e.target.value })}><option value="Available">Available</option><option value="Sold">Sold</option><option value="Reserved">Reserved</option></select></div>

                                                        <div className="form-group"><label>Edition</label><input type="text" value={saleFormData.edition} onChange={e => setSaleFormData({ ...saleFormData, edition: e.target.value })} /></div>
                                                        <div className="form-group"><label>Scan Report URL</label><input type="text" placeholder="https://" value={saleFormData.scanReportUrl} onChange={e => setSaleFormData({ ...saleFormData, scanReportUrl: e.target.value })} /></div>
                                                        <div className="form-group"><label>Vehicle Image</label><input type="file" accept="image/*" onChange={e => setSaleImage(e.target.files[0])} style={{ padding: '8px' }} /></div>
                                                    </div>
                                                    <div className="form-group" style={{ marginTop: '15px' }}><label>Description</label><textarea rows="3" value={saleFormData.description} onChange={e => setSaleFormData({ ...saleFormData, description: e.target.value })}></textarea></div>
                                                    <div className="modal-footer"><button type="submit" className="action-btn success">{saleFormData.vehicleSaleId ? 'Update' : 'Save'} Vehicle</button></div>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'inquiries' && (
                        <>
                            <div className="section-header">
                                <h2>
                                    <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>📩</span>
                                    Customer Sale Inquiries
                                </h2>
                                <button className="refresh-btn" onClick={fetchInquiries}>Refresh</button>
                            </div>

                            {loading ? <div className="loading-state">Fetching inquiries...</div> : inquiries.length === 0 ? <div className="empty-state">No inquiries found.</div> : (
                                <div className="inquiries-dashboard-grid">
                                    {/* Left Panel: Active Inquiries List */}
                                    <div className="inquiries-list-panel">
                                        {inquiries.map(inq => (
                                            <div key={inq.inquiryId} className="inq-admin-card">
                                                <div className="inq-header">
                                                    <div>
                                                        <span className="inq-date">{inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'Invalid Date'}</span>
                                                        <h3 className="inq-vehicle">{inq.vehicleName}</h3>
                                                        <div className="inq-price">Rs. {inq.vehiclePrice ? (inq.vehiclePrice / 1000000).toFixed(1) + 'M' : 'N/A'}</div>
                                                    </div>
                                                    <div className="inq-actions">
                                                        <span className={`inq-badge ${inq.inquiryType === 'BUY_NOW' ? 'badge-buy' : 'badge-neg'}`}>
                                                            {inq.inquiryType === 'BUY_NOW' ? 'BUY NOW' : 'NEGOTIATION'}
                                                        </span>

                                                        {inq.status !== 'ACCEPTED' && inq.status !== 'REJECTED' && (
                                                            <button className="inq-btn inq-outline" onClick={() => setInquiryActionObj({ id: inq.inquiryId, type: 'status' })}>Reply / Update</button>
                                                        )}
                                                        {inq.inquiryType === 'BUY_NOW' && inq.status !== 'ACCEPTED' && inq.status !== 'REJECTED' && (
                                                            <button className="inq-btn inq-gold" onClick={() => handleFinalizeSale(inq.vehicleId, inq.inquiryId)}>Finalize Sale</button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="inq-message-box">
                                                    <div className="msg-lbl">MESSAGE FROM {inq.userName.toUpperCase()} ({inq.userPhone}):</div>
                                                    <div className="msg-text">"{inq.message}"</div>
                                                </div>

                                                <div className="inq-footer">
                                                    <div className="inq-status-lbl">Current Status: <span className={inq.status === 'Unread' ? 'status-bold' : ''}>{inq.status}</span></div>
                                                    {inq.adminReply && <div className="inq-admin-reply">Your Reply: "{inq.adminReply}"</div>}
                                                    <button className="inq-del-btn" onClick={() => handleDeleteInquiry(inq.inquiryId)}>Delete Record</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Right Panel: Analytics Report */}
                                    <div className="analytics-panel">
                                        <div className="analytics-header">
                                            <h3>Analytics Report</h3>
                                            <span className="chart-icon">📈</span>
                                        </div>

                                        <div className="analytics-stats-grid">
                                            <div className="stat-box">
                                                <div className="stat-lbl">TOTAL INQUIRIES</div>
                                                <div className="stat-val">{inquiries.length}</div>
                                            </div>
                                            <div className="stat-box">
                                                <div className="stat-lbl">TOP BRAND</div>
                                                <div className="stat-val gold">{trendingVehicles[0]?.brand || 'N/A'}</div>
                                            </div>
                                        </div>

                                        <div className="trending-list-wrapper">
                                            <h4>Top Trending Vehicles</h4>
                                            {trendingVehicles.map((tv, idx) => (
                                                <div key={tv.vehicleId} className="trending-item">
                                                    <div className="trend-left">
                                                        <span className="trend-rank">{idx + 1}</span>
                                                        <span className="trend-name">{tv.brand} {tv.name}</span>
                                                    </div>
                                                    <div className="trend-right">
                                                        <span className="trend-count">{tv.totalInquiries} 🔥</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button className="generate-pdf-btn" onClick={handleGeneratePDF}>
                                            📄 Generate PDF Report
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Reply Modal */}
                            {inquiryActionObj?.type === 'status' && (
                                <div className="inq-modal-overlay">
                                    <div className="inq-reply-modal">
                                        <h3>Reply to Inquiry #{inquiryActionObj.id}</h3>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            handleUpdateInquiryStatus(inquiryActionObj.id, e.target.status.value, e.target.adminReply.value);
                                        }}>
                                            <div className="form-group custom-inq-group">
                                                <label>SET STATUS</label>
                                                <select name="status" className="inq-select">
                                                    <option value="PENDING">PENDING</option>
                                                    <option value="ACCEPTED">ACCEPTED</option>
                                                    <option value="REJECTED">REJECTED</option>
                                                    <option value="REPLIED">REPLIED</option>
                                                </select>
                                            </div>
                                            <div className="form-group custom-inq-group">
                                                <label>ADMIN MESSAGE</label>
                                                <textarea name="adminReply" className="inq-textarea" required placeholder="Type your reply to the customer..."></textarea>
                                            </div>
                                            <div className="inq-modal-actions">
                                                <button type="submit" className="inq-submit-gold">Update Inquiry</button>
                                                <button type="button" className="inq-cancel-btn" onClick={() => setInquiryActionObj(null)}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'promotions' && (
                        <div className="promo-management-wrapper">
                            <PromotionManager />
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <AdminAnalytics />
                    )}
                </div>
            </main>

            {/* Edit Payment Date Modal */}
            {editingPayment && (
                <div className="modal-overlay">
                    <div className="admin-modal" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3>Update Payment Date</h3>
                            <button className="close-btn" onClick={() => setEditingPayment(null)}>&times;</button>
                        </div>
                        <div className="admin-form" style={{ padding: '20px' }}>
                            <div className="form-group">
                                <label>Correct Date (from Bank Slip)</label>
                                <div
                                    className="date-picker-wrapper"
                                    style={{ position: 'relative', cursor: 'pointer' }}
                                    onClick={() => dateInputRef.current?.showPicker()}
                                >
                                    <input
                                        type="date"
                                        ref={dateInputRef}
                                        value={newPaymentDate}
                                        onChange={(e) => setNewPaymentDate(e.target.value)}
                                        className="dc-input"
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 40px',
                                            background: '#1a1a1a',
                                            border: '1px solid #333',
                                            color: 'white',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#c9a052"
                                        strokeWidth="2"
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '20px',
                                            height: '20px',
                                            pointerEvents: 'none'
                                        }}
                                    >
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ marginTop: '20px', borderTop: 'none', padding: 0 }}>
                                <button type="button" className="action-btn" onClick={() => setEditingPayment(null)}>Cancel</button>
                                <button type="button" className="action-btn success" onClick={handleUpdatePaymentDate}>Update Record</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;