const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
  getProjects,
  createProject,
  deleteProject,
  updateProject
} = require('../controllers/projectsController');

router.get('/', authenticate, getProjects);
router.post('/', authenticate, createProject);
router.put('/:id', authenticate, updateProject); // ✅ обновление
router.delete('/:id', authenticate, deleteProject);

module.exports = router;
