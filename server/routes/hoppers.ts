import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

function rowToHopper(row: any) {
  return {
    id: row.id,
    name: row.name,
    ingredientName: row.ingredient_name,
    targetKg: row.target_kg,
    currentKg: row.current_kg,
    status: row.status,
    icon: row.icon,
  };
}

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM hoppers ORDER BY id').all();
  res.json(rows.map(rowToHopper));
});

router.put('/:id', (req, res) => {
  const d = req.body;
  const existing = db.prepare('SELECT * FROM hoppers WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: 'Not found' });
  db.prepare(`
    UPDATE hoppers SET name=?,ingredient_name=?,target_kg=?,current_kg=?,status=?,icon=? WHERE id=?
  `).run(
    d.name??existing.name, d.ingredientName??existing.ingredient_name,
    d.targetKg??existing.target_kg, d.currentKg??existing.current_kg,
    d.status??existing.status, d.icon??existing.icon,
    req.params.id
  );
  const row = db.prepare('SELECT * FROM hoppers WHERE id = ?').get(req.params.id);
  res.json(rowToHopper(row));
});

// Reset / provision hoppers for a new batch
router.post('/provision', (req, res) => {
  const { hoppers } = req.body as { hoppers: { id: number; ingredientName: string; targetKg: number; icon: string }[] };
  if (!hoppers || !Array.isArray(hoppers)) return res.status(400).json({ error: 'hoppers array required' });

  const update = db.prepare(`
    UPDATE hoppers SET ingredient_name=?,target_kg=?,current_kg=0,status='antrean',icon=? WHERE id=?
  `);
  const tx = db.transaction(() => hoppers.forEach(h => update.run(h.ingredientName, h.targetKg, h.icon, h.id)));
  tx();
  const rows = db.prepare('SELECT * FROM hoppers ORDER BY id').all();
  res.json(rows.map(rowToHopper));
});

export default router;

