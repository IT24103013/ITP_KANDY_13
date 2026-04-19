import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


import VehicleBrowsePage from './modules/sales/pages/VehicleBrowsePage.jsx';
import VehicleDetailsPage from './modules/sales/pages/VehicleDetailsPage.jsx';
import VehicleBuyNowPage from './modules/sales/pages/VehicleBuyNowPage.jsx';
import AdminSaleInquiries from './modules/sales/pages/AdminSaleInquiries.jsx';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/browse" />} />
                <Route path="/browse" element={<VehicleBrowsePage />} />
                <Route path="/vehicle/:id" element={<VehicleDetailsPage />} />
                <Route path="/buy-now/:id" element={<VehicleBuyNowPage />} />
                <Route path="/admin/inquiries" element={<AdminSaleInquiries />} />
            </Routes>
        </Router>
    );
}

export default App;