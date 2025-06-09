import { useState, useEffect } from 'react';
import { FaPlus, FaTasks } from 'react-icons/fa';
import { useTasks } from '../context/TasksContext';
import { useAuth } from '../context/AuthContext';
import { useActivityTracker } from '../hooks/useActivityTracker';
import TaskColumn from '../components/TaskColumn';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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
  const [isLoading, setIsLoading] = useState(true);
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
    if (result) {
      setTasksByStatus(result);
      setTimeout(() => setIsLoading(false), 300); // simulate brief load
    }
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

      const refreshed = getTasksByStatus?.();
      if (refreshed) setTasksByStatus(refreshed);
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
    <div className="dark:bg-[#1D0036] bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        {['admin', 'manager'].includes(currentUser?.role) && (
          <button
            onClick={handleCreateTask}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-lg shadow-lg transition"
          >
            <FaPlus /> <span>New Task</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {isCreatingTask && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-[#2D2040] rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Create New Task</h2>
            <div className="grid grid-cols-1 gap-4 relative z-0 overflow-visible">
              <input
                type="text"
                className="form-input dark:bg-[#1D0036] dark:text-white rounded-lg px-4 py-2"
                placeholder="Title"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              />
              <div className="relative z-10">
                <ReactQuill
                  theme="snow"
                  value={newTask.description}
                  onChange={(value) => setNewTask({ ...newTask, description: value })}
                  placeholder="Task description..."
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, false] }],
                      ['bold', 'italic', 'underline'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['clean'],
                    ],
                  }}
                  formats={["header", "bold", "italic", "underline", "list", "bullet"]}
                />
              </div>
              <select
                className="form-input dark:bg-[#1D0036] dark:text-white rounded-lg px-4 py-2"
                value={newTask.assignedTo}
                onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
              >
                <option value="">Select user</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
              <select
                className="form-input dark:bg-[#1D0036] dark:text-white rounded-lg px-4 py-2"
                value={newTask.priority}
                onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select
                className="form-input dark:bg-[#1D0036] dark:text-white rounded-lg px-4 py-2"
                value={newTask.projectId}
                onChange={e => setNewTask({ ...newTask, projectId: e.target.value })}
                required
              >
                <option value="">Select project</option>
                {availableProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="flex justify-end gap-3">
                <button onClick={handleCancelTask} className="btn-outline">Cancel</button>
                <button onClick={handleSaveTask} className="btn-primary">Save Task</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="p-4 bg-white dark:bg-[#2D2040] rounded-lg shadow">
              <Skeleton height={24} width={100} className="mb-4" />
              <Skeleton count={5} />
            </div>
          ))
        ) : (
          <>
            <TaskColumn status="todo" title="To Do" tasks={tasksByStatus.todo} bgClass="bg-blue-100 dark:bg-blue-900/30" />
            <TaskColumn status="inprogress" title="In Progress" tasks={tasksByStatus.inprogress} bgClass="bg-yellow-100 dark:bg-yellow-900/30" />
            <TaskColumn status="done" title="Done" tasks={tasksByStatus.done} bgClass="bg-green-100 dark:bg-green-900/30" />
            <TaskColumn status="frozen" title="Frozen" tasks={tasksByStatus.frozen} bgClass="bg-gray-100 dark:bg-gray-800/40" />
          </>
        )}
      </div>

      {!isLoading && Object.values(tasksByStatus).every((tasks) => tasks.length === 0) && (
        <div className="mt-12 text-center p-10 bg-white dark:bg-[#2D2040] rounded-xl shadow-md">
          <FaTasks className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No tasks available</h2>
          <p className="text-gray-500 dark:text-gray-300">You don't have any tasks yet. Create a new task to get started.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;