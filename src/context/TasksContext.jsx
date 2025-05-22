import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000/api';

const initialTasks = [
  {
    id: '1',
    title: 'Create project plan',
    description: 'Draft the initial project plan and timeline',
    status: 'todo',
    assignedTo: '2',
    createdBy: '1',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Design UI mockups',
    description: 'Create initial UI design for the dashboard',
    status: 'inprogress',
    assignedTo: '3',
    createdBy: '2',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Setup development environment',
    description: 'Install necessary tools and configure the environment',
    status: 'done',
    assignedTo: '3',
    createdBy: '2',
    priority: 'low'
  },
  {
    id: '4',
    title: 'Review code standards',
    description: 'Establish coding standards for the team',
    status: 'frozen',
    assignedTo: '2',
    createdBy: '1',
    priority: 'medium'
  }
];

const TasksContext = createContext();

export function useTasks() {
  return useContext(TasksContext);
}

export function TasksProvider({ children }) {
  const { currentUser, token } = useAuth();
  const [tasks, setTasks] = useState([]);

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get('/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const loadedTasks = res.data.tasks;
      if (loadedTasks.length === 0) {
        setTasks(initialTasks); // fallback к моковым задачам
      } else {
        setTasks(loadedTasks);
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
      setTasks(initialTasks); // fallback при ошибке сервера
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };
    if (!['admin', 'manager'].includes(currentUser.role)) {
      return { success: false, error: 'Permission denied' };
    }

    try {
      const res = await axios.post('/tasks', {
        ...taskData,
        status: 'todo',
        createdBy: currentUser.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
      return { success: true, task: res.data.task };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Create failed' };
    }
  };

  const updateTask = async (id, updates) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    const task = tasks.find(t => t.id === parseInt(id) || t.id === id); // поддержка string/id
    if (!task) return { success: false, error: 'Task not found' };

    if (updates.status && currentUser.role === 'worker' && task.assignedTo !== currentUser.id) {
      return { success: false, error: 'Permission denied' };
    }

    if ((updates.title || updates.description || updates.assignedTo) &&
      !['admin', 'manager'].includes(currentUser.role)) {
      return { success: false, error: 'Permission denied' };
    }

    try {
      const res = await axios.put(`/tasks/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
      return { success: true, task: res.data.task };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Update failed' };
    }
  };

  const deleteTask = async (id) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };
    if (!['admin', 'manager'].includes(currentUser.role)) {
      return { success: false, error: 'Permission denied' };
    }

    try {
      await axios.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Delete failed' };
    }
  };

  const getFilteredTasks = useCallback(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return tasks;
    if (currentUser.role === 'manager') {
      return tasks.filter(t => t.createdBy === currentUser.id || t.assignedTo === currentUser.id);
    }
    return tasks.filter(t => t.assignedTo === currentUser.id);
  }, [currentUser, tasks]);

  const getTasksByStatus = useCallback(() => {
    const filtered = getFilteredTasks();
    return {
      todo: filtered.filter(t => t.status === 'todo'),
      inprogress: filtered.filter(t => t.status === 'inprogress'),
      done: filtered.filter(t => t.status === 'done'),
      frozen: filtered.filter(t => t.status === 'frozen'),
    };
  }, [getFilteredTasks]);

  const value = {
    tasks,
    getFilteredTasks,
    getTasksByStatus,
    createTask,
    updateTask,
    deleteTask,
    fetchTasks
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
}
export default TasksContext;