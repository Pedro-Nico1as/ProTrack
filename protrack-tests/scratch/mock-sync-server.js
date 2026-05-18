const express = require('express');
const app = express();
app.use(express.json());

const db = {
  logs: new Map(),
  sets: new Map()
};

app.post('/functions/v1/sync-workout', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || auth === 'Bearer undefined') {
    return res.status(400).json({ error: 'Unauthorized' });
  }

  const { logs = [], sets = [] } = req.body;
  let syncedCount = 0;

  logs.forEach((log) => {
    db.logs.set(log.client_id, log);
    syncedCount++;
  });

  sets.forEach((set) => {
    if (db.logs.has(set.log_client_id)) {
      db.sets.set(set.client_id, set);
      syncedCount++;
    }
  });

  res.json({ synced: syncedCount, conflicts: [] });
});

const PORT = 54322;
app.listen(PORT, () => {
  console.log(`Mock Sync Server running on port ${PORT}`);
});
