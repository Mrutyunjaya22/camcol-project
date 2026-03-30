const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

// ── POST /api/auth/register ──────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, college, city } = req.body;

    // Duplicate check
    const dup = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (dup.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, college, city)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, college, city, bio, avatar, skills, is_verified, rating, review_count, created_at`,
      [name.trim(), email.toLowerCase().trim(), hashed, college || null, city || null]
    );

    const user = rows[0];
    res.status(201).json({ success: true, token: signToken(user.id), user });
  } catch (err) { next(err); }
};

// ── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query(
      `SELECT id, name, email, password, college, city, bio, avatar, skills, is_verified, rating, review_count, created_at
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    const ok   = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const { password: _pw, ...safeUser } = user;
    res.json({ success: true, token: signToken(user.id), user: safeUser });
  } catch (err) { next(err); }
};

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, college, city, bio, avatar, skills, is_verified, rating, review_count, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: rows[0] });
  } catch (err) { next(err); }
};

// ── PUT /api/auth/profile ────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, college, city, bio, skills, avatar } = req.body;
    const { rows } = await pool.query(
      `UPDATE users
       SET name       = COALESCE($1, name),
           college    = COALESCE($2, college),
           city       = COALESCE($3, city),
           bio        = COALESCE($4, bio),
           skills     = COALESCE($5, skills),
           avatar     = COALESCE($6, avatar),
           updated_at = NOW()
       WHERE id = $7
       RETURNING id, name, email, college, city, bio, avatar, skills, is_verified, rating, review_count`,
      [name || null, college || null, city || null, bio || null, skills || null, avatar || null, req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) { next(err); }
};

// ── PUT /api/auth/password ───────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { rows } = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);

    const ok = await bcrypt.compare(currentPassword, rows[0].password);
    if (!ok) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password updated' });
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe, updateProfile, changePassword };