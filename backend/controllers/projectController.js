const pool = require('../config/db');

// ── GET /api/projects ────────────────────────────────────────────────────────
const getProjects = async (req, res, next) => {
  try {
    const { search, category, status, is_paid, skill, page = 1, limit = 12 } = req.query;

    const conditions = [];
    const values     = [];
    let   i          = 1;

    if (status) { conditions.push(`p.status = $${i}`); values.push(status); i++; }
    if (search) { conditions.push(`(p.title ILIKE $${i} OR p.description ILIKE $${i})`); values.push(`%${search}%`); i++; }
    if (category) { conditions.push(`p.category = $${i}`); values.push(category); i++; }
    if (is_paid !== undefined && is_paid !== '') { conditions.push(`p.is_paid = $${i}`); values.push(is_paid === 'true'); i++; }
    if (skill) { conditions.push(`$${i} = ANY(p.required_skills)`); values.push(skill); i++; }

    const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const dataQ = `
      SELECT
        p.*,
        u.name       AS owner_name,
        u.avatar     AS owner_avatar,
        u.college    AS owner_college,
        u.is_verified AS owner_verified,
        (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id AND pm.status = 'accepted') AS member_count
      FROM projects p
      JOIN users u ON u.id = p.owner_id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;
    values.push(parseInt(limit), offset);

    const countQ = `SELECT COUNT(*) FROM projects p JOIN users u ON u.id = p.owner_id ${where}`;

    const [dataR, countR] = await Promise.all([
      pool.query(dataQ, values),
      pool.query(countQ, values.slice(0, -2)),
    ]);

    const total = parseInt(countR.rows[0].count);
    res.json({
      success: true,
      projects: dataR.rows,
      total,
      page:  parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) { next(err); }
};

// ── GET /api/projects/my ─────────────────────────────────────────────────────
const getMyProjects = async (req, res, next) => {
  try {
    const owned = await pool.query(
      `SELECT p.*,
              (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id AND pm.status = 'pending') AS pending_count
       FROM projects p WHERE p.owner_id = $1 ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    const applied = await pool.query(
      `SELECT p.*, pm.status AS application_status, pm.applied_at,
              u.name AS owner_name, u.avatar AS owner_avatar
       FROM project_members pm
       JOIN projects p ON p.id = pm.project_id
       JOIN users    u ON u.id = p.owner_id
       WHERE pm.user_id = $1
       ORDER BY pm.applied_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, owned: owned.rows, applied: applied.rows });
  } catch (err) { next(err); }
};

// ── GET /api/projects/:id ────────────────────────────────────────────────────
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const projR = await pool.query(
      `SELECT
         p.*,
         u.id          AS owner_id,
         u.name        AS owner_name,
         u.avatar      AS owner_avatar,
         u.college     AS owner_college,
         u.city        AS owner_city,
         u.is_verified AS owner_verified,
         u.rating      AS owner_rating
       FROM projects p
       JOIN users u ON u.id = p.owner_id
       WHERE p.id = $1`,
      [id]
    );
    if (projR.rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });

    const membersR = await pool.query(
      `SELECT pm.role, pm.status, pm.applied_at,
              u.id, u.name, u.avatar, u.college, u.skills
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1 AND pm.status = 'accepted'`,
      [id]
    );

    let userApplication = null;
    if (req.user) {
      const appR = await pool.query(
        'SELECT status, role, applied_at FROM project_members WHERE project_id = $1 AND user_id = $2',
        [id, req.user.id]
      );
      if (appR.rows.length > 0) userApplication = appR.rows[0];
    }

    res.json({ success: true, project: projR.rows[0], members: membersR.rows, userApplication });
  } catch (err) { next(err); }
};

// ── GET /api/projects/:id/applicants ─────────────────────────────────────────
const getApplicants = async (req, res, next) => {
  try {
    const { id } = req.params;
    const check  = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [id]);
    if (check.rows.length === 0)              return res.status(404).json({ success: false, message: 'Project not found' });
    if (check.rows[0].owner_id !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });

    const { rows } = await pool.query(
      `SELECT pm.status, pm.role, pm.applied_at,
              u.id, u.name, u.avatar, u.college, u.city, u.skills, u.rating, u.review_count
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1
       ORDER BY pm.applied_at ASC`,
      [id]
    );
    res.json({ success: true, applicants: rows });
  } catch (err) { next(err); }
};

// ── POST /api/projects ───────────────────────────────────────────────────────
const createProject = async (req, res, next) => {
  try {
    const { title, description, category, required_skills, team_size, duration, is_paid, budget, college_only } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO projects (owner_id, title, description, category, required_skills, team_size, duration, is_paid, budget, college_only)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        req.user.id, title, description, category,
        required_skills || [],
        parseInt(team_size) || 2,
        duration || null,
        is_paid === true || is_paid === 'true',
        budget ? parseFloat(budget) : null,
        college_only === true || college_only === 'true',
      ]
    );
    res.status(201).json({ success: true, project: rows[0] });
  } catch (err) { next(err); }
};

// ── PUT /api/projects/:id ────────────────────────────────────────────────────
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const check  = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [id]);
    if (check.rows.length === 0)              return res.status(404).json({ success: false, message: 'Project not found' });
    if (check.rows[0].owner_id !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });

    const { title, description, category, required_skills, team_size, duration, is_paid, budget, college_only, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE projects SET
         title           = COALESCE($1,  title),
         description     = COALESCE($2,  description),
         category        = COALESCE($3,  category),
         required_skills = COALESCE($4,  required_skills),
         team_size       = COALESCE($5,  team_size),
         duration        = COALESCE($6,  duration),
         is_paid         = COALESCE($7,  is_paid),
         budget          = COALESCE($8,  budget),
         college_only    = COALESCE($9,  college_only),
         status          = COALESCE($10, status),
         updated_at      = NOW()
       WHERE id = $11 RETURNING *`,
      [
        title || null, description || null, category || null,
        required_skills || null,
        team_size != null ? parseInt(team_size) : null,
        duration || null,
        is_paid != null ? (is_paid === true || is_paid === 'true') : null,
        budget ? parseFloat(budget) : null,
        college_only != null ? (college_only === true || college_only === 'true') : null,
        status || null,
        id,
      ]
    );
    res.json({ success: true, project: rows[0] });
  } catch (err) { next(err); }
};

