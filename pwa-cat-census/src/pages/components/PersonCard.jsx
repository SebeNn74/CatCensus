import "../styles/PeoplePage.css";

const SYNC_STATUS = {
  pending: { label: "Pendiente de sincronización", modifier: "pending" },
  synced: { label: "Sincronizado", modifier: "synced" },
};

function PersonCard({ person }) {
  const syncInfo = person.syncStatus ? SYNC_STATUS[person.syncStatus] : null;

  return (
    <article className="person-card">
      <div className="person-card-header">
        <span className="person-card-avatar" aria-hidden="true">
          {person.nombres.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="person-card-name">
            {person.nombres} {person.apellidos}
          </p>
          <p className="person-card-user">@{person.usuario}</p>
        </div>
      </div>

      <dl className="person-card-details">
        <div className="person-card-row">
          <dt>Doc.</dt>
          <dd>
            {person.tipoDocumento}: {person.documento}
          </dd>
        </div>
        <div className="person-card-row">
          <dt>Dirección</dt>
          <dd>{person.direccion}</dd>
        </div>
        <div className="person-card-row">
          <dt>Teléfono</dt>
          <dd>{person.telefono}</dd>
        </div>
        <div className="person-card-row">
          <dt>Ciudad</dt>
          <dd>{person.ciudad}</dd>
        </div>
      </dl>

      {syncInfo && (
        <span
          className={`person-card-badge person-card-badge--${syncInfo.modifier}`}
        >
          {syncInfo.label}
        </span>
      )}
    </article>
  );
}

export default PersonCard;
