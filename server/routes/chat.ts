import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

function rowToMessage(row: any) {
  return {
    id: row.id,
    sender: row.sender,
    text: row.text,
    time: row.time_str,
    richCard: row.rich_card ? JSON.parse(row.rich_card) : undefined,
  };
}

// Get chat history for a session
router.get('/:sessionId', (req, res) => {
  const rows = db.prepare('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 100').all(req.params.sessionId);
  res.json(rows.map(rowToMessage));
});

// Save a message
router.post('/', (req, res) => {
  const d = req.body;
  const id = d.id || ('msg-' + Date.now() + '-' + Math.random().toString(36).slice(2,6));
  try {
    db.prepare(`
      INSERT INTO chat_messages (id,session_id,sender,text,time_str,rich_card)
      VALUES (?,?,?,?,?,?)
    `).run(id, d.sessionId||'default', d.sender, d.text, d.time, d.richCard ? JSON.stringify(d.richCard) : null);
    const row = db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(id);
    res.status(201).json(rowToMessage(row));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Clear session chat
router.delete('/:sessionId', (req, res) => {
  db.prepare('DELETE FROM chat_messages WHERE session_id = ?').run(req.params.sessionId);
  res.json({ success: true });
});

export default router;

