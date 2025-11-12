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

// Create campaign (authenticated NGO owner)
router.post('/', auth, async (req, res) => {
  try {
    const { ngo_id, title, description, goal_amount } = req.body;
    const result = await db.query(
      'INSERT INTO campaigns(ngo_id,title,description,goal_amount,collected_amount) VALUES($1,$2,$3,$4,$5) RETURNING id,title,description,goal_amount,collected_amount,ngo_id',
      [ngo_id, title, description, goal_amount, 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create campaign' });
  }
});

module.exports = router;
