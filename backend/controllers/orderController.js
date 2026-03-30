const pool = require('../config/db');

// ── POST /api/orders ─────────────────────────────────────────────────────────
const createOrder = async (req, res, next) => {
  try {
    const { gig_id, requirements } = req.body;

    const gigR = await pool.query(
      'SELECT id, user_id, price, delivery_days FROM gigs WHERE id = $1 AND is_active = true',
      [gig_id]
    );
    if (gigR.rows.length === 0) return res.status(404).json({ success: false, message: 'Gig not found or inactive' });

    const gig = gigR.rows[0];
    if (gig.user_id === req.user.id) return res.status(400).json({ success: false, message: 'Cannot order your own gig' });

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (gig.delivery_days || 3));

    const { rows } = await pool.query(
      `INSERT INTO orders (gig_id, buyer_id, seller_id, amount, requirements, delivery_date)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [gig_id, req.user.id, gig.user_id, gig.price, requirements || null, deliveryDate]
    );

    await pool.query('UPDATE gigs SET order_count = order_count + 1 WHERE id = $1', [gig_id]);

    res.status(201).json({ success: true, order: rows[0] });
  } catch (err) { next(err); }
};

// ── GET /api/orders ──────────────────────────────────────────────────────────
const getMyOrders = async (req, res, next) => {
  try {
    const { type = 'buying' } = req.query;
    const col  = type === 'selling' ? 'o.seller_id' : 'o.buyer_id';

    const { rows } = await pool.query(
      `SELECT
         o.*,
         g.title   AS gig_title,
         g.images  AS gig_images,
         buyer.name   AS buyer_name,
         buyer.avatar AS buyer_avatar,
         seller.name   AS seller_name,
         seller.avatar AS seller_avatar
       FROM orders o
       JOIN gigs  g      ON g.id  = o.gig_id
       JOIN users buyer  ON buyer.id  = o.buyer_id
       JOIN users seller ON seller.id = o.seller_id
       WHERE ${col} = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, orders: rows });
  } catch (err) { next(err); }
};

// ── GET /api/orders/:id ──────────────────────────────────────────────────────
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT
         o.*,
         g.title       AS gig_title,
         g.description AS gig_description,
         g.images      AS gig_images,
         buyer.name    AS buyer_name,
         buyer.avatar  AS buyer_avatar,
         buyer.email   AS buyer_email,
         seller.name   AS seller_name,
         seller.avatar AS seller_avatar,
         seller.email  AS seller_email
       FROM orders o
       JOIN gigs  g      ON g.id       = o.gig_id
       JOIN users buyer  ON buyer.id   = o.buyer_id
       JOIN users seller ON seller.id  = o.seller_id
       WHERE o.id = $1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });

    const order = rows[0];
    if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// ── PUT /api/orders/:id/status ───────────────────────────────────────────────
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const orderR = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderR.rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });

    const order = orderR.rows[0];
    const isSeller = order.seller_id === req.user.id;
    const isBuyer  = order.buyer_id  === req.user.id;
    if (!isSeller && !isBuyer) return res.status(403).json({ success: false, message: 'Forbidden' });

    // Allowed transitions
    const allowed = {
      seller: { pending: ['active', 'cancelled'], active: ['completed', 'cancelled'] },
      buyer:  { pending: ['cancelled'],           active:  ['disputed'] },
    };
    const role     = isSeller ? 'seller' : 'buyer';
    const possible = allowed[role][order.status] || [];
    if (!possible.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move order from '${order.status}' to '${status}'`,
      });
    }

    const { rows } = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json({ success: true, order: rows[0] });
  } catch (err) { next(err); }
};

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderStatus };