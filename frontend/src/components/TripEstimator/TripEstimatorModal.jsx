import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import apiFetch from '../../services/api';
import './TripEstimatorModal.css';

// Fix for default marker icon in React Leaflet
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to auto-pan the map to fit the route
function MapBounds({ routeCoords }) {
    const map = useMap();
    useEffect(() => {
        if (routeCoords && routeCoords.length > 0) {
            const bounds = L.latLngBounds(routeCoords);
            map.fitBounds(bounds, { padding: [40, 40] });
        }
    }, [routeCoords, map]);
    return null;
}

function TripEstimatorModal({ isOpen, onClose, vehicle }) {
    const navigate = useNavigate();
    
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [originSuggestions, setOriginSuggestions] = useState([]);
    const [destSuggestions, setDestSuggestions] = useState([]);

    const [routeCoords, setRouteCoords] = useState([]);
    const [startMarker, setStartMarker] = useState(null);
    const [endMarker, setEndMarker] = useState(null);
    const [calculatedDistance, setCalculatedDistance] = useState(0);

    const [estimatorData, setEstimatorData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!isOpen) { 
            // Reset state when closed so old map isn't shown for new vehicle
            setRouteCoords([]);
            setStartMarker(null);
            setEndMarker(null);
            setCalculatedDistance(0);
            setEstimatorData(null);
            setErrorMsg('');
        }
    }, [isOpen]);

    // Autodiscover Origin suggestions
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (origin.length > 2) {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(origin)}+Sri+Lanka&limit=5`);
                    const data = await res.json();
                    // Don't show if it perfectly matches the selected (user just clicked it)
                    if (data.length === 1 && data[0].display_name === origin) {
                        setOriginSuggestions([]);
                    } else {
                        setOriginSuggestions(data);
                    }
                } catch(e) {}
            } else { setOriginSuggestions([]); }
        }, 200);
        return () => clearTimeout(timer);
    }, [origin]);

    // Autodiscover Destination suggestions
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (destination.length > 2) {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}+Sri+Lanka&limit=5`);
                    const data = await res.json();
                    if (data.length === 1 && data[0].display_name === destination) {
                        setDestSuggestions([]);
                    } else {
                        setDestSuggestions(data);
                    }
                } catch(e) {}
            } else { setDestSuggestions([]); }
        }, 200);
        return () => clearTimeout(timer);
    }, [destination]);

    const handleCalculate = async () => {
        if (!origin || !destination || !startDate || !endDate) {
            setErrorMsg("Please fill in all fields (Locations and Dates).");
            return;
        }
        
        setErrorMsg('');
        setLoading(true);
        
        try {
            // 1. Geocode Origin (Nominatim API)
            const originRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(origin)}+Sri+Lanka&limit=1`);
            const originData = await originRes.json();
            
            // 2. Geocode Destination
            const destRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}+Sri+Lanka&limit=1`);
            const destData = await destRes.json();

            if (!originData.length || !destData.length) {
                throw new Error("Could not find one or both locations on the map.");
            }

            const startLL = { lat: parseFloat(originData[0].lat), lon: parseFloat(originData[0].lon) };
            const endLL = { lat: parseFloat(destData[0].lat), lon: parseFloat(destData[0].lon) };
            
            setStartMarker([startLL.lat, startLL.lon]);
            setEndMarker([endLL.lat, endLL.lon]);

            // 3. Get Route & Distance (OSRM API)
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLL.lon},${startLL.lat};${endLL.lon},${endLL.lat}?overview=full&geometries=geojson`;
            const routeRes = await fetch(osrmUrl);
            const routeData = await routeRes.json();

            let distanceKm = 0;
            if (routeData.routes && routeData.routes.length > 0) {
                distanceKm = routeData.routes[0].distance / 1000; // convert meters to km
                const coords = routeData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]); // Swap LonLat to LatLon for Leaflet
                setRouteCoords(coords);
                setCalculatedDistance(distanceKm);
            } else {
                throw new Error("No driving route found between these locations.");
            }

            // Parse fuel efficiency to strip " km/l" and send strict number to backend
            const rawFuel = vehicle.avgFuelEfficiency;
            const parsedFuel = rawFuel ? parseFloat(rawFuel.toString().replace(/[^0-9.]/g, '')) : 15.0;

            // 4. Hit our backend to calculate pricing based on OSRM distance
            const body = {
                origin: originData[0].display_name,
                destination: destData[0].display_name,
                startDate,
                endDate,
                vehicleId: vehicle.vehicleRentId,
                dailyRate: vehicle.dailyRate,
                avgFuelEfficiency: isNaN(parsedFuel) ? 15.0 : parsedFuel,
                distanceKm: distanceKm
            };

            const backendRes = await apiFetch('/api/estimator/calculate', {
                method: 'POST',
                body: JSON.stringify(body)
            });

            if (backendRes.ok) {
                const data = await backendRes.json();
                setEstimatorData(data);
            } else {
                throw new Error("Backend calculation failed.");
            }

        } catch (error) {
            console.error("Failed to estimate", error);
            setErrorMsg(error.message || "An error occurred during calculation.");
        } finally {
            setLoading(false);
        }
    };

    const handleProceed = () => {
        navigate(`/booking?vehicleId=${vehicle.vehicleRentId}&start=${startDate}&end=${endDate}`);
        onClose();
    };

    if (!isOpen || !vehicle) return null;

    return (
        <div className="estimator-overlay">
            <div className="estimator-modal">
                <button className="close-modal-btn" onClick={onClose}>&times;</button>
                
                <div className="estimator-header">
                    <h2>Trip Budget Planner</h2>
                    <span>Check travel estimates before booking. All calculations are approximate.</span>
                </div>

                <div className="estimator-body">
                    <div className="estimator-controls">
                        {/* Vehicle Preview Card */}
                        <div className="selected-vehicle-preview">
                            <div className="preview-img-box">
                                {vehicle.images && vehicle.images.length > 0 ? (
                                    <img src={vehicle.images[0].imgUrl} alt={vehicle.name} />
                                ) : (
                                    <div className="preview-placeholder">🚗</div>
                                )}
                            </div>
                            <div className="preview-details">
                                <h3>{vehicle.name} <span className="preview-year">({vehicle.year})</span></h3>
                                <div className="preview-tags">
                                    <span className="p-tag">⛽ {vehicle.avgFuelEfficiency || '15'} km/L</span>
                                    <span className="p-tag">⚙️ {vehicle.gearType}</span>
                                    <span className="p-tag">💺 {vehicle.seats} Seats</span>
                                </div>
                                <div className="preview-price">
                                    LKR {vehicle.dailyRate?.toLocaleString()} <span>/ day</span>
                                </div>
                            </div>
                        </div>

                        <div className="input-group" style={{ position: 'relative' }}>
                            <label>Origin</label>
                            <input 
                                type="text" 
                                placeholder="E.g. Colombo"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                            />
                            {originSuggestions.length > 0 && (
                                <ul className="suggestions-list">
                                    {originSuggestions.map((s, idx) => (
                                        <li key={idx} onClick={() => { setOrigin(s.display_name); setOriginSuggestions([]); }}>
                                            {s.display_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="input-group" style={{ position: 'relative' }}>
                            <label>Destination</label>
                            <input 
                                type="text" 
                                placeholder="E.g. Kandy"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                            />
                            {destSuggestions.length > 0 && (
                                <ul className="suggestions-list">
                                    {destSuggestions.map((s, idx) => (
                                        <li key={idx} onClick={() => { setDestination(s.display_name); setDestSuggestions([]); }}>
                                            {s.display_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="date-row">
                            <div className="input-group">
                                <label>Pick-up Date</label>
                                <input 
                                    type="date" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </div>
                            <div className="input-group">
                                <label>Return Date</label>
                                <input 
                                    type="date" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || new Date().toISOString().split("T")[0]}
                                />
                            </div>
                        </div>

                        {errorMsg && <p style={{color: '#ff6b6b', fontSize: '13px', margin: 0}}>{errorMsg}</p>}

                        <button 
                            onClick={handleCalculate} 
                            disabled={loading}
                            className="book-btn"
                            style={{marginTop: 'auto', background: '#282c38', color: '#c9a052', border: '1px solid #c9a052'}}
                        >
                            {loading ? 'Routing...' : 'Calculate Estimate'}
                        </button>
                    </div>

                    <div className="map-container-wrapper" style={{ zIndex: 0 }}>
                        <MapContainer 
                            center={[7.8731, 80.7718]} 
                            zoom={7} 
                            style={{ width: '100%', height: '100%', background: '#12141a' }}
                            zoomControl={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png"
                            />
                            {startMarker && <Marker position={startMarker} />}
                            {endMarker && <Marker position={endMarker} />}
                            {routeCoords.length > 0 && (
                                <>
                                    <Polyline positions={routeCoords} color="#c9a052" weight={4} opacity={0.8} />
                                    <MapBounds routeCoords={routeCoords} />
                                </>
                            )}
                        </MapContainer>
                    </div>
                </div>

                <div className="estimator-results">
                    <div className="results-grid">
                        <div className="result-card">
                            <span className="result-label">Distance</span>
                            <span className="result-val">
                                {estimatorData ? `${estimatorData.distanceKm} km` : '0 km'}
                            </span>
                        </div>
                        <div className="result-card">
                            <span className="result-label">Fuel (Est)</span>
                            <span className="result-val">
                                {estimatorData ? `Rs. ${estimatorData.estimatedFuelCost}` : 'Rs. 0'}
                            </span>
                        </div>
                        <div className="result-card">
                            <span className="result-label">Rent ({estimatorData?.rentalDays || 0} days)</span>
                            <span className="result-val">
                                {estimatorData ? `Rs. ${estimatorData.estimatedRentalCost}` : 'Rs. 0'}
                            </span>
                        </div>
                        <div className="result-card grand-total">
                            <span className="result-label">Total Est. Budget</span>
                            <span className="result-val">
                                {estimatorData ? `Rs. ${estimatorData.grandTotal?.toLocaleString()}` : 'Rs. 0'}
                            </span>
                        </div>
                    </div>
                    
                    <button 
                        className="proceed-btn" 
                        onClick={handleProceed}
                        disabled={!estimatorData || loading}
                    >
                        Proceed to Book This Vehicle
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TripEstimatorModal;
