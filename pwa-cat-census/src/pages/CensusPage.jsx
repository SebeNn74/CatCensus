import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useConnection } from "../hooks/useConnection";
import { createCensusApi, getCensusApi } from "../api/census";
import { getPeopleApi } from "../api/people";
import { getPetsApi } from "../api/pets";
import { saveLocal, getAll, cacheRemoteData, syncPending } from "../db/indexedDB";
import { generateUUID } from "../utils/uuid";
import CensusCard from "./components/CensusCard";
import CameraCapture from "./components/CameraCapture";
import "./styles/CensusPage.css";

const INITIAL_FORM = {
  idMascota: "",
  idDueno: "",
  fotografia: "",
};

const FEEDBACK_TYPE = {
  ok: "ok",
  error: "error",
  offline: "offline",
};



function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("La geolocalización no es soportada por tu navegador."));
    } else {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) =>
          resolve({ lat: coords.latitude, lon: coords.longitude }),
        reject,
      );
    }
  });
}

function useCensuses(token, online) {
  const [censuses, setCensuses] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const loadCensuses = useCallback(async () => {
    setLoadingList(true);
    try {
      if (online) {
        try {
          const remote = await getCensusApi(token);
          await cacheRemoteData("censos", remote);
        } catch (err) {
          console.error("Error al obtener censos del servidor:", err);
        }
      }
      
      const local = await getAll("censos");
      setCensuses(local);
    } catch (err) {
      console.error("Error al cargar censos:", err);
    } finally {
      setLoadingList(false);
    }
  }, [token, online]);

  useEffect(() => {
    const sync = async () => {
      if (!online) return;
      try {
        await syncPending("censos", async (census) => {
          await createCensusApi(census, token);
        });
      } catch (err) {
        console.error("Error sincronizando censos pendientes:", err);
      }
    };

    sync().then(() => {
      loadCensuses();
    });
  }, [online, token, loadCensuses]);

  return { censuses, loadingList, loadCensuses };
}

function useDependencies(token, online) {
  const [people, setPeople] = useState([]);
  const [pets, setPets] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        if (online) {
          try {
            const [remotePeople, remotePets] = await Promise.all([
              getPeopleApi(token),
              getPetsApi(token),
            ]);
            await cacheRemoteData("personas", remotePeople);
            await cacheRemoteData("mascotas", remotePets);
          } catch (err) {
            console.error("Error al obtener dependencias del servidor:", err);
          }
        }

        const localPeople = await getAll("personas");
        const localPets = await getAll("mascotas");
        
        setPeople(localPeople);
        setPets(localPets);
      } catch (err) {
        console.error("Error al cargar dependencias:", err);
      }
    }
    load();
  }, [token, online]);

  return { people, pets };
}

function CensusPage() {
  const { token } = useAuth();
  const online = useConnection();

  const [form, setForm] = useState(INITIAL_FORM);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const { censuses, loadingList, loadCensuses } = useCensuses(token, online);
  const { people, pets } = useDependencies(token, online);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePhotoCapture = (base64) =>
    setForm((prev) => ({ ...prev, fotografia: base64 }));

  const resetForm = () => setForm(INITIAL_FORM);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({
      type: FEEDBACK_TYPE.ok,
      message: "Obteniendo ubicación GPS…",
    });

    try {
      const coords = await getCurrentPosition();

      const census = {
        id: generateUUID(),
        idMascota: form.idMascota,
        idDueno: form.idDueno,
        fotografia: form.fotografia,
        lat: coords.lat,
        lon: coords.lon,
      };

      if (online) {
        await createCensusApi(census, token);
        setFeedback({
          type: FEEDBACK_TYPE.ok,
          message: "Censo registrado y sincronizado correctamente.",
        });
      } else {
        await saveLocal("censos", census);
        setFeedback({
          type: FEEDBACK_TYPE.offline,
          message:
            "Guardado localmente. Se sincronizará al recuperar conexión.",
        });
      }

      resetForm();
      loadCensuses();
    } catch (err) {
      setFeedback({
        type: FEEDBACK_TYPE.error,
        message: `Error: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading && !!form.fotografia;

  return (
    <div className="census-page">
      <h1 className="census-page-title">Registro de Censos</h1>

      <div className="census-layout">
        {/* ── Formulario ──────────────────────────────────────────────────── */}
        <section className="census-panel" aria-label="Formulario de censo">
          <h2 className="census-panel-title">Nuevo Censo</h2>

          <form className="census-form" onSubmit={handleSubmit} noValidate>
            <label className="census-label" htmlFor="idDueno">
              Dueño (Persona)
            </label>
            <select
              className="census-input census-select"
              id="idDueno"
              name="idDueno"
              value={form.idDueno}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Seleccione un dueño
              </option>
              {people.map((p) => {
                const name =
                  `${p.name ?? p.nombres ?? ""} ${p.last_name ?? p.apellidos ?? ""}`.trim();
                const doc = p.document ?? p.documento ?? "";
                return (
                  <option key={p.id} value={p.id}>
                    {name} ({doc})
                  </option>
                );
              })}
            </select>

            <label className="census-label" htmlFor="idMascota">
              Mascota
            </label>
            <select
              className="census-input census-select"
              id="idMascota"
              name="idMascota"
              value={form.idMascota}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Seleccione una mascota
              </option>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.tipo ?? p.raza})
                </option>
              ))}
            </select>

            <label className="census-label">Fotografía (máx. 50 Kb)</label>
            <CameraCapture onCapture={handlePhotoCapture} />

            <p className="census-gps-hint">
              📍 La ubicación GPS se capturará automáticamente al enviar.
            </p>

            <button
              className="census-btn-submit"
              type="submit"
              disabled={!canSubmit}
            >
              {loading
                ? "Procesando…"
                : online
                  ? "Registrar Censo"
                  : "Guardar Offline"}
            </button>

            {feedback && (
              <p
                className={`census-feedback census-feedback--${feedback.type}`}
              >
                {feedback.message}
              </p>
            )}
          </form>
        </section>

        {/* ── Listado ─────────────────────────────────────────────────────── */}
        <section className="census-panel" aria-label="Censos registrados">
          <h2 className="census-panel-title">
            Censos Guardados
            {censuses.length > 0 && (
              <span className="census-count">{censuses.length}</span>
            )}
          </h2>

          {loadingList && <p className="census-list-state">Cargando…</p>}

          {!loadingList && censuses.length === 0 && (
            <p className="census-list-state">No hay censos registrados aún.</p>
          )}

          {!loadingList && censuses.length > 0 && (
            <div className="census-list">
              {censuses.map((census) => (
                <CensusCard
                  key={census.id}
                  census={census}
                  owner={people.find((p) => p.id === census.idDueno)}
                  pet={pets.find((p) => p.id === census.idMascota)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default CensusPage;
