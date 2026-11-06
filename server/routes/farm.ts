import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// Farm config
router.get('/config', (_req, res) => {
  const rows = db.prepare('SELECT key, value FROM farm_config').all() as any[];
  const config: Record<string, string> = {};
  rows.forEach(r => { config[r.key] = r.value; });
  res.json(config);
});

router.put('/config', (req, res) => {
  const updates = req.body as Record<string, string>;
  const upsert = db.prepare('INSERT OR REPLACE INTO farm_config (key, value) VALUES (?, ?)');
  const tx = db.transaction(() => Object.entries(updates).forEach(([k, v]) => upsert.run(k, v)));
  tx();
  const rows = db.prepare('SELECT key, value FROM farm_config').all() as any[];
  const config: Record<string, string> = {};
  rows.forEach(r => { config[r.key] = r.value; });
  res.json(config);
});

// Kandang list
router.get('/kandang', (_req, res) => {
  const rows = db.prepare('SELECT * FROM kandang ORDER BY id').all();
  res.json(rows.map((r: any) => ({
    id: r.id,
    nama: r.nama,
    fase: r.fase,
    populasi: r.populasi,
    umurHari: r.umur_hari,
    bobotRataKg: r.bobot_rata_kg,
  })));
});

router.put('/kandang/:id', (req, res) => {
  const d = req.body;
  const existing = db.prepare('SELECT * FROM kandang WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: 'Not found' });
  db.prepare(`
    UPDATE kandang SET nama=?,fase=?,populasi=?,umur_hari=?,bobot_rata_kg=? WHERE id=?
  `).run(
    d.nama??existing.nama, d.fase??existing.fase,
    d.populasi??existing.populasi, d.umurHari??existing.umur_hari,
    d.bobotRataKg??existing.bobot_rata_kg, req.params.id
  );
  const row = db.prepare('SELECT * FROM kandang WHERE id = ?').get(req.params.id) as any;
  res.json({ id:row.id, nama:row.nama, fase:row.fase, populasi:row.populasi, umurHari:row.umur_hari, bobotRataKg:row.bobot_rata_kg });
});

// Sensor data
router.get('/sensor/latest', (_req, res) => {
  const row = db.prepare('SELECT * FROM sensor_data ORDER BY recorded_at DESC LIMIT 1').get() as any;
  if (!row) return res.json({ suhu:0, kelembaban:0, sisaPakanKg:0, targetFcr:0 });
  res.json({ suhu:row.suhu, kelembaban:row.kelembaban, sisaPakanKg:row.sisa_pakan_kg, targetFcr:row.target_fcr, recordedAt:row.recorded_at });
});

router.post('/sensor', (req, res) => {
  const d = req.body;
  db.prepare(`
    INSERT INTO sensor_data (kandang_id,suhu,kelembaban,sisa_pakan_kg,target_fcr)
    VALUES (?,?,?,?,?)
  `).run(d.kandangId||'all', d.suhu, d.kelembaban, d.sisaPakanKg, d.targetFcr);
  res.json({ success: true });
});

// Feed schedule
router.get('/feed-schedule', (_req, res) => {
  const rows = db.prepare('SELECT * FROM feed_schedule ORDER BY jam').all();
  res.json(rows.map((r: any) => ({
    id: r.id,
    jam: r.jam,
    label: r.label,
    porsiKg: r.porsi_kg,
    status: r.status,
    notes: r.notes,
  })));
});

router.put('/feed-schedule/:id', (req, res) => {
  const d = req.body;
  const existing = db.prepare('SELECT * FROM feed_schedule WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE feed_schedule SET jam=?,label=?,porsi_kg=?,status=?,notes=? WHERE id=?').run(
    d.jam??existing.jam, d.label??existing.label,
    d.porsiKg??existing.porsi_kg, d.status??existing.status,
    d.notes??existing.notes, req.params.id
  );
  const row = db.prepare('SELECT * FROM feed_schedule WHERE id = ?').get(req.params.id) as any;
  res.json({ id:row.id, jam:row.jam, label:row.label, porsiKg:row.porsi_kg, status:row.status, notes:row.notes });
});

export default router;

