import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

function rowToHistory(row: any) {
  return {
    id: row.id,
    title: row.title,
    batchInfo: row.batch_info,
    timeStr: row.time_str,
    status: row.status,
    statusLabel: row.status_label,
    pills: JSON.parse(row.pills || '[]'),
    totalWeight: row.total_weight,
    costPerKg: row.cost_per_kg,
    totalCost: row.total_cost,
    icon: row.icon,
    category: row.category,
    correctionAlert: row.correction_alert,
  };
}

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM formula_history ORDER BY created_at DESC').all();
  res.json(rows.map(rowToHistory));
});

router.post('/', (req, res) => {
  const d = req.body;
  const id = d.id || ('hist-' + Date.now());
  try {
    db.prepare(`
      INSERT INTO formula_history (id,title,batch_info,time_str,status,status_label,pills,total_weight,cost_per_kg,total_cost,icon,category,correction_alert)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(id, d.title, d.batchInfo, d.timeStr, d.status, d.statusLabel,
           JSON.stringify(d.pills||[]), d.totalWeight, d.costPerKg, d.totalCost,
           d.icon||'grain', d.category, d.correctionAlert||null);
    const row = db.prepare('SELECT * FROM formula_history WHERE id = ?').get(id);
    res.status(201).json(rowToHistory(row));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  const d = req.body;
  const existing = db.prepare('SELECT * FROM formula_history WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const title = d.title ?? existing.title;
  const batchInfo = d.batchInfo ?? existing.batch_info;
  const timeStr = d.timeStr ?? existing.time_str;
  const status = d.status ?? existing.status;
  const statusLabel = d.statusLabel ?? existing.status_label;
  const pills = d.pills ? JSON.stringify(d.pills) : existing.pills;
  const totalWeight = d.totalWeight ?? existing.total_weight;
  const costPerKg = d.costPerKg ?? existing.cost_per_kg;
  const totalCost = d.totalCost ?? (totalWeight * costPerKg);
  const icon = d.icon ?? existing.icon;
  const category = d.category ?? existing.category;
  const correctionAlert = d.correctionAlert !== undefined ? d.correctionAlert : existing.correction_alert;

  db.prepare(`
    UPDATE formula_history SET
      title = ?, batch_info = ?, time_str = ?, status = ?, status_label = ?,
      pills = ?, total_weight = ?, cost_per_kg = ?, total_cost = ?,
      icon = ?, category = ?, correction_alert = ?
    WHERE id = ?
  `).run(
    title, batchInfo, timeStr, status, statusLabel,
    pills, totalWeight, costPerKg, totalCost,
    icon, category, correctionAlert, req.params.id
  );

  const row = db.prepare('SELECT * FROM formula_history WHERE id = ?').get(req.params.id);
  res.json(rowToHistory(row));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM formula_history WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

export default router;

