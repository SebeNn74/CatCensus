import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useConnection } from "../hooks/useConnection";
import { createPersonApi, getPeopleApi } from "../api/people";
import { saveLocal, getAll, syncPending, markAsSynced } from "../db/indexedDB";
import { generateUUID } from "../utils/uuid";
import PersonCard from "./components/PersonCard";
import "./styles/PeoplePage.css";

const DOC_TYPES = [
  { value: "CC", label: "CC – Cédula de Ciudadanía" },
  { value: "CE", label: "CE – Cédula de Extranjería" },
  { value: "Pasaporte", label: "Pasaporte" },
];

const INITIAL_FORM = {
  nombres: "",
  apellidos: "",
  tipoDocumento: "CC",
  documento: "",
  direccion: "",
  telefono: "",
  ciudad: "",
  usuario: "",
  contrasena: "",
};

const FEEDBACK_TYPE = {
  ok: "ok",
  error: "error",
  offline: "offline",
};

function usePeople(token, online) {
  const [people, setPeople] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const loadPeople = useCallback(async () => {
    setLoadingList(true);
    try {
      const local = await getAll("personas");
      let merged = [...local];

      if (online) {
        try {
          const remote = await getPeopleApi(token);
          remote.forEach((remotePerson) => {
            if (!merged.find((p) => p.id === remotePerson.id)) {
              merged.push(remotePerson);
            }
          });
        } catch (err) {
          console.error("Error al obtener personas del servidor:", err);
        }
      }

      setPeople(merged);
    } catch (err) {
      console.error("Error al cargar personas:", err);
    } finally {
      setLoadingList(false);
    }
  }, [token, online]);

  useEffect(() => {
    const sync = async () => {
      if (!online) return;
      try {
        await syncPending("personas", async (person) => {
          await createPersonApi(person, token);
        });
        await loadPeople();
      } catch (err) {
        console.error("Error sincronizando pendientes:", err);
      }
    };

    sync();
  }, [online, token, loadPeople]);

  return { people, loadingList, loadPeople };
}

function PeoplePage() {
  const { token } = useAuth();
  const online = useConnection();

  const [form, setForm] = useState(INITIAL_FORM);
  const [feedback, setFeedback] = useState(null); // { type, message }
  const [loading, setLoading] = useState(false);

  const { people, loadingList, loadPeople } = usePeople(token, online);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () => setForm(INITIAL_FORM);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const person = { id: generateUUID(), ...form };

    try {
      await saveLocal("personas", person);
      
      if (online) {
        try {
          await createPersonApi(person, token);
          await markAsSynced("personas", person.id);
          setFeedback({
            type: FEEDBACK_TYPE.ok,
            message: "Persona registrada correctamente.",
          });
        } catch (err) {
          setFeedback({
            type: FEEDBACK_TYPE.error,
            message: `Error al registrar: ${err.message}`,
          });
        }
      } else {
        setFeedback({
          type: FEEDBACK_TYPE.offline,
          message:
            "Guardado localmente. Se sincronizará al recuperar conexión.",
        });
      }
      resetForm();
      loadPeople();
    } catch (err) {
      setFeedback({
        type: FEEDBACK_TYPE.error,
        message: `Error al guardar: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="people-page">
      <h1 className="people-page-title">Registro de Personas</h1>

      <div className="people-layout">
        {/* ── Columna izquierda: formulario ─────────────────────────────── */}
        <section className="people-panel" aria-label="Formulario de registro">
          <h2 className="people-panel-title">Agregar Persona</h2>

          <form className="people-form" onSubmit={handleSubmit} noValidate>
            <input
              className="people-input"
              name="nombres"
              placeholder="Nombres"
              value={form.nombres}
              onChange={handleChange}
              required
            />
            <input
              className="people-input"
              name="apellidos"
              placeholder="Apellidos"
              value={form.apellidos}
              onChange={handleChange}
              required
            />

            <select
              className="people-input people-select"
              name="tipoDocumento"
              value={form.tipoDocumento}
              onChange={handleChange}
            >
              {DOC_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <input
              className="people-input"
              name="documento"
              placeholder="Número de Documento"
              value={form.documento}
              onChange={handleChange}
              required
            />
            <input
              className="people-input"
              name="direccion"
              placeholder="Dirección"
              value={form.direccion}
              onChange={handleChange}
              required
            />
            <input
              className="people-input"
              name="telefono"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={handleChange}
              required
            />
            <input
              className="people-input"
              name="ciudad"
              placeholder="Ciudad"
              value={form.ciudad}
              onChange={handleChange}
              required
            />
            <input
              className="people-input"
              name="usuario"
              placeholder="Usuario"
              value={form.usuario}
              onChange={handleChange}
              required
            />
            <input
              className="people-input"
              name="contrasena"
              type="password"
              placeholder="Contraseña"
              value={form.contrasena}
              onChange={handleChange}
              required
            />

            <button
              className="people-btn-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Guardando..."
                : online
                  ? "Registrar"
                  : "Guardar Offline"}
            </button>

            {feedback && (
              <p
                className={`people-feedback people-feedback--${feedback.type}`}
              >
                {feedback.message}
              </p>
            )}
          </form>
        </section>

        {/* ── Columna derecha: listado ───────────────────────────────────── */}
        <section className="people-panel" aria-label="Personas registradas">
          <h2 className="people-panel-title">
            Personas Guardadas
            {people.length > 0 && (
              <span className="people-count">{people.length}</span>
            )}
          </h2>

          {loadingList && <p className="people-list-state">Cargando...</p>}

          {!loadingList && people.length === 0 && (
            <p className="people-list-state">
              No hay personas registradas aún.
            </p>
          )}

          {!loadingList && people.length > 0 && (
            <div className="people-list">
              {people.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default PeoplePage;
