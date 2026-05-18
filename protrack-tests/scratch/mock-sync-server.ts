import express from 'express';
const app = express();
app.use(express.json());

// Mock DB
const db = {
  logs: new Map(),
  sets: new Map()
};

app.post('/functions/v1/sync-workout', (req, res) => {
  const auth = req.headers.authorization;
  
  // Auth Check
  if (!auth || auth === 'Bearer undefined') {
    return res.status(400).json({ error: 'Unauthorized' });
  }

  const { logs = [], sets = [] } = req.body;
  let syncedCount = 0;

  // Simulate Log Upsert
  logs.forEach((log: any) => {
    db.logs.set(log.client_id, log);
    syncedCount++;
  });

  // Simulate Set Upsert
  sets.forEach((set: any) => {
    // Basic mapping validation
    if (db.logs.has(set.log_client_id)) {
      db.sets.set(set.client_id, set);
      syncedCount++;
    }
  });

  res.json({ synced: syncedCount, conflicts: [] });
});

const PORT = 54322;
app.listen(PORT, () => {
  console.log(`Mock Supabase Edge Functions running on http://localhost:${PORT}`);
});
