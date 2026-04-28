import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiFetch from '../../services/api';
import './BuyGallery.css';

function BuyGallery() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Dynamic Filter State
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [bodyType, setBodyType] = useState('');
    const [yearReg, setYearReg] = useState('');
    const [condition, setCondition] = useState('All Conditions');
    const [transmission, setTransmission] = useState('Any');
    const [mileage, setMileage] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            // Only attach parameters if they are genuinely selected
            if (brand.trim()) params.append('brand', brand.trim());
            if (model.trim()) params.append('model', model.trim());
            if (bodyType.trim()) params.append('bodyType', bodyType.trim());
            
            if (condition !== 'All Conditions') params.append('condition', condition);
            if (transmission !== 'Any') params.append('transmission', transmission);
            
            // Validation boundaries happen in handleApplyFilters, backend expects pure numbers
            if (yearReg) params.append('yearReg', yearReg);
            if (mileage) params.append('mileage', mileage);
            if (maxPrice) params.append('maxPrice', maxPrice);
            
            const endpoint = params.toString() ? `/api/vehicles/public/sale/search?${params.toString()}` : '/api/vehicles/public/sale';
            
            const response = await apiFetch(endpoint);
            if (!response.ok) throw new Error("Failed to fetch vehicles");
            const data = await response.json();
            setVehicles(data);
        } catch (err) {
            console.error(err);
            setError("Could not load vehicles for sale. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Initial Load - runs only once
    useEffect(() => {
        fetchVehicles();
        // eslint-disable-next-line
    }, []);

    const handleApplyFilters = () => {
        // Validation Engine
        if (maxPrice && parseFloat(maxPrice) < 0) {
            alert("Maximum Price cannot be a negative value.");
            return;
        }
        if (mileage && parseInt(mileage, 10) < 0) {
            alert("Mileage cannot be a negative value.");
            return;
        }
        if (yearReg) {
            const yr = parseInt(yearReg, 10);
            const currentYear = new Date().getFullYear();
            if (yr < 1900 || yr > currentYear + 1) {
                alert(`Please enter a realistic Registration Year (1900 - ${currentYear + 1}).`);
                return;
            }
        }
        
        fetchVehicles();
    };

    const handleResetFilters = async () => {
        setBrand('');
        setModel('');
        setBodyType('');
        setYearReg('');
        setCondition('All Conditions');
        setTransmission('Any');
        setMileage('');
        setMaxPrice('');
        
        try {
            setLoading(true);
            const response = await apiFetch('/api/vehicles/public/sale');
            if (!response.ok) throw new Error("Failed to fetch vehicles");
            const data = await response.json();
            setVehicles(data);
        } catch (err) {
            console.error(err);
            setError("Could not load vehicles for sale.");
        } finally {
            setLoading(false);
        }
    };

    const handleInquireClick = (vehicle) => {
        navigate(`/buy/${vehicle.id}`);
    };

    return (
        <div className="gallery-layout dual-pane">
            
            {/* Header Content placed above the Grid or alongside, but usually top level */}
            <div className="gallery-header-full">
                <h1>Samarasinghe <span>Motors</span></h1>
                <p>Premium Vehicle Sales Division • Showing {vehicles.length} available vehicles</p>
            </div>

            <div className="gallery-content-wrapper">
                
                {/* 1. Sidebar Panel */}
                <aside className="filters-sidebar">
                    <div className="sidebar-header">
                        <span className="hourglass-icon">⏳</span> Filters
                    </div>

                    <div className="filter-row">
                        <div className="filter-group">
                            <label>BRAND</label>
                            <input type="text" placeholder="e.g. Honda" value={brand} onChange={e => setBrand(e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <label>MODEL</label>
                            <input type="text" placeholder="e.g. Civic" value={model} onChange={e => setModel(e.target.value)} />
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="filter-group">
                            <label>BODY TYPE</label>
                            <input type="text" placeholder="e.g. Sedan" value={bodyType} onChange={e => setBodyType(e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <label>REG YEAR</label>
                            <input type="number" placeholder="Year" value={yearReg} onChange={e => setYearReg(e.target.value)} />
                        </div>
                    </div>

                    <div className="filter-group full-width">
                        <label>CONDITION</label>
                        <select value={condition} onChange={e => setCondition(e.target.value)}>
                            <option value="All Conditions">All Conditions</option>
                            <option value="Brand New">Brand New</option>
                            <option value="Registered">Registered</option>
                            <option value="Reconditioned">Reconditioned</option>
                        </select>
                    </div>

                    <div className="filter-row">
                        <div className="filter-group">
                            <label>TRANSMISSION</label>
                            <select value={transmission} onChange={e => setTransmission(e.target.value)}>
                                <option value="Any">Any</option>
                                <option value="Auto">Auto</option>
                                <option value="Manual">Manual</option>
                                <option value="Tiptronic">Tiptronic</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>MAX MILEAGE</label>
                            <input type="number" placeholder="km" value={mileage} onChange={e => setMileage(e.target.value)} />
                        </div>
                    </div>

                    <div className="filter-group full-width">
                        <label>MAX PRICE (RS.)</label>
                        <input type="number" placeholder="e.g. 15000000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                    </div>

                    <div className="filter-actions-row">
                        <button className="reset-filters-btn" onClick={handleResetFilters}>
                            Reset
                        </button>
                        <button className="apply-filters-btn" onClick={handleApplyFilters}>
                            Apply Filters
                        </button>
                    </div>
                </aside>

                {/* 2. Vehicles Grid */}
                <main className="vehicle-grid-container">
                    {loading && <div className="gallery-loader">Loading premium fleet...</div>}
                    {error && <div className="gallery-error">{error}</div>}
                    
                    {!loading && !error && vehicles.length === 0 && (
                        <div className="gallery-empty">No vehicles map your exact criteria. Try adjusting the filters.</div>
                    )}
                    
                    {!loading && !error && (
                        <div className="vehicle-grid">
                            {vehicles.map(vehicle => (
                                <div key={vehicle.id} className="vehicle-card sale-card">
                                    <div className="v-badge">★ {vehicle.vehicleCondition || 'Used'}</div>
                                    <div className="v-image-container">
                                        {vehicle.imageUrl ? (
                                            <img src={vehicle.imageUrl} alt={vehicle.name} className="v-image" />
                                        ) : (
                                            <div className="img-placeholder">Test Image</div>
                                        )}
                                    </div>
                                    <div className="v-content">
                                        <div className="v-header-row">
                                            <h3>{vehicle.brand} {vehicle.name}</h3>
                                            <p className="v-price-small">Rs. {(vehicle.price/1000000).toFixed(1)}M</p>
                                        </div>
                                        
                                        <div className="v-specs-grid">
                                            <div className="spec-val"><span>📅</span> YOM: {vehicle.yearReg || vehicle.yom}</div>
                                            <div className="spec-val"><span>🛣️</span> {vehicle.mileage ? vehicle.mileage.toLocaleString() + ' km' : 'N/A'}</div>
                                            <div className="spec-val"><span>⚙️</span> {vehicle.transmission || 'N/A'}</div>
                                            <div className="spec-val"><span>⛽</span> Petrol</div>
                                        </div>

                                        <button 
                                            className="book-btn sale-btn purchase-btn"
                                            onClick={() => handleInquireClick(vehicle)}
                                        >
                                            🛒 Purchase Interest
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default BuyGallery;
