import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// Map DB row to frontend Ingredient shape
function rowToIngredient(row: any) {
  return {
    id: row.id,
    name: row.name,
    subname: row.subname,
    category: row.category,
    defaultPrice: row.default_price,
    currentPrice: row.current_price,
    protein: row.protein,
    energy: row.energy,
    fat: row.fat,
    fiber: row.fiber,
    pati: row.pati,
    moisture: row.moisture,
    dryMatter: row.dry_matter,
    ash: row.ash,
    calcium: row.calcium,
    phosphorus: row.phosphorus,
    phosAvailable: row.phos_available,
    sodium: row.sodium,
    chloride: row.chloride,
    lysine: row.lysine,
    methionine: row.methionine,
    metCys: row.met_cys,
    threonine: row.threonine,
    tryptophan: row.tryptophan,
    arginine: row.arginine,
    isoleucine: row.isoleucine,
    valine: row.valine,
    choline: row.choline,
    minConstraint: row.min_constraint,
    maxConstraint: row.max_constraint,
    hasConstraint: Boolean(row.has_constraint),
    isFixed: Boolean(row.is_fixed),
    fixedPercent: row.fixed_percent,
    icon: row.icon,
    selected: Boolean(row.selected),
    inStockKg: row.in_stock_kg,
    tag1: row.tag1,
    tag2: row.tag2,
  };
}

// GET all ingredients
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM ingredients ORDER BY category, name').all();
  res.json(rows.map(rowToIngredient));
});

// GET single ingredient
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(rowToIngredient(row));
});

// POST create new ingredient
router.post('/', (req, res) => {
  const d = req.body;
  const id = d.id || ('custom-' + Date.now());
  try {
    db.prepare(`
      INSERT INTO ingredients (
        id, name, subname, category, default_price, current_price,
        protein, energy, fat, fiber, pati, moisture, dry_matter, ash,
        calcium, phosphorus, phos_available, sodium, chloride,
        lysine, methionine, met_cys, threonine, tryptophan, arginine, isoleucine, valine, choline,
        min_constraint, max_constraint, has_constraint, is_fixed, fixed_percent,
        icon, selected, in_stock_kg, tag1, tag2
      ) VALUES (
        ?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,?
      )
    `).run(
      id, d.name, d.subname || '', d.category, d.defaultPrice || 0, d.currentPrice || 0,
      d.protein || 0, d.energy || 0, d.fat ?? 0, d.fiber ?? 0, d.pati ?? 0, d.moisture ?? 0, d.dryMatter ?? 0, d.ash ?? 0,
      d.calcium || 0, d.phosphorus || 0, d.phosAvailable ?? 0, d.sodium ?? 0, d.chloride ?? 0,
      d.lysine ?? 0, d.methionine ?? 0, d.metCys ?? 0, d.threonine ?? 0, d.tryptophan ?? 0, d.arginine ?? 0, d.isoleucine ?? 0, d.valine ?? 0, d.choline ?? 0,
      d.minConstraint || 0, d.maxConstraint || 100, d.hasConstraint ? 1 : 0, d.isFixed ? 1 : 0, d.fixedPercent ?? null,
      d.icon || 'grass', d.selected ? 1 : 0, d.inStockKg || 0, d.tag1 || null, d.tag2 || null
    );
    const row = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(id);
    res.status(201).json(rowToIngredient(row));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// PUT update ingredient
router.put('/:id', (req, res) => {
  const d = req.body;
  const existing = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: 'Not found' });

  db.prepare(`
    UPDATE ingredients SET
      name = ?, subname = ?, category = ?,
      current_price = ?, protein = ?, energy = ?, fat = ?, fiber = ?, pati = ?, moisture = ?, dry_matter = ?, ash = ?,
      calcium = ?, phosphorus = ?, phos_available = ?, sodium = ?, chloride = ?,
      lysine = ?, methionine = ?, met_cys = ?, threonine = ?, tryptophan = ?, arginine = ?, isoleucine = ?, valine = ?, choline = ?,
      min_constraint = ?, max_constraint = ?, has_constraint = ?,
      is_fixed = ?, fixed_percent = ?,
      icon = ?, selected = ?, in_stock_kg = ?, tag1 = ?, tag2 = ?
    WHERE id = ?
  `).run(
    d.name ?? existing.name,
    d.subname ?? existing.subname,
    d.category ?? existing.category,
    d.currentPrice ?? existing.current_price,
    d.protein ?? existing.protein,
    d.energy ?? existing.energy,
    d.fat ?? existing.fat,
    d.fiber ?? existing.fiber,
    d.pati ?? existing.pati,
    d.moisture ?? existing.moisture,
    d.dryMatter ?? existing.dry_matter,
    d.ash ?? existing.ash,
    d.calcium ?? existing.calcium,
    d.phosphorus ?? existing.phosphorus,
    d.phosAvailable ?? existing.phos_available,
    d.sodium ?? existing.sodium,
    d.chloride ?? existing.chloride,
    d.lysine ?? existing.lysine,
    d.methionine ?? existing.methionine,
    d.metCys ?? existing.met_cys,
    d.threonine ?? existing.threonine,
    d.tryptophan ?? existing.tryptophan,
    d.arginine ?? existing.arginine,
    d.isoleucine ?? existing.isoleucine,
    d.valine ?? existing.valine,
    d.choline ?? existing.choline,
    d.minConstraint ?? existing.min_constraint,
    d.maxConstraint ?? existing.max_constraint,
    d.hasConstraint !== undefined ? (d.hasConstraint ? 1 : 0) : existing.has_constraint,
    d.isFixed !== undefined ? (d.isFixed ? 1 : 0) : existing.is_fixed,
    d.fixedPercent ?? existing.fixed_percent,
    d.icon ?? existing.icon,
    d.selected !== undefined ? (d.selected ? 1 : 0) : existing.selected,
    d.inStockKg ?? existing.in_stock_kg,
    d.tag1 ?? existing.tag1,
    d.tag2 ?? existing.tag2,
    req.params.id
  );
  const row = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(req.params.id);
  res.json(rowToIngredient(row));
});

// DELETE ingredient
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM ingredients WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

export default router;
