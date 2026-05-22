import "../styles/CensusPage.css";

const SYNC_STATUS = {
  pending: { label: "Pendiente de sincronización", modifier: "pending" },
  synced: { label: "Sincronizado", modifier: "synced" },
};

const shortId = (id) => id.substring(0, 8);
const isBase64 = (str) => str?.startsWith("data:image");

function CensusCard({ census, owner, pet }) {
  const syncInfo = census.syncStatus ? SYNC_STATUS[census.syncStatus] : null;

  const ownerName = owner
    ? `${owner.name ?? owner.nombres ?? ""} ${owner.last_name ?? owner.apellidos ?? ""}`.trim()
    : `ID: ${shortId(census.idDueno)}…`;

  const petName = pet ? pet.nombre : `ID: ${shortId(census.idMascota)}…`;

  return (
    <article className="census-card">
      {/* Miniatura de la foto */}
      {isBase64(census.fotografia) && (
        <img
          className="census-card-photo"
          src={census.fotografia}
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
