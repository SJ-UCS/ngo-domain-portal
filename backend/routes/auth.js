const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
const dotenv = require('dotenv');
const auth = require('../middlewares/auth'); // ✅ add this line
dotenv.config();
const secret = process.env.JWT_SECRET || 'secret';


// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, age, mobile, area, profile_icon } = req.body;
    
    // Validate required fields based on role
    if (role === 'ngo') {
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required for NGO registration' });
      }
    } else {
      if (!name || !email || !password || !age || !mobile || !area) {
        return res.status(400).json({ error: 'Name, email, password, age, mobile, and area are required for user registration' });
      }
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users(name,email,password,role,age,mobile,area,profile_icon) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,name,email,role,age,mobile,area,profile_icon',
      [name, email, hashed, role || 'user', age, mobile, area, profile_icon || '👤']
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, secret, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query('SELECT id,name,email,password,role,age,mobile,area,profile_icon FROM users WHERE email=$1', [email]);
    if (result.rowCount === 0) return res.status(400).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, secret, { expiresIn: '7d' });
    delete user.password;
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile with campaign participation count
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user details
    const userResult = await db.query(
      'SELECT id,name,email,role,age,mobile,area,profile_icon,created_at FROM users WHERE id=$1',
      [userId]
    );
    
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get campaign participation count
    const participationResult = await db.query(`
      SELECT COUNT(DISTINCT campaign_id) as campaign_count
      FROM (
        SELECT campaign_id FROM donations WHERE user_id = $1
        UNION
        SELECT campaign_id FROM volunteers WHERE user_id = $1
      ) as participations
    `, [userId]);
    
    user.campaign_participation_count = parseInt(participationResult.rows[0].campaign_count) || 0;
    
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch profile' });
  }
});

// Get user's detailed participation (donations and volunteer applications)
router.get('/profile/participations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get donations
    const donationsResult = await db.query(`
      SELECT 
        d.id,
        d.amount,
        d.donated_at,
        c.id as campaign_id,
        c.title as campaign_title,
        c.description as campaign_description,
        n.id as ngo_id,
        n.name as ngo_name
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      JOIN ngos n ON c.ngo_id = n.id
      WHERE d.user_id = $1
      ORDER BY d.donated_at DESC
    `, [userId]);
    
    // Get volunteer applications
    const volunteersResult = await db.query(`
      SELECT 
        v.id,
        v.status,
        v.applied_at,
        c.id as campaign_id,
        c.title as campaign_title,
        c.description as campaign_description,
        n.id as ngo_id,
        n.name as ngo_name
      FROM volunteers v
      JOIN campaigns c ON v.campaign_id = c.id
      JOIN ngos n ON c.ngo_id = n.id
      WHERE v.user_id = $1
      ORDER BY v.applied_at DESC
    `, [userId]);
    
    res.json({
      donations: donationsResult.rows,
      volunteers: volunteersResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch participations' });
  }
});

module.exports = router;
