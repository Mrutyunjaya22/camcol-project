const pool = require('../config/db');

// ── POST /api/reviews ─────────────────────────────────────────────────────────
const createReview = async (req, res, next) => {
  try {
    const { order_id, rating, comment } = req.body;

    const orderR = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND status = $2',
      [order_id, 'completed']
    );
    if (orderR.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Can only review completed orders' });
    }
    const order = orderR.rows[0];
    if (order.buyer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the buyer can leave a review' });
    }

    const { rows } = await pool.query(
      `INSERT INTO reviews (reviewer_id, reviewee_id, gig_id, order_id, rating, comment)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [req.user.id, order.seller_id, order.gig_id, order_id, parseInt(rating), comment || null]
    );

    // Recalculate gig rating
    await pool.query(
      `UPDATE gigs SET
         rating       = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE gig_id    = $1),
         review_count = (SELECT COUNT(*)                  FROM reviews WHERE gig_id    = $1)
       WHERE id = $1`,
      [order.gig_id]
    );

    // Recalculate user rating
    await pool.query(
      `UPDATE users SET
         rating       = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviewee_id = $1),
         review_count = (SELECT COUNT(*)                  FROM reviews WHERE reviewee_id = $1)
       WHERE id = $1`,
      [order.seller_id]
    );

    res.status(201).json({ success: true, review: rows[0] });
  } catch (err) { next(err); }
};

// ── GET /api/reviews/user/:userId ─────────────────────────────────────────────
const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { rows } = await pool.query(
      `SELECT
         r.id, r.rating, r.comment, r.created_at,
         g.id    AS gig_id,
         g.title AS gig_title,
         u.id    AS reviewer_id,
         u.name  AS reviewer_name,
         u.avatar AS reviewer_avatar,
         u.college AS reviewer_college
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       LEFT JOIN gigs g ON g.id = r.gig_id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    res.json({ success: true, reviews: rows });
  } catch (err) { next(err); }
};

module.exports = { createReview, getUserReviews };