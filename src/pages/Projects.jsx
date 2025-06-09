import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useProjects } from '../context/ProjectsContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Projects() {
  const {
    projects,
    createProject,
    updateProject,
    deleteProject,
    error,
    loading,
  } = useProjects();

  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    deadline: ''
  });

  const handleCreateProject = async () => {
    const result = await createProject(newProject);
    if (result.success) {
      setIsCreating(false);
      setNewProject({ name: '', description: '', deadline: '' });
    } else {
      alert(result.error || 'Failed to create project');
    }
  };

  const handleUpdateProject = async () => {
    const result = await updateProject(editingProject._id, editingProject);
    if (result.success) {
      setEditingProject(null);
    } else {
      alert(result.error || 'Failed to update project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const result = await deleteProject(id);
      if (!result.success) alert(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary flex items-center"
        >
          <FaPlus className="mr-2" /> New Project
        </button>
      </div>

      {error && <div className="text-red-600 dark:text-red-400">Error: {error}</div>}
      {loading && <div className="text-gray-500 dark:text-gray-300">Loading projects...</div>}

      {(isCreating || editingProject) && (
        <div className="card p-6 bg-white dark:bg-[#1F1F2C] border border-gray-200 dark:border-gray-700 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {editingProject ? 'Edit Project' : 'Create New Project'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Name
              </label>
              <input
                type="text"
                className="form-input mt-1 dark:bg-[#2D2D3A] dark:text-white"
                value={editingProject ? editingProject.name : newProject.name}
                onChange={e =>
                  editingProject
                    ? setEditingProject({ ...editingProject, name: e.target.value })
                    : setNewProject({ ...newProject, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <ReactQuill
                theme="snow"
                value={editingProject ? editingProject.description : newProject.description}
                onChange={(value) =>
                  editingProject
                    ? setEditingProject({ ...editingProject, description: value })
                    : setNewProject({ ...newProject, description: value })
                }
                placeholder="Enter project description..."
                modules={{
                  toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['clean']
                  ],
                }}
                formats={['header', 'bold', 'italic', 'underline', 'list', 'bullet']}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Deadline
              </label>
              <input
                type="date"
                className="form-input mt-1 dark:bg-[#2D2D3A] dark:text-white"
                value={
                  editingProject
                    ? editingProject.deadline?.split('T')[0]
                    : newProject.deadline
                }
                onChange={e =>
                  editingProject
                    ? setEditingProject({ ...editingProject, deadline: e.target.value })
                    : setNewProject({ ...newProject, deadline: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingProject(null);
                }}
                className="btn-outline dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={editingProject ? handleUpdateProject : handleCreateProject}
                className="btn-primary"
              >
                {editingProject ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project._id} className="card p-6 bg-white dark:bg-[#1F1F2C] border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {project.name}
                </h3>
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                  {project.status || 'planning'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                  onClick={() => setEditingProject(project)}
                >
                  <FaEdit />
                </button>
                <button
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  onClick={() => handleDeleteProject(project._id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div
              className="text-gray-600 dark:text-gray-300 text-sm mt-2"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />

            <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div>Created: {new Date(project.created_at).toLocaleDateString()}</div>
              {project.deadline && (
                <div>Deadline: {new Date(project.deadline).toLocaleDateString()}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}