const express = require('express');
const { getTasks, createTask, updateTask, deleteTask , getWeeklyTaskCompletion} = require('../controllers/taskController');
const { authenticate, authorize } = require('../middleware/authMiddleware');  
const { apiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(authenticate);
router.use(apiRateLimiter);

console.log('DEBUG getTasks:', typeof getTasks);

router.get('/', getTasks);
router.post('/', authorize('admin', 'manager'), createTask);
router.put('/:id', updateTask);
router.delete('/:id', authorize('admin', 'manager'), deleteTask);
router.get('/analytics/weekly-completion', getWeeklyTaskCompletion);


module.exports = router;
