import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useConnection } from "../hooks/useConnection";
import { getCensusApi } from "../api/census";
import { getAll } from "../db/indexedDB";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function MapPage() {
  const { token } = useAuth();
  const online = useConnection();
  const [censuses, setCensuses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      setLoading(true);
      let apiCensuses = [];
      if (online) {
        try {
          apiCensuses = await getCensusApi(token);
        } catch (err) {
          console.error("Error fetching censuses for map:", err);
        }
      }

      // En modo offline, cargar de IndexedDB
      const localCensuses = await getAll("censos");
      
      const combined = [...localCensuses];
      apiCensuses.forEach(apiC => {
        if (!combined.find(c => c.id === apiC.id)) {
          combined.push(apiC);
        }
      });

      // Filtrar censos que no tengan lat/lon validos
      const validCensuses = combined.filter(c => c.lat && c.lon);
      setCensuses(validCensuses);
    } catch (err) {
      console.error("Error loading map data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para crear un icono con forma de gatito del color del proyecto
  const createCustomIcon = (color) => {
    const markerColor = color || "#3b82f6"; // Color por defecto si no existe
    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${markerColor}" width="40px" height="40px" style="filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.3));">
        <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3.1-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"/>
        <path stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" d="M8 13.5v.5" />
        <path stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" d="M16 13.5v.5" />
        <path fill="#ffffff" d="M11 16h2l-1 1.5z" />
      </svg>
    `;

    return L.divIcon({
      className: "custom-cat-pin",
      html: svgIcon,
      iconSize: [40, 40],
      iconAnchor: [20, 35],
      popupAnchor: [0, -35],
    });
  };

  // Coordenadas centrales por defecto (ej. Tunja o Bogotá si no hay censos)
  const defaultCenter = censuses.length > 0 
    ? [censuses[0].lat, censuses[0].lon] 
    : [5.535, -73.367]; // Tunja aprox

  return (
    <div style={{ padding: "24px 16px", height: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
      <h1>Mapa de Censos</h1>
      <p style={{ color: "#6b7280", marginBottom: "16px" }}>
        Visualización interactiva de mascotas censadas (RF07, RF08, RF09)
      </p>

      {loading ? (
        <p>Cargando mapa y marcadores...</p>
      ) : (
        <div style={{ flex: 1, borderRadius: "8px", overflow: "hidden", border: "1px solid #e5e7eb", zIndex: 0 }}>
          <MapContainer 
            center={defaultCenter} 
            zoom={6} 
            style={{ width: "100%", height: "100%" }}
          >
            {/* Capa gratuita de OpenStreetMap */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {censuses.map(censo => (
              <Marker 
                key={censo.id} 
                position={[censo.lat, censo.lon]} 
                icon={createCustomIcon(censo.color)}
              >
                <Popup>
                  <div style={{ minWidth: "200px" }}>
                    {censo.fotografia && censo.fotografia.startsWith('data:image') ? (
                      <img 
                        src={censo.fotografia} 
                        alt="Foto Censo" 
                        style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "4px", marginBottom: "8px" }} 
                      />
                    ) : (
                      <div style={{ width: "100%", height: "120px", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "24px" }}>📸</span>
                      </div>
                    )}
                    
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#1f2937" }}>Información del Censo</h3>
                    
                    <div style={{ marginBottom: "8px", fontSize: "13px" }}>
                      <strong>🐱 Mascota:</strong>
                      {censo.mascota ? (
                        <div style={{ paddingLeft: "8px", color: "#4b5563" }}>
                          Nombre: {censo.mascota.nombre}<br/>
                          Tipo: {censo.mascota.tipo || "N/A"}<br/>
                          Edad: {censo.mascota.edad} años
                        </div>
                      ) : (
                        <div style={{ paddingLeft: "8px", color: "#9ca3af" }}>ID: {censo.idMascota.substring(0,8)}... (Offline)</div>
                      )}
                    </div>

                    <div style={{ marginBottom: "8px", fontSize: "13px" }}>
                      <strong>👤 Dueño:</strong>
                      {censo.dueno ? (
                        <div style={{ paddingLeft: "8px", color: "#4b5563" }}>
                          Nombre: {censo.dueno.nombres} {censo.dueno.apellidos}<br/>
                          Teléfono: {censo.dueno.telefono}
                        </div>
                      ) : (
                        <div style={{ paddingLeft: "8px", color: "#9ca3af" }}>ID: {censo.idDueno.substring(0,8)}... (Offline)</div>
                      )}
                    </div>
                    
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "8px", borderTop: "1px solid #e5e7eb", paddingTop: "8px" }}>
                      Proyecto: {censo.idProyecto || 'Local'}<br/>
                      Lat: {censo.lat}, Lon: {censo.lon}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}

export default MapPage;
