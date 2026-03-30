require('dotenv').config();
const pool = require('./db');

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Enable UUID extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // -------------------------------
    // DROP OLD TABLES (important!)
    // -------------------------------
    await client.query(`
      DROP TABLE IF EXISTS saved_gigs CASCADE;
      DROP TABLE IF EXISTS messages CASCADE;
      DROP TABLE IF EXISTS reviews CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS project_members CASCADE;
      DROP TABLE IF EXISTS projects CASCADE;
      DROP TABLE IF EXISTS gigs CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // -------------------------------
    // USERS
    // -------------------------------
    await client.query(`
      CREATE TABLE users (
        id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        name          VARCHAR(100) NOT NULL,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password      VARCHAR(255) NOT NULL,
        college       VARCHAR(200),
        city          VARCHAR(100),
        bio           TEXT,
        avatar        VARCHAR(500),
        skills        TEXT[]       DEFAULT '{}',
        is_verified   BOOLEAN      DEFAULT false,
        rating        NUMERIC(3,2) DEFAULT 0,
        review_count  INTEGER      DEFAULT 0,
        created_at    TIMESTAMPTZ  DEFAULT NOW(),
        updated_at    TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    // -------------------------------
    // GIGS
    // -------------------------------
    await client.query(`
      CREATE TABLE gigs (
        id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       UUID         NOT NULL,
        title         VARCHAR(200) NOT NULL,
        description   TEXT         NOT NULL,
        category      VARCHAR(100) NOT NULL,
        price         NUMERIC(10,2) NOT NULL,
        price_type    VARCHAR(20)  DEFAULT 'fixed' CHECK (price_type IN ('fixed','hourly','negotiable')),
        delivery_days INTEGER      DEFAULT 3,
        tags          TEXT[]       DEFAULT '{}',
        images        TEXT[]       DEFAULT '{}',
        is_active     BOOLEAN      DEFAULT true,
        order_count   INTEGER      DEFAULT 0,
        rating        NUMERIC(3,2) DEFAULT 0,
        review_count  INTEGER      DEFAULT 0,
        created_at    TIMESTAMPTZ  DEFAULT NOW(),
        updated_at    TIMESTAMPTZ  DEFAULT NOW(),
        CONSTRAINT gigs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // -------------------------------
    // PROJECTS
    // -------------------------------
    await client.query(`
      CREATE TABLE projects (
        id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id         UUID         NOT NULL,
        title            VARCHAR(200) NOT NULL,
        description      TEXT         NOT NULL,
        category         VARCHAR(100) NOT NULL,
        required_skills  TEXT[]       DEFAULT '{}',
        team_size        INTEGER      DEFAULT 2,
        duration         VARCHAR(100),
        is_paid          BOOLEAN      DEFAULT false,
        budget           NUMERIC(10,2),
        status           VARCHAR(20)  DEFAULT 'open' CHECK (status IN ('open','in_progress','completed','closed')),
        college_only     BOOLEAN      DEFAULT false,
        created_at       TIMESTAMPTZ  DEFAULT NOW(),
        updated_at       TIMESTAMPTZ  DEFAULT NOW(),
        CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // -------------------------------
    // PROJECT MEMBERS
    // -------------------------------
    await client.query(`
      CREATE TABLE project_members (
        id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id  UUID         NOT NULL,
        user_id     UUID         NOT NULL,
        role        VARCHAR(100),
        status      VARCHAR(20)  DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
        applied_at  TIMESTAMPTZ  DEFAULT NOW(),
        UNIQUE(project_id, user_id),
        CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT project_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // -------------------------------
    // ORDERS
    // -------------------------------
    await client.query(`
      CREATE TABLE orders (
        id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        gig_id         UUID         NOT NULL,
        buyer_id       UUID         NOT NULL,
        seller_id      UUID         NOT NULL,
        amount         NUMERIC(10,2) NOT NULL,
        status         VARCHAR(20)   DEFAULT 'pending' CHECK (status IN ('pending','active','completed','cancelled','disputed')),
        requirements   TEXT,
        delivery_date  TIMESTAMPTZ,
        created_at     TIMESTAMPTZ   DEFAULT NOW(),
        updated_at     TIMESTAMPTZ   DEFAULT NOW(),
        CONSTRAINT orders_gig_id_fkey FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE,
        CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // -------------------------------
    // REVIEWS
    // -------------------------------
    await client.query(`
      CREATE TABLE reviews (
        id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
        reviewer_id  UUID          NOT NULL,
        reviewee_id  UUID          NOT NULL,
        gig_id       UUID,
        order_id     UUID,
        rating       INTEGER       NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment      TEXT,
        created_at   TIMESTAMPTZ   DEFAULT NOW(),
        UNIQUE(order_id, reviewer_id),
        CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT reviews_gig_id_fkey FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE SET NULL,
        CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
      );
    `);

    // -------------------------------
    // MESSAGES
    // -------------------------------
    await client.query(`
      CREATE TABLE messages (
        id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id    UUID         NOT NULL,
        receiver_id  UUID         NOT NULL,
        content      TEXT         NOT NULL,
        is_read      BOOLEAN      DEFAULT false,
        created_at   TIMESTAMPTZ  DEFAULT NOW(),
        CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // -------------------------------
    // SAVED GIGS
    // -------------------------------
    await client.query(`
      CREATE TABLE saved_gigs (
        user_id   UUID NOT NULL,
        gig_id    UUID NOT NULL,
        saved_at  TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, gig_id),
        CONSTRAINT saved_gigs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT saved_gigs_gig_id_fkey FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE
      );
    `);

    // -------------------------------
    // INDEXES
    // -------------------------------
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_gigs_user_id ON gigs(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_gigs_category ON gigs(category)`,
      `CREATE INDEX IF NOT EXISTS idx_gigs_is_active ON gigs(is_active)`,
      `CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id)`,
      `CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id)`,
      `CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id)`,
      `CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)`,
      `CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id)`
    ];

    for (const idx of indexes) {
      await client.query(idx);
    }

    await client.query('COMMIT');
    console.log('✅ Migration successful — all tables created');
    process.exit(0);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();