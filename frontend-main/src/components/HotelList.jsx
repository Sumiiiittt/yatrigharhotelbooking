// src/components/HotelList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';       // ← import Link
import axios from 'axios';
import './HotelList.css';

const HotelList = () => {
  const [hotels, setHotels]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    axios.get('/api/hotels')
      .then(res => setHotels(res.data))
      .catch(err => {
        console.error(err);
        setError('Failed to load hotels');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading hotels…</div>;
  if (error)   return <div className="text-danger">{error}</div>;

  return (
    <div className="container my-4" style={{ borderRadius: '20px', overflow: 'hidden' }}>
      {hotels.map(hotel => (
        <div key={hotel._id} className="hotel-box d-flex align-items-center my-3 shadow rounded">

          <div className="hotel-image">
            {hotel.image
              ? <img src={hotel.image} alt={hotel.name} className="img-fluid rounded" />
              : <div className="placeholder-image">No Image</div>
            }
          </div>

          <div className="hotel-info flex-grow-1 px-3">
            <h5 className="hotel-name mb-1">{hotel.name}</h5>
            <p className="hotel-address text-muted mb-1">{hotel.location}</p>
            <p className="hotel-description text-muted mb-1">
              {hotel.description.length > 100
                ? hotel.description.slice(0, 100) + '…'
                : hotel.description}
            </p>
            <p className="hotel-price text-primary mb-1">
              NRs{hotel.pricePerNight} per travel
            </p>
            <p className="hotel-rooms text-muted">Status: {hotel.rooms}</p>
          </div>

          <div className="hotel-action">
            <Link
   to={`/hotel/${hotel._id}`}
   className="btn btn-primary btn-sm"
 >
   Explore
 </Link>
          </div>

        </div>
      ))}
    </div>
  );
};

export default HotelList;
