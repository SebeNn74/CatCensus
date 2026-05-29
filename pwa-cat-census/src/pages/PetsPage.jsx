import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useConnection } from "../hooks/useConnection";
import { createPetApi, getPetsApi } from "../api/pets";
import {
  saveLocal,
  getAll,
  syncPending,
  cacheRemoteData,
} from "../db/indexedDB";
import PetCard from "./components/PetCard";
import "./styles/PetsPage.css";

const PET_TYPES = [
  { value: "GATO", label: "Gato" },
  { value: "PERRO", label: "Perro" },
  { value: "PAJARO", label: "Pájaro" },
  { value: "OTRO", label: "Otro" },
];

const GENDERS = [
  { value: "HEMBRA", label: "Hembra" },
  { value: "MACHO", label: "Macho" },
];

const INITIAL_FORM = {
  nombre: "",
  tipo: "GATO",
  genero: "HEMBRA",
  edad: "",
  fotografia: "",
};

const FEEDBACK_TYPE = {
  ok: "ok",
  error: "error",
  offline: "offline",
};

function usePets(token, online) {
  const [pets, setPets] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const loadPets = useCallback(async () => {
    setLoadingList(true);
    try {
      if (online) {
        try {
          const remote = await getPetsApi(token);
          await cacheRemoteData("mascotas", remote);
        } catch (err) {
          console.error("Error al obtener mascotas del servidor:", err);
        }
      }

      const local = await getAll("mascotas");
      setPets(local);
    } catch (err) {
      console.error("Error al cargar mascotas:", err);
    } finally {
      setLoadingList(false);
    }
  }, [token, online]);

  useEffect(() => {
    const sync = async () => {
      if (!online) return;
      try {
        await syncPending("mascotas", async (pet) => {
          await createPetApi(pet, token);
        });
        await loadPets();
      } catch (err) {
        console.error("Error sincronizando pendientes:", err);
      }
    };

    sync();
  }, [online, token, loadPets]);

  return { pets, loadingList, loadPets };
}

function PetsPage() {
  const { token } = useAuth();
  const online = useConnection();

  const [form, setForm] = useState(INITIAL_FORM);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const { pets, loadingList, loadPets } = usePets(token, online);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () => setForm(INITIAL_FORM);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const pet = {
      nombre: form.nombre,
      tipo: form.tipo,
      genero: form.genero,
      edad: Number(form.edad),
      fotografia: form.fotografia,
    };

    try {
      if (online) {
        await createPetApi(pet, token);
        setFeedback({
          type: FEEDBACK_TYPE.ok,
          message: "Mascota registrada correctamente.",
        });
      } else {
        await saveLocal("mascotas", pet);
        setFeedback({
          type: FEEDBACK_TYPE.offline,
          message:
            "Guardado localmente. Se sincronizará al recuperar conexión.",
        });
      }
      resetForm();
      loadPets();
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
    <div className="pets-page">
      <h1 className="pets-page-title">Registro de Mascotas</h1>

      <div className="pets-layout">
        {/* ── Formulario ──────────────────────────────────────────────────── */}
        <section className="pets-panel" aria-label="Formulario de registro">
          <h2 className="pets-panel-title">Agregar Mascota</h2>

          <form className="pets-form" onSubmit={handleSubmit} noValidate>
            <input
              className="pets-input"
              name="nombre"
              placeholder="Nombre de la mascota"
              value={form.nombre}
              onChange={handleChange}
              required
            />

            <select
              className="pets-input pets-select"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
            >
              {PET_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
              className="pets-input pets-select"
              name="genero"
              value={form.genero}
              onChange={handleChange}
            >
              {GENDERS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <input
              className="pets-input"
              name="edad"
              type="number"
              step="any"
              min="0"
              placeholder="Edad (años)"
              value={form.edad}
              onChange={handleChange}
              required
            />
            <input
              className="pets-input"
              name="fotografia"
              placeholder="URL de fotografía"
              value={form.fotografia}
              onChange={handleChange}
            />

            <button
              className="pets-btn-submit"
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
              <p className={`pets-feedback pets-feedback--${feedback.type}`}>
                {feedback.message}
              </p>
            )}
          </form>
        </section>

        {/* ── Listado ─────────────────────────────────────────────────────── */}
        <section className="pets-panel" aria-label="Mascotas registradas">
          <h2 className="pets-panel-title">
            Mascotas Guardadas
            {pets.length > 0 && (
              <span className="pets-count">{pets.length}</span>
            )}
          </h2>

          {loadingList && <p className="pets-list-state">Cargando...</p>}

          {!loadingList && pets.length === 0 && (
            <p className="pets-list-state">No hay mascotas registradas aún.</p>
          )}

          {!loadingList && pets.length > 0 && (
            <div className="pets-list">
              {pets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default PetsPage;
