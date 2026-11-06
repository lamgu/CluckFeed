import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

function rowToPreset(row: any) {
  return {
    id: row.id,
    title: row.title,
    phase: row.phase,
    category: row.category,
    standardBadge: row.standard_badge,
    pk: row.pk,
    em: row.em,
    ca: row.ca,
    note: row.note,
    icon: row.icon,
    isCustom: Boolean(row.is_custom),
    isFavorite: Boolean(row.is_favorite),
  };
}

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM presets ORDER BY is_custom ASC, created_at DESC').all();
  res.json(rows.map(rowToPreset));
});

router.post('/', (req, res) => {
  const d = req.body;
  const id = 'p-' + Date.now();
  try {
    db.prepare(`
      INSERT INTO presets (id,title,phase,category,standard_badge,pk,em,ca,note,icon,is_custom,is_favorite)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(id, d.title, d.phase||'', d.category||'custom', d.standardBadge||'Custom Peternak',
           d.pk||'', d.em||'', d.ca||'', d.note||'', d.icon||'star', 1, 0);
    const row = db.prepare('SELECT * FROM presets WHERE id = ?').get(id);
    res.status(201).json(rowToPreset(row));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  const d = req.body;
  const existing = db.prepare('SELECT * FROM presets WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: 'Not found' });
  db.prepare(`
    UPDATE presets SET title=?,phase=?,category=?,standard_badge=?,pk=?,em=?,ca=?,note=?,icon=?,is_favorite=?
    WHERE id=?
  `).run(
    d.title??existing.title, d.phase??existing.phase, d.category??existing.category,
    d.standardBadge??existing.standard_badge, d.pk??existing.pk, d.em??existing.em, d.ca??existing.ca,
    d.note??existing.note, d.icon??existing.icon,
    d.isFavorite!==undefined?(d.isFavorite?1:0):existing.is_favorite,
    req.params.id
  );
  const row = db.prepare('SELECT * FROM presets WHERE id = ?').get(req.params.id);
  res.json(rowToPreset(row));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM presets WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

export default router;

