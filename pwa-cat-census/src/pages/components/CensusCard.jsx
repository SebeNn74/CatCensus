import "../styles/CensusPage.css";

const SYNC_STATUS = {
  pending: { label: "Pendiente de sincronización", modifier: "pending" },
  synced: { label: "Sincronizado", modifier: "synced" },
};

const shortId = (id) => id ? String(id).substring(0, 8) : "N/A";

function CensusCard({ census, owner, pet }) {
  const syncInfo = census.syncStatus ? SYNC_STATUS[census.syncStatus] : null;

  const actualOwner = owner || census.dueno;
  const actualPet = pet || census.mascota;

  const ownerId = actualOwner?.id || census.idDueno;
  const petId = actualPet?.id || census.idMascota;

  const ownerName = actualOwner
    ? `${actualOwner.name ?? actualOwner.nombres ?? ""} ${actualOwner.last_name ?? actualOwner.apellidos ?? ""}`.trim()
    : `ID: ${shortId(ownerId)}…`;

  const petName = actualPet ? actualPet.nombre : `ID: ${shortId(petId)}…`;

  const photo = census.fotografiaCenso || census.fotografia;

  return (
    <article className="census-card">
      {/* Miniatura de la foto */}
      {photo && (
        <img
          className="census-card-photo"
          src={photo}
          alt={`Foto del censo ${shortId(census.id)}`}
        />
      )}

      <div className="census-card-info">
        <p className="census-card-id">Censo #{shortId(census.id)}…</p>

        <dl className="census-card-details">
          <div className="census-card-row">
            <dt>Dueño</dt>
            <dd>{ownerName}</dd>
          </div>
          <div className="census-card-row">
            <dt>Mascota</dt>
            <dd>{petName}</dd>
          </div>
          <div className="census-card-row">
            <dt>Ubicación</dt>
            <dd>
              {census.lat}, {census.lon}
            </dd>
          </div>
        </dl>

        {syncInfo && (
          <span
            className={`census-card-badge census-card-badge--${syncInfo.modifier}`}
          >
            {syncInfo.label}
          </span>
        )}
      </div>
    </article>
  );
}

export default CensusCard;
