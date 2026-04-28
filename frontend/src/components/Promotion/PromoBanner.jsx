import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import apiFetch from '../../services/api';

const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    const fetchLatestPromo = async () => {
      try {
        const res = await apiFetch('/api/v1/promotions/latest');
        if (res.ok) {
          const data = await res.json();
          setPromo(data);
        } else {
          setPromo(null);
        }
      } catch (err) {
        console.error("PromoBanner: Error fetching promo:", err);
      }
    };
    fetchLatestPromo();
  }, []);

  if (!isVisible || !promo) return null;

  return (
    <div className="promo-banner-container">
      <div className="promo-banner-content">
        <div className="promo-badge">HOT OFFER</div>
        <span className="promo-text">
            {promo.description || `Special Discount: ${promo.discountPercent}% OFF!`}
        </span>
        <div className="promo-code-container">
            <span className="promo-label">CODE:</span>
            <span className="promo-code">{promo.code}</span>
        </div>
        <Tag size={16} className="promo-icon" />
      </div>
      <button 
        className="promo-close-btn"
        onClick={() => setIsVisible(false)}
        aria-label="Close"
      >
        <X size={18} />
      </button>

      <style>{`
        .promo-banner-container {
          background: linear-gradient(135deg, #0f1115 0%, #1a1d24 100%);
          color: #eceef5;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative; /* Changed from fixed */
          width: 100%;
          z-index: 100;
          border-bottom: 2px solid #C9AD6E;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          animation: fadeIn 0.8s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .promo-banner-content {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        .promo-badge {
          background: #C9AD6E;
          color: #000;
          padding: 2px 10px;
          border-radius: 4px;
          font-weight: 900;
          font-size: 0.7rem;
        }
        .promo-text {
          font-weight: 500;
          font-size: 0.95rem;
          letter-spacing: 0.3px;
        }
        .promo-code-container {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(201, 173, 110, 0.1);
          padding: 4px 12px;
          border: 1px dashed #C9AD6E;
          border-radius: 6px;
        }
        .promo-label {
          color: #8f94a5;
          font-size: 0.75rem;
        }
        .promo-code {
          color: #C9AD6E;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .promo-close-btn {
          position: absolute;
          right: 15px;
          background: transparent;
          border: none;
          color: #8f94a5;
          cursor: pointer;
          transition: color 0.2s;
        }
        .promo-close-btn:hover {
          color: #C9AD6E;
        }
        @media (max-width: 768px) {
          .promo-text { font-size: 0.8rem; }
          .promo-badge { display: none; }
        }
      `}</style>
    </div>
  );
};

export default PromoBanner;
