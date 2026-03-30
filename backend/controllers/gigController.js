const pool = require('../config/db');

// ── GET /api/gigs ────────────────────────────────────────────────────────────
const getGigs = async (req, res, next) => {
  try {
    const {
      search, category, minPrice, maxPrice,
      sort = 'newest', page = 1, limit = 12,
    } = req.query;

    const conditions = ['g.is_active = true'];
    const values     = [];
    let   i          = 1;

    if (search) {
      conditions.push(`(g.title ILIKE $${i} OR g.description ILIKE $${i} OR $${i} ILIKE ANY(g.tags))`);
      values.push(`%${search}%`); i++;
    }
    if (category) {
      conditions.push(`g.category = $${i}`);
      values.push(category); i++;
    }
    if (minPrice) {
      conditions.push(`g.price >= $${i}`);
      values.push(parseFloat(minPrice)); i++;
    }
    if (maxPrice) {
      conditions.push(`g.price <= $${i}`);
      values.push(parseFloat(maxPrice)); i++;
    }

    const orderMap = {
      newest:     'g.created_at DESC',
      oldest:     'g.created_at ASC',
      price_asc:  'g.price ASC',
      price_desc: 'g.price DESC',
      rating:     'g.rating DESC',
      popular:    'g.order_count DESC',
    };
    const orderBy = orderMap[sort] || 'g.created_at DESC';
    const where   = `WHERE ${conditions.join(' AND ')}`;
    const offset  = (parseInt(page) - 1) * parseInt(limit);

    const dataQ = `
      SELECT
        g.id, g.title, g.description, g.category, g.price, g.price_type,
        g.delivery_days, g.tags, g.images, g.rating, g.review_count, g.order_count, g.created_at,
        u.id   AS seller_id,
        u.name AS seller_name,
        u.avatar AS seller_avatar,
        u.college AS seller_college,
        u.is_verified AS seller_verified
      FROM gigs g
      JOIN users u ON u.id = g.user_id
      ${where}
      ORDER BY ${orderBy}
      LIMIT $${i} OFFSET $${i + 1}
    `;
    values.push(parseInt(limit), offset);

    const countQ = `SELECT COUNT(*) FROM gigs g JOIN users u ON u.id = g.user_id ${where}`;

    const [dataR, countR] = await Promise.all([
      pool.query(dataQ, values),
      pool.query(countQ, values.slice(0, -2)),
    ]);

    const total = parseInt(countR.rows[0].count);
    res.json({
      success: true,
      gigs:    dataR.rows,
      total,
      page:    parseInt(page),
      pages:   Math.ceil(total / parseInt(limit)),
    });
  } catch (err) { next(err); }
};

