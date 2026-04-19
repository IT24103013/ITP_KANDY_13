import React, { useState } from 'react';

const VehicleFilterSidebar = ({ onApplyFilters }) => {

    const [filters, setFilters] = useState({
        brand: '',
        model: '',
        bodyType: '',
        yearReg: '',
        condition: 'All Conditions',
        transmission: 'Any',
        mileage: '',
        maxPrice: ''
    });

    const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

    const inputClass = "w-full bg-[#1c1f26] p-3 rounded-lg border border-[#2d323b] text-white outline-none focus:border-[#dfb771] text-xs";
    const labelClass = "text-[#9ca3af] text-[10px] uppercase font-bold tracking-wider mb-1.5 block";

    return (
        <div className="w-full md:w-[320px] bg-[#16181c] p-6 rounded-[1.5rem] h-fit sticky top-8 shadow-2xl">
            <h2 className="font-bold mb-6 text-white flex items-center gap-2 text-lg">
                <span className="text-[#dfb771]">⏳</span> Filters
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <label className={labelClass}>Brand</label>
                    <input name="brand" value={filters.brand} onChange={handleChange} className={inputClass} placeholder="e.g. Honda" />
                </div>
                <div>
                    <label className={labelClass}>Model</label>
                    <input name="model" value={filters.model} onChange={handleChange} className={inputClass} placeholder="e.g. Civic" />
                </div>

                <div>
                    <label className={labelClass}>Body Type</label>
                    <input name="bodyType" value={filters.bodyType} onChange={handleChange} className={inputClass} placeholder="e.g. Sedan" />
                </div>
                <div>
                    <label className={labelClass}>Reg Year</label>
                    <input name="yearReg" value={filters.yearReg} onChange={handleChange} type="number" className={inputClass} placeholder="Year" />
                </div>

                <div className="col-span-2">
                    <label className={labelClass}>Condition</label>
                    <select name="condition" value={filters.condition} onChange={handleChange} className={inputClass}>
                        <option value="All Conditions">All Conditions</option>
                        <option value="Brand New">Brand New</option>
                        <option value="Used">Used</option>
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Transmission</label>
                    <select name="transmission" value={filters.transmission} onChange={handleChange} className={inputClass}>
                        <option value="Any">Any</option>
                        <option value="Auto">Auto</option>
                        <option value="Manual">Manual</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Max Mileage</label>
                    <input name="mileage" value={filters.mileage} onChange={handleChange} type="number" className={inputClass} placeholder="km" />
                </div>

                <div className="col-span-2">
                    <label className={labelClass}>Max Price (Rs.)</label>
                    <input name="maxPrice" value={filters.maxPrice} type="number" onChange={handleChange} className={inputClass} placeholder="e.g. 15000000" />
                </div>


                <button
                    onClick={() => {
                        //validation price
                        if (filters.maxPrice < 0) {
                            alert("Price cannot be negative!");
                            return;
                        }
                        onApplyFilters(filters);
                    }}
                    className="col-span-2 bg-[#dfb771] text-black font-bold py-4 rounded-xl hover:bg-[#cda661] transition-colors shadow-lg active:scale-95"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
};

export default VehicleFilterSidebar;