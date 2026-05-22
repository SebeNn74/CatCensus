import "../styles/PetsPage.css";

const PET_SVG = {
  GATO: "/cat-face.svg",
  PERRO: "/dog-face.svg",
  PAJARO: "/bird-face.svg",
  OTRO: "/paw-prints.svg",
};

const SYNC_STATUS = {
  pending: { label: "Pendiente de sincronización", modifier: "pending" },
  synced: { label: "Sincronizado", modifier: "synced" },
};

function PetCard({ pet }) {
  const defaultImage = PET_SVG[pet.tipo] ?? PET_SVG.OTRO;
  const syncInfo = pet.syncStatus ? SYNC_STATUS[pet.syncStatus] : null;

  return (
    <article className="pet-card">
      {/* Foto o avatar emoji */}
      <div className="pet-card-photo-wrapper">
        <img
          className="pet-card-photo"
          src={pet.fotografia}
          alt={pet.nombre}
          onError={(e) => {
            e.currentTarget.src = defaultImage;
          }}
        />
      </div>

      {/* Info */}
      <div className="pet-card-info">
        <p className="pet-card-name">
          {pet.nombre}
          <span className="pet-card-type">{pet.tipo}</span>
        </p>
        <p className="pet-card-meta">
          {pet.genero} · {pet.edad} {pet.edad === 1 ? "año" : "años"}
        </p>

        {syncInfo && (
          <span
            className={`pet-card-badge pet-card-badge--${syncInfo.modifier}`}
          >
            {syncInfo.label}
          </span>
        )}
      </div>
    </article>
  );
}

export default PetCard;
