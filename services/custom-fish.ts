import { FishSpecies } from '../data/fish-encyclopedia';
import { getDatabase } from './storage';

export async function createCustomFishTable(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS custom_fish (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      scientificName TEXT DEFAULT '',
      category TEXT NOT NULL DEFAULT 'freshwater',
      family TEXT DEFAULT '',
      description TEXT DEFAULT '',
      avgSizeMin REAL DEFAULT 0,
      avgSizeMax REAL DEFAULT 0,
      optimalTempMin REAL DEFAULT 15,
      optimalTempMax REAL DEFAULT 25,
      tips TEXT DEFAULT '',
      photoUri TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);
}

export async function insertCustomFish(fish: FishSpecies & { photoUri?: string }): Promise<void> {
  await createCustomFishTable();
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO custom_fish (id, name, scientificName, category, family, description, avgSizeMin, avgSizeMax, optimalTempMin, optimalTempMax, tips, photoUri)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fish.id,
      fish.name,
      fish.scientificName || '',
      fish.category,
      fish.family || '',
      fish.description || '',
      fish.avgSize?.min || 0,
      fish.avgSize?.max || 0,
      fish.optimalTemp?.min || 15,
      fish.optimalTemp?.max || 25,
      fish.tips || '',
      fish.photoUri || null,
    ]
  );
}

export async function getAllCustomFish(): Promise<(FishSpecies & { photoUri?: string })[]> {
  await createCustomFishTable();
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    'SELECT * FROM custom_fish ORDER BY createdAt DESC'
  );
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    scientificName: row.scientificName,
    category: row.category as 'freshwater' | 'saltwater',
    family: row.family,
    description: row.description,
    avgSize: { min: row.avgSizeMin, max: row.avgSizeMax },
    optimalTemp: { min: row.optimalTempMin, max: row.optimalTempMax },
    tips: row.tips,
    photoUri: row.photoUri,
  }));
}

export async function getCustomFishById(id: string): Promise<(FishSpecies & { photoUri?: string }) | null> {
  await createCustomFishTable();
  const database = await getDatabase();
  const row = await database.getFirstAsync<any>(
    'SELECT * FROM custom_fish WHERE id = ?',
    [id]
  );
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    scientificName: row.scientificName,
    category: row.category as 'freshwater' | 'saltwater',
    family: row.family,
    description: row.description,
    avgSize: { min: row.avgSizeMin, max: row.avgSizeMax },
    optimalTemp: { min: row.optimalTempMin, max: row.optimalTempMax },
    tips: row.tips,
    photoUri: row.photoUri,
  };
}

export async function deleteCustomFish(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM custom_fish WHERE id = ?', [id]);
}
