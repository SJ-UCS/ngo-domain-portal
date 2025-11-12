const express = require('express');
const db = require('../db');
const auth = require('../middlewares/auth');
const router = express.Router();

// Get all NGOs
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, domain, location, contact, description, objectives, goals FROM ngos ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch ngos' });
  }
});

// Create NGO (must be authenticated)
router.post('/', auth, async (req, res) => {
  try {
    const { name, domain, location, contact, description, objectives, goals } = req.body;
    const owner_id = req.user.id;
    const result = await db.query(
      'INSERT INTO ngos(name,domain,location,contact,description,objectives,goals,owner_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,name,domain,location,contact,description,objectives,goals',
      [name, domain, location, contact, description, objectives, goals, owner_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create ngo' });
  }
});

// Volunteer for a campaign
router.post('/:ngoId/campaigns/:campaignId/volunteer', auth, async (req, res) => {
  try {
    const { ngoId, campaignId } = req.params;
    const userId = req.user.id;
    
    // Check if campaign exists and belongs to the NGO
    const campaignResult = await db.query(
      'SELECT id FROM campaigns WHERE id=$1 AND ngo_id=$2',
      [campaignId, ngoId]
    );
    
    if (campaignResult.rowCount === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Check if user already volunteered
    const existingVolunteer = await db.query(
      'SELECT id FROM volunteers WHERE user_id=$1 AND campaign_id=$2',
      [userId, campaignId]
    );
    
    if (existingVolunteer.rowCount > 0) {
      return res.status(400).json({ error: 'Already volunteered for this campaign' });
    }
    
    // Add volunteer
    const result = await db.query(
      'INSERT INTO volunteers(user_id, campaign_id) VALUES($1, $2) RETURNING id, status, applied_at',
      [userId, campaignId]
    );
    
    res.json({ message: 'Successfully volunteered for campaign', volunteer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not volunteer for campaign' });
  }
});

// Get user's volunteer applications
router.get('/my-volunteers', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(`
      SELECT v.id, v.status, v.applied_at, c.title as campaign_title, n.name as ngo_name
      FROM volunteers v
      JOIN campaigns c ON v.campaign_id = c.id
      JOIN ngos n ON c.ngo_id = n.id
      WHERE v.user_id = $1
      ORDER BY v.applied_at DESC
    `, [userId]);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch volunteer applications' });
  }
});

module.exports = router;
