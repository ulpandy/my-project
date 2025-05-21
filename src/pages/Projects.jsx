import { useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaUsers } from 'react-icons/fa'

export default function Projects() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Redesign company website with modern UI',
      status: 'active',
      members: ['John Doe', 'Jane Smith'],
      tasks: 12,
      completedTasks: 5,
      deadline: '2024-02-01'
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Develop iOS and Android mobile apps',
      status: 'planning',
      members: ['Mike Johnson'],
      tasks: 8,
      completedTasks: 0,
      deadline: '2024-03-15'
    }
  ])

  const [isCreating, setIsCreating] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    deadline: '',
    members: []
  })

  const handleCreateProject = () => {
    const project = {
      id: projects.length + 1,
      ...newProject,
      status: 'planning',
      tasks: 0,
      completedTasks: 0
    }
    
    setProjects([...projects, project])
    setIsCreating(false)
    setNewProject({
      name: '',
      description: '',
      deadline: '',
      members: []
    })
  }

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(project => project.id !== projectId))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary flex items-center"
        >
          <FaPlus className="mr-2" />
          New Project
        </button>
      </div>

      {isCreating && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Name</label>
              <input
                type="text"
                className="form-input mt-1"
                value={newProject.name}
                onChange={e => setNewProject({ ...newProject, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="form-input mt-1"
                value={newProject.description}
                onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Deadline</label>
              <input
                type="date"
                className="form-input mt-1"
                value={newProject.deadline}
                onChange={e => setNewProject({ ...newProject, deadline: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Team Members</label>
              <select
                multiple
                className="form-input mt-1"
                value={newProject.members}
                onChange={e => setNewProject({
                  ...newProject,
                  members: Array.from(e.target.selectedOptions, option => option.value)
                })}
              >
                <option value="John Doe">John Doe</option>
                <option value="Jane Smith">Jane Smith</option>
                <option value="Mike Johnson">Mike Johnson</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsCreating(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="btn-primary"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="card p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status}
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <FaEdit />
                </button>
                <button 
                  className="text-gray-400 hover:text-red-600"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <p className="text-gray-600 text-sm mt-2">{project.description}</p>

            <div className="mt-4 space-y-3">
              <div className="flex items-center text-sm">
                <FaUsers className="text-gray-400 mr-2" />
                <span className="text-gray-600">{project.members.join(', ')}</span>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round((project.completedTasks / project.tasks) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-primary-600 rounded-full"
                    style={{ width: `${(project.completedTasks / project.tasks) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Deadline: {new Date(project.deadline).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}