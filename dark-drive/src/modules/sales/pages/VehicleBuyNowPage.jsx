import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VehicleBuyNowPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/sales/vehicles/${id}`).then(res => res.json()).then(setVehicle);
  }, [id]);

  const handleConfirm = async () => {
    const response = await fetch("http://localhost:8080/api/sales/inquire", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleSaleId: parseInt(id), inquiryType: "BUY_NOW", message: "Ready to purchase." })
    });
    if (response.ok) {
      alert("Purchase Request Confirmed!");
      navigate('/browse');
    }
  };

  if(!vehicle) return null;

  return (
      <div className="bg-[#f5f3ef] min-h-screen flex justify-center items-center p-6 font-sans">
        <div className="bg-[#16181c] p-10 rounded-[2rem] w-full max-w-md shadow-2xl text-center">

          <div className="w-16 h-16 rounded-full border border-[#2d323b] bg-[#1c1f26] flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-check text-[#dfb771] text-xl"></i>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Confirm Purchase Interest</h2>
          <p className="text-[#dfb771] text-sm mb-8">
            You are about to initiate the purchase for<br/><b>{vehicle.brand} {vehicle.name} {vehicle.yom}</b>
          </p>

          <div className="flex justify-between items-center bg-[#1c1f26] border border-[#2d323b] p-4 rounded-xl mb-6">
            <span className="text-white text-sm font-medium">Vehicle Price</span>
            <span className="text-white text-lg font-bold">Rs. {(vehicle.price/1000000).toFixed(1)}M</span>
          </div>

          <p className="text-[#9ca3af] text-[10px] leading-relaxed mb-8 text-left">
            *By clicking confirm, an official purchase inquiry will be sent to our administration. The vehicle owner or car sale company will contact you via your registered phone number.
          </p>

          <button onClick={handleConfirm} className="w-full bg-[#dfb771] text-black py-3.5 rounded-xl font-bold hover:bg-[#cda661] transition-colors mb-3">
            Confirm Purchase Request
          </button>
          <button onClick={() => navigate(`/vehicle/${id}`)} className="text-[#9ca3af] text-xs font-bold hover:text-white">
            Cancel
          </button>

        </div>
      </div>
  );
};

export default VehicleBuyNowPage;