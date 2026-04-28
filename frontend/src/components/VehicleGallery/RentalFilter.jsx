import React, { useState } from 'react';
import './RentalFilter.css';

const VEHICLE_TYPES = ['All Types', 'Hatchback', 'Sedan', 'SUV', 'Van', 'Pickup'];
const FUEL_TYPES = ['Any', 'Petrol', 'Diesel', 'Hybrid', 'Electric'];
const GEAR_TYPES = ['Any', 'Auto', 'Manual'];
const SEAT_OPTIONS = ['Any', 2, 4, 5, 7, 12];

function RentalFilter({ onFilter, onReset }) {
    const [filters, setFilters] = useState({
        name: '',
        type: '',
        gearType: '',
        fuelType: '',
        maxPrice: '',
        seats: '',
    });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (filters.maxPrice !== '' && (isNaN(filters.maxPrice) || Number(filters.maxPrice) <= 0)) {
            newErrors.maxPrice = 'Please enter a valid positive price.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleApply = () => {
        if (!validate()) return;
        const params = {
            name: filters.name.trim() || null,
            type: (filters.type && filters.type !== 'All Types') ? filters.type : null,
            gearType: (filters.gearType && filters.gearType !== 'Any') ? filters.gearType : null,
            fuelType: (filters.fuelType && filters.fuelType !== 'Any') ? filters.fuelType : null,
            maxPrice: filters.maxPrice !== '' ? Number(filters.maxPrice) : null,
            seats: (filters.seats && filters.seats !== 'Any') ? Number(filters.seats) : null,
        };
        onFilter(params);
    };

    const handleReset = () => {
        setFilters({ name: '', type: '', gearType: '', fuelType: '', maxPrice: '', seats: '' });
        setErrors({});
        onReset();
    };

    return (
        <div className="rental-filter-panel">
            <div className="filter-header">
                <span className="filter-icon">⚙️</span>
                <h3>Filter Vehicles</h3>
            </div>

            <div className="filter-group">
                <label>SEARCH BY NAME</label>
                <input
                    type="text"
                    name="name"
                    value={filters.name}
                    placeholder="e.g. Toyota Premio"
                    onChange={handleChange}
                    className="filter-input"
                />
            </div>

            <div className="filter-group">
                <label>VEHICLE TYPE</label>
                <select name="type" value={filters.type} onChange={handleChange} className="filter-select">
                    {VEHICLE_TYPES.map(t => <option key={t} value={t === 'All Types' ? '' : t}>{t}</option>)}
                </select>
            </div>

            <div className="filter-row">
                <div className="filter-group">
                    <label>TRANSMISSION</label>
                    <select name="gearType" value={filters.gearType} onChange={handleChange} className="filter-select">
                        {GEAR_TYPES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label>FUEL TYPE</label>
                    <select name="fuelType" value={filters.fuelType} onChange={handleChange} className="filter-select">
                        {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
            </div>

            <div className="filter-row">
                <div className="filter-group">
                    <label>SEATS</label>
                    <select name="seats" value={filters.seats} onChange={handleChange} className="filter-select">
                        {SEAT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label>MAX PRICE (LKR/day)</label>
                    <input
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        placeholder="e.g. 15000"
                        onChange={handleChange}
                        className={`filter-input ${errors.maxPrice ? 'input-error' : ''}`}
                        min="0"
                    />
                    {errors.maxPrice && <span className="error-msg">{errors.maxPrice}</span>}
                </div>
            </div>

            <div className="filter-actions">
                <button className="filter-reset-btn" onClick={handleReset}>Reset</button>
                <button className="filter-apply-btn" onClick={handleApply}>Apply Filters</button>
            </div>
        </div>
    );
}

export default RentalFilter;
