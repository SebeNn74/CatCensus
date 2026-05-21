import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useConnection } from "../hooks/useConnection";
import { createCensusApi, getCensusApi } from "../api/census";
import { getPeopleApi } from "../api/people";
import { getPetsApi } from "../api/pets";
import { saveLocal, getAll } from "../db/indexedDB";
import { generateUUID } from "../utils/uuid";

function CensusPage() {
  const { token } = useAuth();
  const online = useConnection();

  const [form, setForm] = useState({
    idMascota: "",
    idDueno: "",
    fotografia: "", // Base64
    lat: "",
    lon: "",
  });

  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [censuses, setCensuses] = useState([]);
  const [people, setPeople] = useState([]);
  const [pets, setPets] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    loadCensuses();
    loadDependencies();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const loadDependencies = async () => {
    try {
      let apiPeople = [];
      let apiPets = [];
      
      if (online) {
        try {
          apiPeople = await getPeopleApi(token);
          apiPets = await getPetsApi(token);
        } catch (err) {
          console.error("Error fetching dependencies from API:", err);
        }
      }

      const localPeople = await getAll("personas");
      const localPets = await getAll("mascotas");
      
      const combinedPeople = [...localPeople];
      apiPeople.forEach(apiP => {
        if (!combinedPeople.find(p => p.id === apiP.id)) combinedPeople.push(apiP);
      });

      const combinedPets = [...localPets];
      apiPets.forEach(apiP => {
        if (!combinedPets.find(p => p.id === apiP.id)) combinedPets.push(apiP);
      });

      setPeople(combinedPeople);
      setPets(combinedPets);
    } catch (err) {
      console.error("Error al cargar dependencias:", err);
    }
  };

  const loadCensuses = async () => {
    try {
      setLoadingList(true);
      let apiCensuses = [];
      if (online) {
        try {
          apiCensuses = await getCensusApi(token);
        } catch (err) {
          console.error("Error fetching from API:", err);
        }
      }
      const localCensuses = await getAll("censos");
      
      const combined = [...localCensuses];
      apiCensuses.forEach(apiC => {
        if (!combined.find(c => c.id === apiC.id)) {
          combined.push(apiC);
        }
      });
      
      setCensuses(combined);
    } catch (err) {
      console.error("Error al cargar censos:", err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        // Lógica de compresión para asegurar < 50Kb
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Calidad inicial
        let quality = 0.7;
        let base64 = canvas.toDataURL("image/jpeg", quality);

        // Si sigue superando los ~50Kb (aproximadamente 68000 caracteres base64), reducir calidad
        while (base64.length > 68000 && quality > 0.1) {
          quality -= 0.1;
          base64 = canvas.toDataURL("image/jpeg", quality);
        }

        if (base64.length > 68000) {
          setState({ tipo: "error", mensaje: "La imagen es demasiado grande incluso después de comprimir. Intenta con otra." });
          return;
        }

        setImagePreview(base64);
        setForm({ ...form, fotografia: base64 });
      };
    };
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setIsCameraOpen(true);
      // Necesitamos un pequeño timeout para que el ref se asigne después del render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      setState({ tipo: "error", mensaje: "No se pudo acceder a la cámara. Revisa los permisos." });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const MAX_WIDTH = 400;
    const scaleSize = MAX_WIDTH / video.videoWidth;
    canvas.width = MAX_WIDTH;
    canvas.height = video.videoHeight * scaleSize;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let quality = 0.7;
    let base64 = canvas.toDataURL("image/jpeg", quality);

    while (base64.length > 68000 && quality > 0.1) {
      quality -= 0.1;
      base64 = canvas.toDataURL("image/jpeg", quality);
    }

    if (base64.length > 68000) {
      setState({ tipo: "error", mensaje: "La imagen es demasiado grande incluso después de comprimir." });
      stopCamera();
      return;
    }

    setImagePreview(base64);
    setForm({ ...form, fotografia: base64 });
    stopCamera();
  };

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("La geolocalización no es soportada por tu navegador"));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
          (error) => reject(error)
        );
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setState({ tipo: "ok", mensaje: "Obteniendo ubicación..." });

    try {
      // Capturar ubicación automáticamente
      const coords = await getLocation();

      const censo = {
        id: generateUUID(),
        idMascota: form.idMascota,
        idDueno: form.idDueno,
        fotografia: form.fotografia,
        lat: coords.lat,
        lon: coords.lon,
      };

      if (online) {
        await createCensusApi(censo, token);
        setState({ tipo: "ok", mensaje: "Censo registrado y sincronizado correctamente." });
      } else {
        await saveLocal("censos", censo);
        setState({ tipo: "offline", mensaje: "Guardado localmente. Se sincronizará luego." });
      }

      resetForm();
      loadCensuses();
    } catch (err) {
      setState({ tipo: "error", mensaje: `Error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      idMascota: "",
      idDueno: "",
      fotografia: "",
      lat: "",
      lon: "",
    });
    setImagePreview(null);
  };

  const colors = {
    ok: { backgroundColor: "#dcfce7", color: "#166534", padding: "8px", borderRadius: "4px" },
    error: { backgroundColor: "#fee2e2", color: "#991b1b", padding: "8px", borderRadius: "4px" },
    offline: { backgroundColor: "#fef9c3", color: "#854d0e", padding: "8px", borderRadius: "4px" },
  };

  const inputStyle = {
    display: "block", width: "100%", marginBottom: "8px", padding: "8px",
    borderRadius: "4px", border: "1px solid #d1d5db",
  };

  return (
    <div style={{ padding: "24px 16px" }}>
      <h1>Registro de Censos</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* FORMULARIO */}
        <div style={{ padding: "16px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
          <h2 style={{ marginTop: 0 }}>Nuevo Censo</h2>

          <form onSubmit={handleSubmit}>
            <label style={{fontWeight: "bold", display: "block", marginBottom: "4px"}}>Dueño (Persona)</label>
            <select name="idDueno" value={form.idDueno} onChange={handleChange} required style={inputStyle}>
              <option value="" disabled>Seleccione un dueño existente</option>
              {people.map(p => (
                <option key={p.id} value={p.id}>{p.name || p.nombres} {p.last_name || p.apellidos} ({p.document || p.documento})</option>
              ))}
            </select>

            <label style={{fontWeight: "bold", display: "block", marginBottom: "4px", marginTop: "12px"}}>Mascota</label>
            <select name="idMascota" value={form.idMascota} onChange={handleChange} required style={inputStyle}>
              <option value="" disabled>Seleccione una mascota existente</option>
              {pets.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} ({p.tipo || p.raza})</option>
              ))}
            </select>

            <label style={{fontWeight: "bold", display: "block", marginBottom: "4px", marginTop: "12px"}}>Fotografía (&lt; 50Kb)</label>
            
            {isCameraOpen ? (
              <div style={{ marginBottom: "12px", border: "1px solid #d1d5db", borderRadius: "4px", overflow: "hidden", backgroundColor: "#000" }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxHeight: "300px", objectFit: "cover", display: "block" }}></video>
                <div style={{ display: "flex", gap: "8px", padding: "8px", backgroundColor: "#fff" }}>
                  <button type="button" onClick={takePhoto} style={{ flex: 1, padding: "8px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>📸 Capturar</button>
                  <button type="button" onClick={stopCamera} style={{ flex: 1, padding: "8px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexDirection: "column" }}>
                <button type="button" onClick={startCamera} style={{ padding: "10px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "bold" }}>
                  <span>📷</span> Abrir Cámara Integrada
                </button>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
                  <span style={{ fontSize: "14px", color: "#6b7280" }}>O subir un archivo / usar cámara nativa:</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handleImageCapture} style={{ ...inputStyle, marginBottom: 0 }} />
                </div>
              </div>
            )}
            
            {imagePreview && (
              <div style={{marginTop: "8px", marginBottom: "12px", textAlign: "center"}}>
                <img src={imagePreview} alt="Preview" style={{maxWidth: "100%", height: "150px", objectFit: "cover", borderRadius: "4px"}} />
                <div style={{fontSize: "12px", color: "#6b7280"}}>
                  Tamaño aprox: {Math.round(imagePreview.length * 0.75 / 1024)} Kb
                </div>
              </div>
            )}

            <div style={{fontSize: "12px", color: "#6b7280", marginBottom: "16px"}}>
              📍 La ubicación (Lat/Lon) será capturada automáticamente por el GPS de tu dispositivo al enviar el formulario.
            </div>

            <button type="submit" disabled={loading || !form.fotografia} style={{ display: "block", width: "100%", padding: "10px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: loading || !form.fotografia ? "not-allowed" : "pointer", opacity: loading || !form.fotografia ? 0.6 : 1 }}>
              {loading ? "Procesando..." : online ? "Registrar Censo" : "Guardar Offline"}
            </button>
          </form>

          {state && <p style={{...colors[state.tipo], marginTop: "12px"}}>{state.mensaje}</p>}
        </div>

        {/* LISTADO */}
        <div style={{ padding: "16px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
          <h2 style={{ marginTop: 0 }}>Censos Guardados</h2>

          {loadingList ? (
            <p style={{ textAlign: "center", color: "#6b7280" }}>Cargando...</p>
          ) : censuses.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6b7280" }}>No hay censos registrados aún</p>
          ) : (
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {censuses.map((censo) => {
                const owner = people.find(p => p.id === censo.idDueno);
                const pet = pets.find(p => p.id === censo.idMascota);
                
                return (
                  <div key={censo.id} style={{ padding: "12px", marginBottom: "8px", backgroundColor: "white", borderRadius: "4px", border: "1px solid #e5e7eb", display: "flex", gap: "12px" }}>
                    {censo.fotografia && censo.fotografia.startsWith('data:image') && (
                      <img src={censo.fotografia} alt="Censo" style={{width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px"}} />
                    )}
                    <div>
                      <div style={{ fontWeight: "600" }}>Censo ID: {censo.id.substring(0,8)}...</div>
                      <div style={{ fontSize: "14px", color: "#6b7280" }}>
                        <div>👤 Dueño: {owner ? `${owner.name || owner.nombres}` : censo.idDueno}</div>
                        <div>🐱 Mascota: {pet ? pet.nombre : censo.idMascota}</div>
                        <div>📍 Lat: {censo.lat}, Lon: {censo.lon}</div>
                        {censo._syncStatus && (
                          <div style={{ marginTop: "6px", fontSize: "12px", padding: "4px 8px", backgroundColor: censo._syncStatus === "pending" ? "#fef3c7" : "#d1fae5", borderRadius: "3px", display: "inline-block" }}>
                            {censo._syncStatus === "pending" ? "⏳ Pendiente" : "✅ Sincronizado"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CensusPage;
