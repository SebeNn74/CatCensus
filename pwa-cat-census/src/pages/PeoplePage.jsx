import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useConnection } from "../hooks/useConnection";
import { createPersonApi, getPeopleApi } from "../api/people";
import { saveLocal, getAll } from "../db/indexedDB";
import { generateUUID } from "../utils/uuid";

function PeoplePage() {
  const { token } = useAuth();
  const online = useConnection();

  const [form, setForm] = useState({
    name: "",
    last_name: "",
    docType: "CC",
    document: "",
    address: "",
    phone: "",
    city: "",
    user: "",
    password: "",
  });

  const [state, setState] = useState(null); // { tipo: 'ok'|'error'|'offline', mensaje }
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // Cargar personas guardadas localmente
  useEffect(() => {
    (async () => {
      try {
        setLoadingList(true);
        const personas = await getAll("personas");
        setPeople(personas);
      } catch (err) {
        console.error("Error al cargar personas:", err);
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  const loadPeople = async () => {
    try {
      setLoadingList(true);
      let apiPeople = [];
      if (online) {
        try {
          apiPeople = await getPeopleApi(token);
        } catch (err) {
          console.error("Error fetching from API:", err);
        }
      }
      const personas = await getAll("personas");
      
      const combined = [...personas];
      apiPeople.forEach(apiP => {
        if (!combined.find(p => p.id === apiP.id)) {
          combined.push(apiP);
        }
      });
      
      setPeople(combined);
    } catch (err) {
      console.error("Error al cargar personas:", err);
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

    const person = { id: generateUUID(), ...form };

    // Online: envía al backend
    if (online) {
      try {
        await createPersonApi(person, token);
        setState({
          tipo: "ok",
          mensaje: "Persona registrada correctamente",
        });
        resetForm();
        loadPeople();
      } catch (err) {
        setState({ tipo: "error", mensaje: `${err.message}` });
      }

      // Sin conexión: guarda localmente
    } else {
      try {
        await saveLocal("personas", person);
        setState({
          tipo: "offline",
          mensaje:
            "Guardado localmente. Se sincronizará al recuperar conexión.",
        });
        resetForm();
        loadPeople();
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
      name: "",
      last_name: "",
      docType: "CC",
      document: "",
      address: "",
      phone: "",
      city: "",
      user: "",
      password: "",
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

  return (
    <div style={{ padding: "24px 16px" }}>
      <h1>Registro de Personas</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div
          style={{
            padding: "16px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Agregar Persona</h2>

          <form onSubmit={handleSubmit}>
            <input
              name="name"
              placeholder="Nombres"
              value={form.name}
              onChange={handleChange}
              required
              style={{
                display: "block",
                width: "100%",
                marginBottom: "8px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            />
            <input
              name="last_name"
              placeholder="Apellidos"
              value={form.last_name}
              onChange={handleChange}
              required
              style={{
                display: "block",
                width: "100%",
                marginBottom: "8px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            />

            <select
              name="docType"
              value={form.docType}
              onChange={handleChange}
              style={{
                display: "block",
                width: "100%",
                marginBottom: "8px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            >
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="Pasaporte">Pasaporte</option>
            </select>

            <input
              name="document"
              placeholder="Número de documento"
              value={form.document}
              onChange={handleChange}
              required
              style={{
                display: "block",
                width: "100%",
                marginBottom: "8px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            />
            <input
              name="address"
              placeholder="Dirección"
              value={form.address}
              onChange={handleChange}
              required
              style={{
                display: "block",
                width: "100%",
                marginBottom: "8px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            />
            <input
              name="phone"
              placeholder="Teléfono"
              value={form.phone}
              onChange={handleChange}
              required
              style={{
                display: "block",
                width: "100%",
                marginBottom: "8px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            />
            <input
              name="city"
              placeholder="Ciudad"
              value={form.city}
              onChange={handleChange}
              required
              style={{
                display: "block",
                width: "100%",
                marginBottom: "8px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            />
            <input
              name="user"
              placeholder="Usuario"
              value={form.user}
              onChange={handleChange}
              required
              style={{
                display: "block",
                width: "100%",
                marginBottom: "8px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            />
            <input
              name="password"
              placeholder="Contraseña"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                display: "block",
                width: "100%",
                marginBottom: "8px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
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

        {/* COLUMNA DERECHA: LISTADO */}
        <div
          style={{
            padding: "16px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Personas Guardadas</h2>

          {loadingList ? (
            <p style={{ textAlign: "center", color: "#6b7280" }}>Cargando...</p>
          ) : people.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6b7280" }}>
              No hay personas registradas aún
            </p>
          ) : (
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {people.map((person) => (
                <div
                  key={person.id}
                  style={{
                    padding: "12px",
                    marginBottom: "8px",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ fontWeight: "600" }}>
                    {person.name} {person.last_name}
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>
                    <div>
                      📄 {person.docType}: {person.document}
                    </div>
                    <div>📍 {person.address}</div>
                    <div>📞 {person.phone}</div>
                    <div>🏙️ {person.city}</div>
                    <div>👤 @{person.user}</div>
                    {person._syncStatus && (
                      <div
                        style={{
                          marginTop: "6px",
                          fontSize: "12px",
                          padding: "4px 8px",
                          backgroundColor:
                            person._syncStatus === "pending"
                              ? "#fef3c7"
                              : "#d1fae5",
                          borderRadius: "3px",
                        }}
                      >
                        {person._syncStatus === "pending"
                          ? "⏳ Pendiente de sincronización"
                          : "✅ Sincronizado"}
                      </div>
                    )}
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

export default PeoplePage;
