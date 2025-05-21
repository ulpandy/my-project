import { useState, useEffect } from 'react'
import { FaPlus, FaTasks } from 'react-icons/fa'
import { useTasks } from '../context/TasksContext'
import { useAuth } from '../context/AuthContext'
import TaskColumn from '../components/TaskColumn'

function Dashboard() {
  const { getTasksByStatus, createTask } = useTasks()
  const { currentUser } = useAuth()
  
  const [tasksByStatus, setTasksByStatus] = useState({
    todo: [],
    inprogress: [],
    done: [],
    frozen: []
  })
  
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium'
  })
  
  // Fetch tasks on component mount and when they change
  useEffect(() => {
    setTasksByStatus(getTasksByStatus())
  }, [getTasksByStatus])
  
  const handleCreateTask = () => {
    // Only admin and manager can create tasks
    if (!['admin', 'manager'].includes(currentUser.role)) return
    
    setIsCreatingTask(true)
  }
  
  const handleSaveTask = () => {
    if (!newTask.title.trim()) return
    
    createTask(newTask)
    
    // Reset form and close it
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium'
    })
    setIsCreatingTask(false)
    
    // Refresh tasks
    setTasksByStatus(getTasksByStatus())
  }
  
  const handleCancelTask = () => {
    setIsCreatingTask(false)
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium'
    })
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
        {/* Only show create task button for admin and manager */}
        {['admin', 'manager'].includes(currentUser.role) && (
          <button 
            onClick={handleCreateTask}
            className="btn-primary flex items-center"
          >
            <FaPlus className="mr-2" />
            New Task
          </button>
        )}
      </div>
      
      {/* Task creation form */}
      {isCreatingTask && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                id="title"
                className="form-input mt-1"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Task title"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                className="form-input mt-1"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Task description"
                rows={3}
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assigned To</label>
              <select
                id="assignedTo"
                className="form-input mt-1"
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
              >
                <option value="">Select a user</option>
                <option value="1">Admin User</option>
                <option value="2">Manager User</option>
                <option value="3">Worker User</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                id="priority"
                className="form-input mt-1"
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                onClick={handleCancelTask}
                className="btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTask}
                className="btn-primary"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Tasks board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TaskColumn 
          status="todo"
          title="To Do"
          tasks={tasksByStatus.todo}
        />
        
        <TaskColumn 
          status="inprogress"
          title="In Progress"
          tasks={tasksByStatus.inprogress}
        />
        
        <TaskColumn 
          status="done"
          title="Done"
          tasks={tasksByStatus.done}
        />
        
        <TaskColumn 
          status="frozen"
          title="Frozen"
          tasks={tasksByStatus.frozen}
        />
      </div>
      
      {/* Empty state */}
      {Object.values(tasksByStatus).every(tasks => tasks.length === 0) && (
        <div className="mt-8 text-center p-8 bg-white rounded-lg shadow-sm">
          <FaTasks className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No tasks available</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            {['admin', 'manager'].includes(currentUser.role) 
              ? "You don't have any tasks yet. Create a new task to get started."
              : "You don't have any assigned tasks yet. Tasks assigned to you will appear here."}
          </p>
          {['admin', 'manager'].includes(currentUser.role) && (
            <button 
              onClick={handleCreateTask}
              className="mt-4 btn-primary"
            >
              Create Your First Task
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard