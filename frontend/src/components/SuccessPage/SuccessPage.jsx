import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SuccessPage.css';

function SuccessPage() {
    const navigate = useNavigate();

    return (
        <div className="success-container">

            {/* ---- Animated Icon ---- */}
            <div className="success-icon-wrapper">
                <div className="success-icon-ring" />
                <div className="success-icon-ring" />
                <div className="success-icon-ring" />
                <div className="success-icon-circle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
            </div>

            {/* ---- Headings ---- */}
            <p className="success-tag">Payment Submitted</p>
            <h1 className="success-title">Bank Slip <span>Received!</span></h1>
            <p className="success-subtitle">
                We have successfully received your payment slip.
                Your booking will be fully confirmed once our representative verifies the transfer.
            </p>

            {/* ---- Status Card ---- */}
            <div className="success-status-card">
                <div className="status-card-header">
                    <span>Booking Status</span>
                    <div className="status-pill">Pending Verification</div>
                </div>
                <div className="status-card-body">
                    {[
                        { label: 'Payment Slip', value: 'Uploaded ✓' },
                        { label: 'Verification', value: 'Under Review' },
                        { label: 'Est. Approval', value: 'Within 24 hours' },
                    ].map(({ label, value }) => (
                        <div className="status-row" key={label}>
                            <span className="status-row-label">{label}</span>
                            <span className="status-row-value">{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ---- What Happens Next ---- */}
            <div className="next-steps-card">
                <h3 className="next-steps-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    What happens next?
                </h3>
                <div className="next-steps-list">
                    <div className="next-step-item">
                        <div className="next-step-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                            </svg>
                        </div>
                        <div className="next-step-text">
                            <strong>Slip Verification</strong>
                            <span>Our team will verify your bank transfer slip within 24 hours.</span>
                        </div>
                    </div>
                    <div className="next-step-item">
                        <div className="next-step-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                        </div>
                        <div className="next-step-text">
                            <strong>Booking Confirmation</strong>
                            <span>Once approved, your booking will be confirmed and you'll be notified.</span>
                        </div>
                    </div>
                    <div className="next-step-item">
                        <div className="next-step-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="3" width="15" height="13" rx="2" />
                                <path d="M16 8h4l3 3v5h-7V8z" />
                                <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                            </svg>
                        </div>
                        <div className="next-step-text">
                            <strong>Vehicle Pick-up</strong>
                            <span>Collect your vehicle on the start date with your booking confirmation.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ---- Action Buttons ---- */}
            <div className="success-actions">
                <button className="btn-home" onClick={() => navigate('/')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Back to Home
                </button>
                <button className="btn-history" onClick={() => navigate('/history')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    View My Bookings
                </button>
            </div>

        </div>
    );
}

export default SuccessPage;