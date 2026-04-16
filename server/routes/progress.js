const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Progress = require('../models/Progress');

// GET /api/progress/:userId
router.get('/:userId', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.params.userId });
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/progress/update
router.post('/update', auth, async (req, res) => {
  const { signId, score } = req.body;
  
  try {
    let progress = await Progress.findOne({ user: req.user.id, signId });
    
    if (progress) {
      progress.attempts += 1;
      progress.matchScore = Math.max(progress.matchScore, score);
      if (progress.matchScore >= 80) progress.completed = true;
      progress.lastPracticed = Date.now();
      await progress.save();
    } else {
      progress = new Progress({
        user: req.user.id,
        signId,
        matchScore: score,
        attempts: 1,
        completed: score >= 80
      });
      await progress.save();
    }
    
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/progress/stats/:userId
router.get('/stats/:userId', auth, async (req, res) => {
  try {
    const records = await Progress.find({ user: req.params.userId });
    const totalAttempts = records.reduce((acc, curr) => acc + curr.attempts, 0);
    const completedSigns = records.filter(r => r.completed).length;
    
    res.json({
      totalAttempts,
      completedSigns,
      totalPracticed: records.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
