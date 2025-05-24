import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000/api';

const TasksContext = createContext();

export function useTasks() {
  return useContext(TasksContext);
}

export function TasksProvider({ children }) {
  const { currentUser, token } = useAuth();
  const [tasks, setTasks] = useState([]); // ✅ всегда инициализируем как массив

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get('/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(Array.isArray(res.data) ? res.data : []); // ✅ защита от undefined
    } catch (err) {
      console.error('Error loading tasks:', err);
      setTasks([]);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };
    if (!['admin', 'manager'].includes(currentUser.role)) {
      return { success: false, error: 'Permission denied' };
      console.log("✅ Created task:", created);
    }

    try {
      const res = await axios.post('/tasks', {
        ...taskData,
        status: 'todo',
        createdBy: currentUser.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const created = res.data;
      setTasks(prev => Array.isArray(prev) ? [...prev, created] : [created]);
      return { success: true, task: created };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Create failed'
      };
    }
  };

  const updateTask = async (id, updates) => {
  if (!currentUser) return { success: false, error: 'Not authenticated' };

  const task = tasks.find(t => t?.id === id || t?.id === parseInt(id));
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

    const updated = res.data; // <= или res.data.task — смотри по своему backend
    if (!updated || !updated.id) throw new Error('Invalid task format');

    setTasks(prev => {
      if (!Array.isArray(prev)) return [updated];
      return prev
        .filter(t => t && typeof t === 'object' && 'id' in t)
        .map(t => (t.id === updated.id ? updated : t));
    });

    return { success: true, task: updated };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.message || 'Update failed'
    };
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

      setTasks(prev => Array.isArray(prev) ? prev.filter(t => t.id !== id) : []);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Delete failed'
      };
    }
  };

const getFilteredTasks = useCallback(() => {
  if (!currentUser) return [];

  // 💡 защита от null/undefined
  const validTasks = Array.isArray(tasks)
    ? tasks.filter(t => t && typeof t === 'object' && 'status' in t)
    : [];

  if (currentUser.role === 'admin') return validTasks;

  if (currentUser.role === 'manager') {
    return validTasks.filter(
      t => t.createdBy === currentUser.id || t.assignedTo === currentUser.id
    );
  }

  return validTasks.filter(t => t.assignedTo === currentUser.id);
}, [currentUser, tasks]);


  const getTasksByStatus = useCallback(() => {
    const filtered = getFilteredTasks();
    return {
      todo: filtered.filter(t => t.status === 'todo'),
      inprogress: filtered.filter(t => t.status === 'inprogress'),
      done: filtered.filter(t => t.status === 'done'),
      frozen: filtered.filter(t => t.status === 'frozen')
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