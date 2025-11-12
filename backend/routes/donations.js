const express = require('express');
const db = require('../db');
const auth = require('../middlewares/auth');
const router = express.Router();

// Donate (authenticated)
router.post('/', auth, async (req, res) => {
  try {
    const { campaign_id, amount } = req.body;
    const user_id = req.user.id;
    const result = await db.query(
      'INSERT INTO donations(user_id,campaign_id,amount,donated_at) VALUES($1,$2,$3,NOW()) RETURNING id,user_id,campaign_id,amount,donated_at',
      [user_id, campaign_id, amount]
    );
    // update collected amount
    await db.query('UPDATE campaigns SET collected_amount = collected_amount + $1 WHERE id=$2', [amount, campaign_id]);
    res.json({ success: true, donation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Donation failed' });
  }
});

module.exports = router;
