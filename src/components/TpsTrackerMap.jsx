// src/components/TpsTrackerMap.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 

// --- KONFIGURASI MARKER LEAFLET (Wajib) ---
// Ini untuk memastikan ikon pin tampil dengan benar
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
// --- Akhir konfigurasi marker ---


function TpsTrackerMap() {
    const [tpsLocations, setTpsLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dapatkan lokasi statis TPS terdaftar
    useEffect(() => {
        // 1. Query: Ambil user yang role-nya 'TPS' dan punya 'tpsLocation'
        const q = query(
            collection(db, 'users'),
            where('role', '==', 'TPS'),
            where('tpsLocation', '!=', null) 
        );

        // 2. Dengarkan perubahan (real-time)
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const locations = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.tpsLocation) {
                    locations.push({
                        id: doc.id,
                        lat: data.tpsLocation.latitude,
                        lng: data.tpsLocation.longitude,
                        email: data.email,
                        address: data.tpsAddress || 'Alamat tidak diketahui'
                    });
                }
            });
            setTpsLocations(locations);
            setLoading(false);
        }, (error) => console.error("Error fetching TPS locations:", error));

        return () => unsubscribe();
    }, []);
    
    // Tentukan koordinat tengah default (Bandung)
    const defaultCenter = [-6.9175, 107.6191]; 
    
    if (loading) {
        return <p>Memuat peta dan lokasi TPS terdaftar...</p>;
    }
    
    // Jika tidak ada data TPS, kita tetap render peta dengan zoom yang lebih lebar
    const initialCenter = tpsLocations.length > 0 
        ? [tpsLocations[0].lat, tpsLocations[0].lng] 
        : defaultCenter;

    return (
        <div style={{ height: '70vh', width: '100%' }}>
            <MapContainer 
                center={initialCenter} 
                zoom={tpsLocations.length > 0 ? 12 : 10} 
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Tampilkan Marker untuk setiap TPS */}
                {tpsLocations.map(tps => (
                    <Marker key={tps.id} position={[tps.lat, tps.lng]}>
                        <Popup>
                            <strong>TPS: {tps.email}</strong><br />
                            Alamat: {tps.address}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            
            <p style={{marginTop: '10px'}}>
                Menampilkan {tpsLocations.length} lokasi TPS terdaftar. 
            </p>
        </div>
    );
}

export default TpsTrackerMap;