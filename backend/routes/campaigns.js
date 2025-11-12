const express = require('express');
const db = require('../db');
const auth = require('../middlewares/auth');
const router = express.Router();

// Get campaigns
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT c.id, c.title, c.description, c.goal_amount, c.collected_amount, c.ngo_id, n.name as ngo_name FROM campaigns c JOIN ngos n ON c.ngo_id=n.id ORDER BY c.id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch campaigns' });
  }
});

// Get campaigns by NGO ID
router.get('/ngo/:ngoId', async (req, res) => {
  try {
    const { ngoId } = req.params;
    const result = await db.query(
      'SELECT c.id, c.title, c.description, c.goal_amount, c.collected_amount, c.ngo_id, c.created_at, n.name as ngo_name FROM campaigns c JOIN ngos n ON c.ngo_id=n.id WHERE c.ngo_id=$1 ORDER BY c.created_at DESC',
      [ngoId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch campaigns' });
  }
});

// Create campaign (authenticated NGO owner)
router.post('/', auth, async (req, res) => {
  try {
    const { ngo_id, title, description, goal_amount } = req.body;
    const userId = req.user.id;
    
    // Verify user owns the NGO
    const ngoCheck = await db.query(
      'SELECT id FROM ngos WHERE id=$1 AND owner_id=$2',
      [ngo_id, userId]
    );
    
    if (ngoCheck.rowCount === 0) {
      return res.status(403).json({ error: 'You can only create campaigns for your own NGO' });
    }
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    const result = await db.query(
      'INSERT INTO campaigns(ngo_id,title,description,goal_amount,collected_amount) VALUES($1,$2,$3,$4,$5) RETURNING id,title,description,goal_amount,collected_amount,ngo_id,created_at',
      [ngo_id, title, description, goal_amount || 0, 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create campaign' });
  }
});

// Get volunteer applications for NGO's campaigns
router.get('/volunteers/ngo/:ngoId', auth, async (req, res) => {
  try {
    const { ngoId } = req.params;
    const userId = req.user.id;
    
    // Verify user owns the NGO
    const ngoCheck = await db.query(
      'SELECT id FROM ngos WHERE id=$1 AND owner_id=$2',
      [ngoId, userId]
    );
    
    if (ngoCheck.rowCount === 0) {
      return res.status(403).json({ error: 'You can only view volunteers for your own NGO' });
    }
    
    const result = await db.query(`
      SELECT 
        v.id, 
        v.status, 
        v.applied_at,
        u.name as user_name,
        u.email as user_email,
        u.mobile as user_mobile,
        c.id as campaign_id,
        c.title as campaign_title
      FROM volunteers v
      JOIN campaigns c ON v.campaign_id = c.id
      JOIN users u ON v.user_id = u.id
      WHERE c.ngo_id = $1
      ORDER BY v.applied_at DESC
    `, [ngoId]);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch volunteer applications' });
  }
});

module.exports = router;
