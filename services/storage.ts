import * as SQLite from 'expo-sqlite';
import { CatchRecord } from './types';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  if (!initPromise) {
    initPromise = (async () => {
      const database = await SQLite.openDatabaseAsync('fishing-app.db');
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS catch_records (
          id TEXT PRIMARY KEY,
          fishSpeciesId TEXT NOT NULL,
          fishName TEXT NOT NULL,
          photoUri TEXT,
          length REAL,
          weight REAL,
          location TEXT,
          latitude REAL,
          longitude REAL,
          caughtAt TEXT NOT NULL,
          notes TEXT,
          identifiedBy TEXT DEFAULT 'manual',
          createdAt TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);
      db = database;
    })();
  }
  await initPromise;
  return db!;
}

export async function insertCatchRecord(record: CatchRecord): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO catch_records (id, fishSpeciesId, fishName, photoUri, length, weight, location, latitude, longitude, caughtAt, notes, identifiedBy)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.fishSpeciesId,
      record.fishName,
      record.photoUri || null,
      record.length || null,
      record.weight || null,
      record.location || null,
      record.latitude || null,
      record.longitude || null,
      record.caughtAt,
      record.notes || null,
      record.identifiedBy,
    ]
  );
}

export async function getAllCatchRecords(): Promise<CatchRecord[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    'SELECT * FROM catch_records ORDER BY caughtAt DESC'
  );
  return rows.map(mapRowToCatchRecord);
}

export async function getCatchRecordsByFish(fishSpeciesId: string): Promise<CatchRecord[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    'SELECT * FROM catch_records WHERE fishSpeciesId = ? ORDER BY caughtAt DESC',
    [fishSpeciesId]
  );
  return rows.map(mapRowToCatchRecord);
}

export async function deleteCatchRecord(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM catch_records WHERE id = ?', [id]);
}

export async function getCatchStats(): Promise<{
  totalCatches: number;
  uniqueSpecies: number;
  maxLength: number;
  maxWeight: number;
}> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<any>(`
    SELECT
      COUNT(*) as totalCatches,
      COUNT(DISTINCT fishSpeciesId) as uniqueSpecies,
      COALESCE(MAX(length), 0) as maxLength,
      COALESCE(MAX(weight), 0) as maxWeight
    FROM catch_records
  `);
  return {
    totalCatches: row?.totalCatches || 0,
    uniqueSpecies: row?.uniqueSpecies || 0,
    maxLength: row?.maxLength || 0,
    maxWeight: row?.maxWeight || 0,
  };
}

export async function getFishCatchCount(fishSpeciesId: string): Promise<number> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<any>(
    'SELECT COUNT(*) as count FROM catch_records WHERE fishSpeciesId = ?',
    [fishSpeciesId]
  );
  return row?.count || 0;
}

export async function getFishCatchCounts(): Promise<Record<string, number>> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    'SELECT fishSpeciesId, COUNT(*) as count FROM catch_records GROUP BY fishSpeciesId'
  );
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.fishSpeciesId] = row.count;
  }
  return counts;
}

export async function getSetting(key: string): Promise<string | null> {
  try {
    const database = await getDatabase();
    const row = await database.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      [key]
    );
    return row?.value ?? null;
  } catch (error) {
    console.error(`getSetting(${key}) error:`, error);
    return null;
  }
}

export async function setSetting(key: string, value: string): Promise<boolean> {
  try {
    const database = await getDatabase();
    await database.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, value]
    );
    // 验证写入成功
    const verify = await getSetting(key);
    return verify === value;
  } catch (error) {
    console.error(`setSetting(${key}) error:`, error);
    return false;
  }
}

export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const database = await getDatabase();
    const rows = await database.getAllAsync<{ key: string; value: string }>(
      'SELECT key, value FROM settings'
    );
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return settings;
  } catch (error) {
    console.error('getAllSettings error:', error);
    return {};
  }
}

function mapRowToCatchRecord(row: any): CatchRecord {
  return {
    id: row.id,
    fishSpeciesId: row.fishSpeciesId,
    fishName: row.fishName,
    photoUri: row.photoUri,
    length: row.length,
    weight: row.weight,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    caughtAt: row.caughtAt,
    notes: row.notes,
    identifiedBy: row.identifiedBy,
  };
}