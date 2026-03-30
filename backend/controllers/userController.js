const pool = require('../config/db');

// ── GET /api/users ─────────────────────────────────────────────────────────
const searchUsers = async (req, res, next) => {
  try {
    const { search, skill, city, college, page = 1, limit = 12 } = req.query;
    const conditions = [];
    const values     = [];
    let   i          = 1;

    if (search)  { conditions.push(`(name ILIKE $${i} OR bio ILIKE $${i})`); values.push(`%${search}%`); i++; }
    if (skill)   { conditions.push(`$${i} = ANY(skills)`); values.push(skill); i++; }
    if (city)    { conditions.push(`city ILIKE $${i}`);    values.push(`%${city}%`); i++; }
    if (college) { conditions.push(`college ILIKE $${i}`); values.push(`%${college}%`); i++; }

    const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const dataQ  = `SELECT id, name, college, city, bio, avatar, skills, is_verified, rating, review_count
                    FROM users ${where}
                    ORDER BY rating DESC, review_count DESC
                    LIMIT $${i} OFFSET $${i + 1}`;
    values.push(parseInt(limit), offset);

    const countQ = `SELECT COUNT(*) FROM users ${where}`;

    const [dataR, countR] = await Promise.all([
      pool.query(dataQ, values),
      pool.query(countQ, values.slice(0, -2)),
    ]);

    const total = parseInt(countR.rows[0].count);
    res.json({
      success: true,
      users: dataR.rows,
      total,
      page:  parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) { next(err); }
};

// ── GET /api/users/:id ─────────────────────────────────────────────────────
const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const userR = await pool.query(
      `SELECT id, name, college, city, bio, avatar, skills, is_verified, rating, review_count, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    if (userR.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    const gigsR = await pool.query(
      `SELECT id, title, category, price, price_type, rating, review_count, images, created_at
       FROM gigs WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 6`,
      [id]
    );

    const reviewsR = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.id AS reviewer_id, u.name AS reviewer_name,
              u.avatar AS reviewer_avatar, u.college AS reviewer_college
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC LIMIT 10`,
      [id]
    );

    res.json({ success: true, user: userR.rows[0], gigs: gigsR.rows, reviews: reviewsR.rows });
  } catch (err) { next(err); }
};

module.exports = { searchUsers, getUserProfile };