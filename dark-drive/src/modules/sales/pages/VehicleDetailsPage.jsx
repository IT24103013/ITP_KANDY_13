import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const[negotiateMsg, setNegotiateMsg] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8080/api/sales/vehicles/${id}`).then(res => res.json()).then(setVehicle);
  },[id]);

  const handleInquiry = async (type, msg) => {
  //empty message
    if (type === 'NEGOTIATION' && msg.trim() === '') {
      alert("Validation Error: Please enter a message or offer price before sending.");
      return;
    }
    //api error
    try {
      const response = await fetch("http://localhost:8080/api/sales/inquire", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleSaleId: parseInt(id), inquiryType: type, message: msg })
      });

      if (response.ok) {
        alert(`${type === 'NEGOTIATION' ? 'Negotiation' : 'Buy'} Inquiry Sent successfully!`);
        setNegotiateMsg("");
      } else {
        alert("Server Error: Could not send inquiry.");
      }
    } catch (error) {
      alert("Network Error: Make sure the server is running.");
      console.error(error);
    }
  };

  if (!vehicle) return <div className="bg-[#f5f3ef] min-h-screen p-10">Loading...</div>;

  return (
      <div className="bg-[#f5f3ef] min-h-screen p-6 md:p-10 font-sans">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Vehicle <span className="text-[#dfb771]">Details</span></h1>
            <p className="text-gray-500 text-sm">Complete specifications and purchase options.</p>
          </div>
          <button onClick={() => navigate('/browse')} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50">
            ← Back to Browse
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Leftt Card */}
          <div className="lg:w-2/3 bg-[#16181c] rounded-[2rem] overflow-hidden shadow-2xl">
            <img
                src={vehicle.imageUrl ? (vehicle.imageUrl.startsWith('http') ? vehicle.imageUrl : `http://localhost:8080${vehicle.imageUrl}`) : "https://placehold.co/800x500"}
                className="w-full h-[350px] object-cover"
                alt="car"
            />

            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{vehicle.brand} {vehicle.name} {vehicle.yom}</h2>
                  <p className="text-[#9ca3af] text-sm">{vehicle.brand} • {vehicle.name} • {vehicle.model}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#9ca3af] text-[10px] uppercase font-bold tracking-widest mb-1">Asking Price</p>
                  <h3 className="text-3xl font-bold text-[#dfb771]">Rs. {(vehicle.price/1000000).toFixed(1)}M</h3>
                </div>
              </div>

              <h4 className="text-white font-bold mb-4">Technical Specifications</h4>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[['Make / Model', `${vehicle.brand} ${vehicle.name}`],['Edition', vehicle.model], ['Condition', vehicle.vehicleCondition], ['YOM / YOR', vehicle.yom],['Transmission', vehicle.transmission], ['Mileage', `${vehicle.mileage} km`]].map(([lbl, val]) => (
                    <div key={lbl} className="bg-[#1c1f26] p-4 rounded-xl border border-[#2d323b]">
                      <p className="text-[#9ca3af] text-[10px] uppercase font-bold mb-1">{lbl}</p>
                      <p className="text-white font-medium text-sm">{val}</p>
                    </div>
                ))}
              </div>

              <h4 className="text-white font-bold mb-4">Description</h4>
              <div className="bg-[#1c1f26] p-5 rounded-xl border border-[#2d323b] mb-6">
                <p className="text-[#9ca3af] text-sm leading-relaxed">{vehicle.description || "Mint condition. Fully maintained by agents."}</p>
              </div>

              {/* scan report */}
              {vehicle.scanReportUrl ? (
                  <button
                      onClick={() => {
                        const url = vehicle.scanReportUrl.startsWith('http')
                            ? vehicle.scanReportUrl
                            : `http://localhost:8080${vehicle.scanReportUrl}`;
                        window.open(url, '_blank');
                      }}
                      className="w-full bg-[#1e212a] border border-[#2d323b] py-3.5 rounded-xl mb-4 hover:bg-[#262b35] text-[#eceef5] font-medium transition-colors flex justify-center items-center gap-2"
                  >
                    <i className="fas fa-file-pdf text-[#dfb771]"></i> View Scan Report
                  </button>
              ) : (
                  <button
                      disabled
                      className="w-full bg-[#1c1f26] border border-[#2d323b] py-3.5 rounded-xl mb-4 text-[#6b7280] font-medium cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    <i className="fas fa-file-pdf opacity-50"></i> No Report Available
                  </button>
              )}

            </div>
          </div>

          {/* right buy now */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-[#16181c] p-8 rounded-[2rem] text-center shadow-xl">
              <i className="fas fa-shopping-cart text-3xl text-[#dfb771] mb-4"></i>
              <h3 className="text-white text-xl font-bold mb-2">Ready to Purchase?</h3>
              <p className="text-[#9ca3af] text-xs mb-6 px-4">Initiate the buying process today. Our team will contact you to finalize the paperwork.</p>
              <button onClick={() => navigate(`/buy-now/${id}`)} className="w-full bg-[#dfb771] text-black py-3.5 rounded-xl font-bold hover:bg-[#cda661] transition-colors">
                Buy Now
              </button>
            </div>

            <div className="bg-[#16181c] p-8 rounded-[2rem] shadow-xl">
              <h3 className="text-white text-md font-bold mb-4 flex items-center gap-2">
                <i className="far fa-comment-dots text-[#dfb771]"></i> Negotiate Price
              </h3>
              <textarea
                  value={negotiateMsg} onChange={(e) => setNegotiateMsg(e.target.value)}
                  placeholder="E.g. My budget is Rs. 12M. Let me know if we can negotiate."
                  className="w-full bg-[#1c1f26] border border-[#2d323b] rounded-xl p-4 text-sm text-white outline-none mb-4 resize-none focus:border-[#dfb771]" rows="4"
              />
              <button onClick={() => handleInquiry('NEGOTIATION', negotiateMsg)} className="w-full bg-transparent border border-[#dfb771] text-[#dfb771] py-3 rounded-xl font-bold hover:bg-[#dfb771] hover:text-black transition-colors">
                Send Inquiry
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default VehicleDetailsPage;