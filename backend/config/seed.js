require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool   = require('./db');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check already seeded
    const existing = await client.query(`SELECT id FROM users WHERE email = 'arjun@iitb.ac.in'`);
    if (existing.rows.length > 0) {
      console.log('⚠️  Seed data already exists. Skipping.');
      await client.query('ROLLBACK');
      return;
    }

    const hash = await bcrypt.hash('password123', 10);

    const { rows: users } = await client.query(`
      INSERT INTO users (name, email, password, college, city, bio, skills, is_verified)
      VALUES
        ('Arjun Mehta',   'arjun@iitb.ac.in',       $1, 'IIT Bombay',         'Mumbai',   'Full-stack dev & UI designer. Love building cool things!',            ARRAY['React','Node.js','PostgreSQL','Figma'], true),
        ('Priya Sharma',  'priya@bits.ac.in',        $1, 'BITS Pilani',        'Pilani',   'Content creator & social media strategist with 2 yrs experience.',   ARRAY['Content Writing','Social Media','Canva','SEO'], true),
        ('Ravi Kumar',    'ravi@vit.ac.in',           $1, 'VIT Vellore',        'Vellore',  'Android developer. 5+ apps on Play Store.',                          ARRAY['Android','Kotlin','Firebase','Java'], true),
        ('Sneha Das',     'sneha@jadavpur.ac.in',    $1, 'Jadavpur University','Kolkata',  'Graphic designer & illustrator passionate about brand identity.',     ARRAY['Illustrator','Photoshop','Figma','Branding'], true)
      RETURNING id, name, email
    `, [hash]);

    const [arjun, priya, ravi, sneha] = users;

    await client.query(`
      INSERT INTO gigs (user_id, title, description, category, price, price_type, delivery_days, tags)
      VALUES
        ($1,'Build your React + Node.js full-stack app',
            'I will build a complete full-stack web application with React frontend and Node.js/PostgreSQL backend. Clean code, responsive UI, proper REST API, authentication, and deployment guide included.',
            'Web Development', 2500, 'fixed', 7,  ARRAY['react','nodejs','fullstack','postgresql']),
        ($2,'Write SEO-optimised blog posts & articles',
            'I will write engaging, SEO-friendly blog posts for your brand. 100%% original content, well-researched, and tailored to your target audience. Includes meta description and keyword optimisation.',
            'Content Writing', 400, 'fixed', 2,  ARRAY['seo','blog','content','writing']),
        ($3,'Develop your Android app from scratch',
            'I will build a native Android application using Kotlin. Covers UI design, API integration, local database, and Play Store submission guidance. Clean MVVM architecture.',
            'Mobile Development', 5000, 'negotiable', 14, ARRAY['android','kotlin','mobile','app']),
        ($4,'Design your brand logo & full identity kit',
            'Get a professional logo plus full brand kit including colour palette, typography guide, and social media assets. Delivered in all formats. Unlimited revisions until you are 100%% happy.',
            'Design', 1200, 'fixed', 5,  ARRAY['logo','branding','design','identity']),
        ($1,'Set up CI/CD pipeline & cloud deployment',
            'I will configure GitHub Actions workflows, Dockerize your application, and deploy it to your server or cloud provider (Render, Railway, or VPS). Includes HTTPS setup and monitoring basics.',
            'DevOps', 1800, 'fixed', 4,  ARRAY['devops','docker','github-actions','deployment']),
        ($4,'Create 30-post social media graphics pack',
            'Scroll-stopping social media content designed for Instagram, LinkedIn, and Twitter/X. Consistent brand aesthetic throughout. Delivered as editable Canva templates + exported PNGs.',
            'Design', 800, 'fixed', 3,  ARRAY['social-media','instagram','canva','graphics'])
    `, [arjun.id, priya.id, ravi.id, sneha.id]);

    await client.query(`
      INSERT INTO projects (owner_id, title, description, category, required_skills, team_size, duration, is_paid, budget, college_only)
      VALUES
        ($1,'Campus Event App for IIT Bombay',
            'Building a mobile-first web app to discover and manage campus events, clubs, and fests. We need a frontend dev, backend dev, and a UI/UX designer. Great portfolio project!',
            'Web Development', ARRAY['React','Node.js','UI Design'], 4, '2 months', false, NULL, true),
        ($2,'Student Mental Health Anonymous Blog',
            'Creating a safe, anonymous blogging platform for students to share experiences and seek support. Looking for writers, a React developer, and a community moderator.',
            'Social Impact', ARRAY['Content Writing','React','Community Management'], 3, '1 month', true, 5000, false),
        ($3,'Campus Carpool Matching Android App',
            'Android app to help students coordinate carpools within campus and nearby areas. Monetisation planned via premium features. Looking for Kotlin devs and a UI designer.',
            'Mobile Development', ARRAY['Android','Kotlin','Firebase'], 3, '3 months', true, 12000, false),
        ($4,'Open Source Student Design System',
            'Building a reusable component library and design system specifically for student projects. Great for portfolio and open-source contribution. All skill levels welcome.',
            'Design', ARRAY['Figma','React','CSS','Documentation'], 5, 'Ongoing', false, NULL, false)
    `, [arjun.id, priya.id, ravi.id, sneha.id]);

    await client.query('COMMIT');
    console.log('✅ Seed complete!');
    console.log('');
    console.log('Test accounts (password: password123):');
    users.forEach(u => console.log(`  ${u.email}`));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();