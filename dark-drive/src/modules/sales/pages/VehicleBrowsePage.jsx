import React, { useState, useEffect } from 'react';
import VehicleSaleCard from '../components/VehicleSaleCard';
import VehicleFilterSidebar from '../components/VehicleFilterSidebar';

const VehicleBrowsePage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVehicles = (queryParams = "") => {
        setLoading(true);
        fetch(`http://localhost:8080/api/sales/${queryParams ? 'search?' + queryParams : 'vehicles'}`)
            .then(res => res.json())
            .then(data => { setVehicles(data); setLoading(false); })
            .catch(err => console.error(err));
    };

    useEffect(() => { fetchVehicles(); },[]);


    const handleApplyFilters = (filters) => {
        // neg price
        if (filters.maxPrice < 0) {
            alert("Validation Error: Price cannot be negative.");
            return;
        }
        // neg mileage
        if (filters.mileage < 0) {
            alert("Validation Error: Mileage cannot be negative.");
            return;
        }
        // reg yr
        if (filters.yearReg && (filters.yearReg < 1900 || filters.yearReg > 2026)) {
            alert("Validation Error: Please enter a valid registration year.");
            return;
        }

        // Check if any filter is actually set
        const hasValues = Object.values(filters).some(val =>
            val !== '' && val !== 'All Conditions' && val !== 'Any'
        );

        if (!hasValues) {
            if (!window.confirm("No filters applied. Do you want to show all vehicles?")) {
                return;
            }
        }

        // Only append if value exists
        const params = new URLSearchParams();
        if (filters.brand) params.append('brand', filters.brand);
        if (filters.model) params.append('model', filters.model);
        if (filters.yearReg) params.append('yearReg', filters.yearReg);
        if (filters.bodyType) params.append('bodyType', filters.bodyType);
        if (filters.mileage) params.append('mileage', filters.mileage);
        if (filters.condition && filters.condition !== 'All Conditions') params.append('condition', filters.condition);
        if (filters.transmission && filters.transmission !== 'Any') params.append('transmission', filters.transmission);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

        // fetch
        fetchVehicles(params.toString());
    };

    return (
        <div className="bg-[#f5f3ef] min-h-screen p-6 md:p-10 font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Samarasinghe <span className="text-[#dfb771]">Motors</span></h1>
                <p className="text-gray-500 text-sm mt-1 font-medium">Premium Vehicle Sales Division • Showing {vehicles.length} available vehicles</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <VehicleFilterSidebar onApplyFilters={handleApplyFilters} />
                <div className="flex-1">
                    {loading ? (
                        <div className="text-gray-500 font-medium py-10">Loading inventory...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {vehicles.map(v => <VehicleSaleCard key={v.id} vehicle={v} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VehicleBrowsePage;