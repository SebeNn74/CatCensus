import PouchDB from "pouchdb-browser";

const DB_PREFIX = "pets-census-db";
const STORES = ["personas", "mascotas", "censos"];
const databases = new Map();

// Obtiene o inicializa una base de datos para un store
function getDB(storeName) {
  if (!STORES.includes(storeName)) {
    throw new Error(
      `Store inválido: ${storeName}. Válidos: ${STORES.join(", ")}`,
    );
  }
  if (!databases.has(storeName)) {
    databases.set(storeName, new PouchDB(`${DB_PREFIX}-${storeName}`));
  }
  return databases.get(storeName);
}

// CREAR: Guarda un nuevo registro
export async function create(storeName, data) {
  const db = getDB(storeName);

  if (!data?.id) {
    throw new Error("El registro debe tener un campo id");
  }

  const record = {
    ...data,
    _id: String(data.id),
    syncStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  try {
    await db.put(record);
    return record;
  } catch (error) {
    throw new Error(`Error al crear en ${storeName}: ${error.message}`, {
      cause: error,
    });
  }
}

// LEER: Obtiene todos los registros
export async function readAll(storeName) {
  const db = getDB(storeName);
  try {
    const result = await db.allDocs({ include_docs: true });

    return result.rows
      .filter((row) => row.doc)
      .map((row) => {
        const { _id, ...record } = row.doc;
        return { ...record, id: record.id ?? _id };
      });
  } catch (error) {
    throw new Error(`[PouchDB] Error al obtener: ${error.message}`, {
      cause: error,
    });
  }
}

// LEER: Obtiene un registro por id
export async function readOne(storeName, id) {
  const db = getDB(storeName);
  const docId = String(id);

  try {
    const doc = await db.get(docId);
    const { _id, ...record } = doc;
    return { ...record, id: record.id ?? _id };
  } catch (error) {
    if (error.status === 404) {
      return null;
    }
    throw new Error(`Error al leer ${storeName}/${id}: ${error.message}`, {
      cause: error,
    });
  }
}

// ACTUALIZAR: Modifica un registro existente
export async function update(storeName, id, updates) {
  const db = getDB(storeName);
  const docId = String(id);

  try {
    const doc = await db.get(docId);
    const updated = {
      ...doc,
      ...updates,
      syncStatus:
        doc.syncStatus === "synced" ? "pending" : doc.syncStatus,
      updatedAt: new Date().toISOString(),
    };
    await db.put(updated);

    const { _id, ...record } = updated;
    return { ...record, id: record.id ?? _id };
  } catch (error) {
    if (error.status === 404) {
      throw new Error(`Registro no encontrado: ${id}`, { cause: error });
    }
    throw new Error(
      `Error al actualizar ${storeName}/${id}: ${error.message}`,
      {
        cause: error,
      },
    );
  }
}

// ELIMINAR: Elimina un registro por id
export async function remove(storeName, id) {
  const db = getDB(storeName);
  const docId = String(id);

  try {
    const doc = await db.get(docId);
    await db.remove(doc);
    return true;
  } catch (error) {
    if (error.status === 404) {
      return false;
    }
    throw new Error(`Error al eliminar ${storeName}/${id}: ${error.message}`, {
      cause: error,
    });
  }
}

// Obtiene todos los registros pendientes de sincronización
export async function getPendingSync(storeName) {
  const all = await readAll(storeName);
  return all.filter((item) => item.syncStatus === "pending");
}

// Marca un registro como sincronizado
export async function markAsSynced(storeName, id) {
  return update(storeName, id, { syncStatus: "synced" });
}

export async function getSyncStats() {
  const stats = {};
  for (const store of STORES) {
    const pendings = await getPendingSync(store);
    stats[store] = pendings.length;
  }

  return {
    ...stats,
    total: Object.values(stats).reduce((a, b) => a + b, 0),
  };
}

export async function syncPending(storeName, syncFn) {
  const pendings = await getPendingSync(storeName);

  for (const item of pendings) {
    try {
      await syncFn(item);
      await remove(storeName, item.id);
    } catch (err) {
      console.error("Error sincronizando:", item.id, err);
    }
  }
}

export const saveLocal = create;
export const getAll = readAll;

export async function countPendings() {
  return getSyncStats();
}
