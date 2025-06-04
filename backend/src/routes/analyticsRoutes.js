const express = require('express')
const router = express.Router()
const { getTeamAnalytics } = require('../controllers/analyticsController')
const { authenticate } = require('../middleware/authMiddleware')

router.get('/team', authenticate, getTeamAnalytics)

module.exports = router
