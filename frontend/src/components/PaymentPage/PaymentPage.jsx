import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiFetch from '../../services/api';
import toast from 'react-hot-toast';
import './PaymentPage.css';

function PaymentPage() {

    const location = useLocation();
    const navigate = useNavigate();

    const [paymentDate, setPaymentDate] = useState('');
    const [file, setFile] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    React.useEffect(() => {
        if (!location.state) {
            navigate('/');
        }
    }, [location, navigate]);

    if (!location.state) {
        return null;
    }

    const { bookingId, totalCost } = location.state;

    // --- Reusable cancellation logic ---
    const performCancellation = async (showToast = false) => {
        try {
            const response = await apiFetch(`/api/bookings/${bookingId}/cancel`, {
                method: 'DELETE'
            });
            if (response.ok && showToast) {
                toast.success("The booking has been successfully cancelled.");
            }
            return response.ok;
        } catch (err) {
            console.error("Auto-cancellation failed:", err);
            return false;
        }
    };

    // --- Cleanup Effect: Handles tab close warning ---
    React.useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!isSubmitted) {
                e.preventDefault();
                e.returnValue = ''; // Standard way to show "Are you sure?" browser dialog
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isSubmitted]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
            
            if (!allowedExtensions.includes(fileExtension)) {
                toast.error("Invalid file type! Please upload a JPG, PNG, or PDF.");
                e.target.value = null; // Clear the input
                setFile(null);
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file || !paymentDate) {
            toast.error("Please enter the date and upload the bank slip.");
            return;
        }

        const loadingToast = toast.loading("Uploading your bank slip...");

        const formData = new FormData();
        formData.append("bookingId", bookingId);
        formData.append("amount", totalCost);
        formData.append("paymentDate", paymentDate);
        formData.append("file", file);

        try {
            const response = await apiFetch('/api/payments/upload', {
                method: 'POST',
                body: formData,
            });

            const resultText = await response.text();

            if (response.ok) {
                setIsSubmitted(true); // Prevent auto-cancel on unmount
                toast.success("Payment Uploaded! Waiting for Admin Approval.", { id: loadingToast });
                navigate('/success');
            } else {
                toast.error(resultText, { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error("Network error! Please check if the backend is running.", { id: loadingToast });
        }
    };

    const handleCancel = async () => {
        const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
        if (!confirmCancel) return;

        const success = await performCancellation(true);
        if (success) {
            setIsSubmitted(true); // Don't trigger auto-cancel again
            navigate('/');
        } else {
            toast.error("Failed to cancel booking. Please try again.");
        }
    };

    return (
        <div className="payment-container">

            {/* ---- Page Header ---- */}
            <div className="payment-header">
                <h1 className="payment-page-title">Complete Your Payment</h1>
                <p className="payment-page-subtitle">Transfer the amount and upload your bank slip to confirm the booking</p>
            </div>

            {/* ---- Steps Bar ---- */}
            <div className="steps-bar">
                <div className="step done">
                    <div className="step-circle">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <span className="step-label">Vehicle Selected</span>
                </div>
                <div className="step-line" />
                <div className="step done">
                    <div className="step-circle">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <span className="step-label">Booking Created</span>
                </div>
                <div className="step-line" />
                <div className="step active">
                    <div className="step-circle">3</div>
                    <span className="step-label">Payment</span>
                </div>
                <div className="step-line" />
                <div className="step upcoming">
                    <div className="step-circle">4</div>
                    <span className="step-label">Confirmation</span>
                </div>
            </div>

            {/* ---- Two-Column Layout ---- */}
            <div className="payment-layout">

                {/* ============================================
                    LEFT — Bank Transfer Details
                    ============================================ */}
                <div className="bank-transfer-card">
                    <div className="bank-card-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                        <h3>Bank Transfer Details</h3>
                    </div>

                    <div className="bank-details-body">

                        {/* Amount Due */}
                        <div className="amount-due-row">
                            <div className="amount-due-label">
                                <strong>Amount Due</strong>
                                Booking #{bookingId}
                            </div>
                            <div>
                                <div className="amount-due-value">Rs. {totalCost.toLocaleString()}</div>
                                <div className="amount-due-sub">Exact amount only</div>
                            </div>
                        </div>

                        {/* Bank Details */}
                        {[
                            { label: 'Bank Name', value: 'Bank of Ceylon (BOC)' },
                            { label: 'Account Name', value: 'Samarasinghe Motors' },
                            { label: 'Account Number', value: '8020 5567 1234' },
                            { label: 'Branch', value: 'Colombo 03' },
                            { label: 'Swift Code', value: 'BCEYLKLX' },
                        ].map(({ label, value }) => (
                            <div className="bank-detail-row" key={label}>
                                <span className="bank-detail-label">{label}</span>
                                <span className="bank-detail-value">
                                    {value}
                                    <button
                                        type="button"
                                        className="copy-btn"
                                        onClick={() => navigator.clipboard?.writeText(value)}
                                        title="Copy"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                        </svg>
                                    </button>
                                </span>
                            </div>
                        ))}

                        {/* Warning */}
                        <div className="payment-notice">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <p>Transfer the <strong>exact amount</strong> shown above. Use your <strong>Booking ID #{bookingId}</strong> as the payment reference. Incorrect amounts may delay approval.</p>
                        </div>
                    </div>

                    {/* How to Pay Steps */}
                    <div className="how-to-pay">
                        <h4>How to complete payment</h4>
                        <div className="pay-steps">
                            {[
                                'Log in to your online banking or visit a BOC branch.',
                                `Transfer exactly Rs. ${totalCost.toLocaleString()} using the details above.`,
                                `Use Booking ID #${bookingId} as the payment reference.`,
                                'Take a screenshot or photo of the transaction slip.',
                                'Upload the slip on the right and submit.'
                            ].map((text, i) => (
                                <div className="pay-step" key={i}>
                                    <span className="pay-step-num">{i + 1}</span>
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ============================================
                    RIGHT — Upload Form
                    ============================================ */}
                <div className="upload-card">
                    <div className="upload-card-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <h3>Upload Bank Slip</h3>
                    </div>

                    <div className="upload-form-body">

                        {/* Booking ID pill */}
                        <div className="booking-id-pill">
                            <span>Booking</span>
                            <span>#{bookingId}</span>
                        </div>

                        <form onSubmit={handleUpload}>
                            {/* Payment Date */}
                            <div className="form-group">
                                <label className="form-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    Payment Date
                                </label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={paymentDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    required
                                />
                            </div>

                            {/* File Upload Zone */}
                            <div className="form-group">
                                <label className="form-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    Bank Slip
                                </label>
                                <div className="file-upload-zone">
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={handleFileChange}
                                        required
                                    />
                                    <div className="file-upload-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                    </div>
                                    <div className="file-upload-title">
                                        {file ? file.name : 'Click to upload bank slip'}
                                    </div>
                                    <div className="file-upload-sub">
                                        {file ? 'File selected ✓' : 'JPG, PNG, PDF supported'}
                                    </div>
                                    {file && (
                                        <div className="file-selected-name">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                    {file.name}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="button-group">
                                <button type="submit" className="upload-btn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    Submit Bank Slip
                                </button>
                                <button type="button" className="cancel-btn" onClick={handleCancel}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                    Cancel Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentPage;