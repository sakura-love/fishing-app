import { getDatabase } from './storage';

export interface UserProfile {
  id: string;
  nickname: string;
  avatarUri?: string;
  updatedAt: string;
}

export async function createUserProfileTable(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY,
      nickname TEXT NOT NULL DEFAULT '钓鱼人',
      avatarUri TEXT,
      updatedAt TEXT DEFAULT (datetime('now'))
    );
    
    INSERT OR IGNORE INTO user_profile (id, nickname) VALUES ('default', '钓鱼人');
  `);
}

export async function getUserProfile(): Promise<UserProfile> {
  await createUserProfileTable();
  const database = await getDatabase();
  const row = await database.getFirstAsync<any>(
    'SELECT * FROM user_profile WHERE id = ?',
    ['default']
  );
  return {
    id: row?.id || 'default',
    nickname: row?.nickname || '钓鱼人',
    avatarUri: row?.avatarUri,
    updatedAt: row?.updatedAt || new Date().toISOString(),
  };
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
  await createUserProfileTable();
  const database = await getDatabase();
  
  const currentProfile = await getUserProfile();
  
  await database.runAsync(
    `UPDATE user_profile SET 
      nickname = ?, 
      avatarUri = ?, 
      updatedAt = datetime('now')
    WHERE id = ?`,
    [
      profile.nickname || currentProfile.nickname,
      (profile.avatarUri !== undefined ? profile.avatarUri : currentProfile.avatarUri) ?? null,
      'default',
    ]
  );
}