// ── GET /api/gigs/categories ─────────────────────────────────────────────────
const getCategories = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT category, COUNT(*) AS count
       FROM gigs WHERE is_active = true
       GROUP BY category ORDER BY count DESC`
    );
    res.json({ success: true, categories: rows });
  } catch (err) { next(err); }
};

// ── GET /api/gigs/my ─────────────────────────────────────────────────────────
const getMyGigs = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM gigs WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, gigs: rows });
  } catch (err) { next(err); }
};

// ── GET /api/gigs/saved ──────────────────────────────────────────────────────
const getSavedGigs = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT g.id, g.title, g.category, g.price, g.price_type, g.rating, g.images, g.created_at,
              u.name AS seller_name, u.avatar AS seller_avatar, sg.saved_at
       FROM saved_gigs sg
       JOIN gigs  g ON g.id = sg.gig_id
       JOIN users u ON u.id = g.user_id
       WHERE sg.user_id = $1
       ORDER BY sg.saved_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, gigs: rows });
  } catch (err) { next(err); }
};

// ── GET /api/gigs/:id ────────────────────────────────────────────────────────
const getGigById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const gigR = await pool.query(
      `SELECT
         g.*,
         u.id           AS seller_id,
         u.name         AS seller_name,
         u.avatar       AS seller_avatar,
         u.college      AS seller_college,
         u.city         AS seller_city,
         u.bio          AS seller_bio,
         u.skills       AS seller_skills,
         u.is_verified  AS seller_verified,
         u.rating       AS seller_rating,
         u.review_count AS seller_review_count
       FROM gigs g
       JOIN users u ON u.id = g.user_id
       WHERE g.id = $1`,
      [id]
    );
    if (gigR.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    const reviewsR = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.id AS reviewer_id, u.name AS reviewer_name,
              u.avatar AS reviewer_avatar, u.college AS reviewer_college
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE r.gig_id = $1
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [id]
    );

    let isSaved = false;
    if (req.user) {
      const sv = await pool.query(
        'SELECT 1 FROM saved_gigs WHERE user_id = $1 AND gig_id = $2',
        [req.user.id, id]
      );
      isSaved = sv.rows.length > 0;
    }

    res.json({ success: true, gig: gigR.rows[0], reviews: reviewsR.rows, isSaved });
  } catch (err) { next(err); }
};

// ── POST /api/gigs ───────────────────────────────────────────────────────────
const createGig = async (req, res, next) => {
  try {
    const { title, description, category, price, price_type, delivery_days, tags, images } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO gigs (user_id, title, description, category, price, price_type, delivery_days, tags, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        req.user.id, title, description, category,
        parseFloat(price), price_type || 'fixed', parseInt(delivery_days) || 3,
        tags || [], images || [],
      ]
    );
    res.status(201).json({ success: true, gig: rows[0] });
  } catch (err) { next(err); }
};

// ── PUT /api/gigs/:id ────────────────────────────────────────────────────────
const updateGig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const check  = await pool.query('SELECT user_id FROM gigs WHERE id = $1', [id]);
    if (check.rows.length === 0)            return res.status(404).json({ success: false, message: 'Gig not found' });
    if (check.rows[0].user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });

    const { title, description, category, price, price_type, delivery_days, tags, images, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE gigs SET
         title         = COALESCE($1,  title),
         description   = COALESCE($2,  description),
         category      = COALESCE($3,  category),
         price         = COALESCE($4,  price),
         price_type    = COALESCE($5,  price_type),
         delivery_days = COALESCE($6,  delivery_days),
         tags          = COALESCE($7,  tags),
         images        = COALESCE($8,  images),
         is_active     = COALESCE($9,  is_active),
         updated_at    = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        title || null, description || null, category || null,
        price != null ? parseFloat(price) : null,
        price_type || null,
        delivery_days != null ? parseInt(delivery_days) : null,
        tags || null, images || null,
        is_active != null ? is_active : null,
        id,
      ]
    );
    res.json({ success: true, gig: rows[0] });
  } catch (err) { next(err); }
};

// ── DELETE /api/gigs/:id ─────────────────────────────────────────────────────
const deleteGig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const check  = await pool.query('SELECT user_id FROM gigs WHERE id = $1', [id]);
    if (check.rows.length === 0)              return res.status(404).json({ success: false, message: 'Gig not found' });
    if (check.rows[0].user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });
    await pool.query('DELETE FROM gigs WHERE id = $1', [id]);
    res.json({ success: true, message: 'Gig deleted' });
  } catch (err) { next(err); }
};

// ── POST /api/gigs/:id/save ──────────────────────────────────────────────────
const toggleSaveGig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sv = await pool.query(
      'SELECT 1 FROM saved_gigs WHERE user_id = $1 AND gig_id = $2',
      [req.user.id, id]
    );
    if (sv.rows.length > 0) {
      await pool.query('DELETE FROM saved_gigs WHERE user_id = $1 AND gig_id = $2', [req.user.id, id]);
      return res.json({ success: true, saved: false });
    }
    await pool.query('INSERT INTO saved_gigs (user_id, gig_id) VALUES ($1, $2)', [req.user.id, id]);
    res.json({ success: true, saved: true });
  } catch (err) { next(err); }
};

module.exports = {
  getGigs, getCategories, getMyGigs, getSavedGigs,
  getGigById, createGig, updateGig, deleteGig, toggleSaveGig,
};