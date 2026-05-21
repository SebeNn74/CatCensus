import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useConnection } from "../hooks/useConnection";
import { createPetApi, getPetsApi } from "../api/pets";
import { saveLocal, getAll } from "../db/indexedDB";
import { generateUUID } from "../utils/uuid";

function PetsPage() {
  const { token } = useAuth();
  const online = useConnection();

  const [form, setForm] = useState({
    nombre: "",
    tipo: "GATO",
    genero: "HEMBRA",
    edad: "",
    fotografia: "",
  });

  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoadingList(true);
      let apiPets = [];
      if (online) {
        try {
          apiPets = await getPetsApi(token);
        } catch (err) {
          console.error("Error fetching from API:", err);
        }
      }
      const localPets = await getAll("mascotas");
      
      const combined = [...localPets];
      apiPets.forEach(apiP => {
        if (!combined.find(p => p.id === apiP.id)) {
          combined.push(apiP);
        }
      });
      
      setPets(combined);
    } catch (err) {
      console.error("Error al cargar mascotas:", err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setState(null);

    const pet = {
      id: generateUUID(),
      nombre: form.nombre,
      tipo: form.tipo,
      genero: form.genero,
      edad: Number(form.edad),
      fotografia: form.fotografia,
    };

    if (online) {
      try {
        await createPetApi(pet, token);
        setState({
          tipo: "ok",
          mensaje: "Mascota registrada correctamente",
        });
        resetForm();
        loadPets();
      } catch (err) {
        setState({ tipo: "error", mensaje: `${err.message}` });
      }
    } else {
      try {
        await saveLocal("mascotas", pet);
        setState({
          tipo: "offline",
          mensaje:
            "Guardado localmente. Se sincronizará al recuperar conexión.",
        });
        resetForm();
        loadPets();
      } catch (err) {
        setState({
          tipo: "error",
          mensaje: `Error al guardar local: ${err.message}`,
        });
      }
    }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      tipo: "GATO",
      genero: "HEMBRA",
      edad: "",
      fotografia: "",
    });
  };

  const colors = {
    ok: {
      backgroundColor: "#dcfce7",
      color: "#166534",
      padding: "8px",
      borderRadius: "4px",
    },
    error: {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
      padding: "8px",
      borderRadius: "4px",
    },
    offline: {
      backgroundColor: "#fef9c3",
      color: "#854d0e",
      padding: "8px",
      borderRadius: "4px",
    },
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    marginBottom: "8px",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
  };

  return (
    <div style={{ padding: "24px 16px" }}>
      <h1>Registro de Mascotas</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* FORMULARIO */}
        <div
          style={{
            padding: "16px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Agregar Mascota</h2>

          <form onSubmit={handleSubmit}>
            <input
              name="nombre"
              placeholder="Nombre de la mascota"
              value={form.nombre}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="GATO">GATO</option>
              <option value="PERRO">PERRO</option>
              <option value="PAJARO">PÁJARO</option>
              <option value="OTRO">OTRO</option>
            </select>
            <select
              name="genero"
              value={form.genero}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="HEMBRA">HEMBRA</option>
              <option value="MACHO">MACHO</option>
            </select>
            <input
              name="edad"
              type="number"
              step="any"
              placeholder="Edad (años)"
              value={form.edad}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              name="fotografia"
              placeholder="URL de fotografía"
              value={form.fotografia}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading
                ? "Guardando..."
                : online
                  ? "Registrar"
                  : "Guardar Offline"}
            </button>
          </form>

          {state && <p style={colors[state.tipo]}>{state.mensaje}</p>}
        </div>

        {/* LISTADO */}
        <div
          style={{
            padding: "16px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Mascotas Guardadas</h2>

          {loadingList ? (
            <p style={{ textAlign: "center", color: "#6b7280" }}>Cargando...</p>
          ) : pets.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6b7280" }}>
              No hay mascotas registradas aún
            </p>
          ) : (
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  style={{
                    padding: "12px",
                    marginBottom: "8px",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    gap: "12px",
                    alignItems: "center"
                  }}
                >
                  {pet.fotografia && (
                    <img 
                      src={pet.fotografia} 
                      alt={pet.nombre} 
                      style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }}
                      onError={(e) => { e.target.src = '/cat-face.svg' }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: "600" }}>
                      {pet.nombre} <span style={{fontWeight: "normal", color: "#6b7280"}}>({pet.tipo})</span>
                    </div>
                    <div style={{ fontSize: "14px", color: "#6b7280" }}>
                      <div>🎂 {pet.edad} años | {pet.genero}</div>
                      {pet._syncStatus && (
                        <div
                          style={{
                            marginTop: "6px",
                            fontSize: "12px",
                            padding: "4px 8px",
                            backgroundColor:
                              pet._syncStatus === "pending"
                                ? "#fef3c7"
                                : "#d1fae5",
                            borderRadius: "3px",
                            display: "inline-block"
                          }}
                        >
                          {pet._syncStatus === "pending"
                            ? "⏳ Pendiente"
                            : "✅ Sincronizado"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PetsPage;
