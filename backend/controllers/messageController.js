const pool = require('../config/db');

// ── GET /api/messages/conversations ──────────────────────────────────────────
const getConversations = async (req, res, next) => {
  try {
    // Get latest message per unique conversation partner
    const { rows } = await pool.query(
      `SELECT DISTINCT ON (other_user)
         CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AS other_user,
         m.content       AS last_message,
         m.created_at    AS last_message_at,
         m.is_read,
         m.sender_id,
         u.name,
         u.avatar,
         u.college
       FROM messages m
       JOIN users u ON u.id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY other_user, m.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, conversations: rows });
  } catch (err) { next(err); }
};

// ── GET /api/messages/unread-count ────────────────────────────────────────────
const getUnreadCount = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = false',
      [req.user.id]
    );
    res.json({ success: true, count: parseInt(rows[0].count) });
  } catch (err) { next(err); }
};

// ── GET /api/messages/:userId ─────────────────────────────────────────────────
const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const { rows } = await pool.query(
      `SELECT m.*, u.name AS sender_name, u.avatar AS sender_avatar
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.created_at ASC`,
      [req.user.id, userId]
    );

    // Mark received messages as read
    await pool.query(
      'UPDATE messages SET is_read = true WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false',
      [userId, req.user.id]
    );

    res.json({ success: true, messages: rows });
  } catch (err) { next(err); }
};

// ── POST /api/messages ────────────────────────────────────────────────────────
const sendMessage = async (req, res, next) => {
  try {
    const { receiver_id, content } = req.body;

    if (receiver_id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot message yourself' });
    }

    const receiverR = await pool.query('SELECT id, name FROM users WHERE id = $1', [receiver_id]);
    if (receiverR.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    const { rows } = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [req.user.id, receiver_id, content.trim()]
    );

    const msg = { ...rows[0], sender_name: req.user.name, sender_avatar: req.user.avatar };
    res.status(201).json({ success: true, message: msg });
  } catch (err) { next(err); }
};

module.exports = { getConversations, getUnreadCount, getMessages, sendMessage };