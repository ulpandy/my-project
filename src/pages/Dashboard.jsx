import { useState, useEffect } from 'react';
import { FaPlus, FaTasks } from 'react-icons/fa';
import { useTasks } from '../context/TasksContext';
import { useAuth } from '../context/AuthContext';
import { useActivityTracker } from '../hooks/useActivityTracker';
import TaskColumn from '../components/TaskColumn';

function Dashboard() {
  const { tasks, getTasksByStatus, createTask } = useTasks();
  const { currentUser } = useAuth();
  const { startTracking } = useActivityTracker();

  const [tasksByStatus, setTasksByStatus] = useState({
    todo: [],
    inprogress: [],
    done: [],
    frozen: []
  });

  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    projectId: ''
  });

  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);

  useEffect(() => {
    startTracking();
    console.log('🔥 Activity tracking started');
  }, []);

  useEffect(() => {
    const result = getTasksByStatus?.();
    if (result) setTasksByStatus(result);
  }, [tasks, getTasksByStatus]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setAvailableUsers(data);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setAvailableProjects(data);
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    };

    if (['admin', 'manager'].includes(currentUser?.role)) {
      fetchUsers();
      fetchProjects();
    }
  }, [currentUser]);

  const handleCreateTask = () => {
    if (!['admin', 'manager'].includes(currentUser?.role)) return;
    setIsCreatingTask(true);
  };

  const handleSaveTask = async () => {
    if (!newTask.title.trim() || !newTask.projectId) return;

    const payload = {
      ...newTask,
      assignedTo: newTask.assignedTo.trim() === '' ? null : newTask.assignedTo
    };

    const result = await createTask(payload);

    if (result.success) {
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        projectId: ''
      });
      setIsCreatingTask(false);
    } else {
      alert(result.error || 'Failed to create task');
    }
  };

  const handleCancelTask = () => {
    setIsCreatingTask(false);
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      projectId: ''
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {['admin', 'manager'].includes(currentUser?.role) && (
          <button onClick={handleCreateTask} className="btn-primary flex items-center">
            <FaPlus className="mr-2" />
            New Task
          </button>
        )}
      </div>

      {isCreatingTask && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
          <div className="space-y-4">
            <input
              type="text"
              className="form-input"
              placeholder="Title"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            />
            <textarea
              className="form-input"
              placeholder="Description"
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
            />
            <select
              className="form-input"
              value={newTask.assignedTo}
              onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
            >
              <option value="">Select user</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <select
              className="form-input"
              value={newTask.priority}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select
              className="form-input"
              value={newTask.projectId}
              onChange={e => setNewTask({ ...newTask, projectId: e.target.value })}
              required
            >
              <option value="">Select project</option>
              {availableProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button onClick={handleCancelTask} className="btn-outline">Cancel</button>
              <button onClick={handleSaveTask} className="btn-primary">Save Task</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TaskColumn status="todo" title="To Do" tasks={tasksByStatus.todo} />
        <TaskColumn status="inprogress" title="In Progress" tasks={tasksByStatus.inprogress} />
        <TaskColumn status="done" title="Done" tasks={tasksByStatus.done} />
        <TaskColumn status="frozen" title="Frozen" tasks={tasksByStatus.frozen} />
      </div>

      {Object.values(tasksByStatus).every((tasks) => tasks.length === 0) && (
        <div className="mt-8 text-center p-8 bg-white rounded-lg shadow-sm">
          <FaTasks className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No tasks available</h2>
          <p className="text-gray-500">You don\'t have any tasks yet. Create a new task to get started.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
