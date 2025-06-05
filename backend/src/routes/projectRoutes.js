const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
  getProjects,
  createProject,
  deleteProject,
  updateProject,
  getProjectsWithSummary
} = require('../controllers/projectsController');

router.get('/', authenticate, getProjects);
router.post('/', authenticate, createProject);
router.put('/:id', authenticate, updateProject); 
router.delete('/:id', authenticate, deleteProject);
router.get('/with-summary', authenticate, getProjectsWithSummary);

module.exports = router;
