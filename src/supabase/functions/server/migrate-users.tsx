// Migration utility to fix corrupted user data
import * as kv from './kv_store.tsx';

export async function migrateUserData() {
  console.log('Starting user data migration...');
  
  try {
    // Get all user keys
    const allUserData = await kv.getByPrefix('user:');
    console.log('Found users:', allUserData.length);
    
    for (const userData of allUserData) {
      try {
        // Check if data is corrupted (has numeric keys)
        if (userData && typeof userData === 'object' && '0' in userData) {
          console.log('Found corrupted user data, attempting to fix...');
          
          // Try to reconstruct the JSON string from numeric keys
          const keys = Object.keys(userData).filter(k => !isNaN(Number(k))).sort((a, b) => Number(a) - Number(b));
          const jsonString = keys.map(k => userData[k]).join('');
          
          console.log('Reconstructed JSON string:', jsonString.substring(0, 100) + '...');
          
          // Parse the JSON
          const parsedData = JSON.parse(jsonString);
          console.log('Parsed data:', parsedData);
          
          // Check if there are newer fields (progress, last_activity) that were added correctly
          const progress = userData.progress || parsedData.progress || [];
          const lastActivity = userData.last_activity || parsedData.last_activity || new Date().toISOString();
          
          // Create clean user object
          const cleanData = {
            id: parsedData.id,
            name: parsedData.name,
            email: parsedData.email,
            project: parsedData.project || 'advent-calendar',
            progress: progress,
            created_at: parsedData.created_at,
            payment_status: parsedData.payment_status || 'pending',
            tier: parsedData.tier || 'basic',
            transaction_id: parsedData.transaction_id,
            payment_date: parsedData.payment_date,
            last_activity: lastActivity,
          };
          
          console.log('Clean data:', cleanData);
          
          // Save clean data
          await kv.set(`user:${parsedData.id}`, cleanData);
          console.log('✅ Successfully migrated user:', parsedData.email);
        } else {
          console.log('User data looks OK, skipping:', userData?.email || 'unknown');
        }
      } catch (err) {
        console.error('Error migrating user:', err);
      }
    }
    
    console.log('✅ Migration completed!');
    return { success: true, message: 'Migration completed' };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error: error.message };
  }
}