// ── DELETE /api/projects/:id ─────────────────────────────────────────────────
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const check  = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [id]);
    if (check.rows.length === 0)              return res.status(404).json({ success: false, message: 'Project not found' });
    if (check.rows[0].owner_id !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
};

// ── POST /api/projects/:id/apply ─────────────────────────────────────────────
const applyToProject = async (req, res, next) => {
  try {
    const { id }   = req.params;
    const { role } = req.body;

    const proj = await pool.query('SELECT owner_id, status FROM projects WHERE id = $1', [id]);
    if (proj.rows.length === 0)               return res.status(404).json({ success: false, message: 'Project not found' });
    if (proj.rows[0].owner_id === req.user.id) return res.status(400).json({ success: false, message: 'Cannot apply to your own project' });
    if (proj.rows[0].status   !== 'open')      return res.status(400).json({ success: false, message: 'Project is not accepting applications' });

    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, user_id) DO UPDATE SET role = $3, status = 'pending'`,
      [id, req.user.id, role || null]
    );
    res.json({ success: true, message: 'Application submitted' });
  } catch (err) { next(err); }
};

// ── PUT /api/projects/:id/members/:userId ────────────────────────────────────
const updateMemberStatus = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const { status }     = req.body;

    const proj = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [id]);
    if (proj.rows.length === 0)               return res.status(404).json({ success: false, message: 'Project not found' });
    if (proj.rows[0].owner_id !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });

    await pool.query(
      'UPDATE project_members SET status = $1 WHERE project_id = $2 AND user_id = $3',
      [status, id, userId]
    );
    res.json({ success: true, message: `Member ${status}` });
  } catch (err) { next(err); }
};

module.exports = {
  getProjects, getMyProjects, getProjectById, getApplicants,
  createProject, updateProject, deleteProject,
  applyToProject, updateMemberStatus,
};