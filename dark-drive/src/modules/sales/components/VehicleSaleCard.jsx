import React from 'react';
import { useNavigate } from 'react-router-dom';

const VehicleSaleCard = ({ vehicle }) => {
    const navigate = useNavigate();
    const imgUrl = vehicle.imageUrl
        ? (vehicle.imageUrl.startsWith('http') ? vehicle.imageUrl : `http://localhost:8080${vehicle.imageUrl}`)
        : "https://placehold.co/600x400?text=No+Image";
    return (
        <div className="bg-[#16181c] p-4 rounded-[1.5rem] shadow-xl hover:-translate-y-1 transition-transform group flex flex-col">
            <div className="relative overflow-hidden rounded-[1rem] mb-4 h-48 bg-[#1c1f26]">
                <img src={imgUrl} alt={vehicle.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 bg-[#dfb771] text-black text-[10px] font-bold px-3 py-1 rounded-full">
          ★ {vehicle.vehicleCondition}
        </span>
            </div>

            <div className="flex justify-between items-start mb-4 px-1">
                <h3 className="font-bold text-[15px] text-white leading-tight">{vehicle.brand} {vehicle.name}</h3>
                <p className="text-[#dfb771] font-bold text-[15px] whitespace-nowrap ml-2">
                    Rs. {(vehicle.price / 1000000).toFixed(1)}M
                </p>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] text-[#9ca3af] mb-6 px-1">
                <span className="flex items-center gap-2" title="YOM">
                    <i className="fas fa-calendar-alt text-[#dfb771]"></i>
                    YOM: {vehicle.yom || 'N/A'}
                </span>
                <span className="flex items-center gap-2">
                    <i className="fas fa-tachometer-alt text-[#dfb771]"></i>
                    {/* ADDED THIS LINE FOR MILEAGE */}
                    {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : '0 km'}
                </span>
                <span className="flex items-center gap-2">
                    <i className="fas fa-cog text-[#dfb771]"></i>
                    {vehicle.transmission || 'Auto'}
                </span>
                <span className="flex items-center gap-2">
                    <i className="fas fa-gas-pump text-[#dfb771]"></i>
                    Petrol
                </span>
            </div>

            <button
                onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                className="mt-auto w-full bg-transparent border border-[#dfb771] text-[#dfb771] py-3 rounded-xl hover:bg-[#dfb771] hover:text-black font-bold transition-colors flex justify-center items-center gap-2"
            >
                <i className="fas fa-shopping-cart"></i> Purchase Interest
            </button>
        </div>
    );
};

export default VehicleSaleCard;