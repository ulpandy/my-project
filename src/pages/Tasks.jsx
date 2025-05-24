import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender
} from '@tanstack/react-table';
import { FaSort, FaSortUp, FaSortDown, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TasksContext';

function Tasks() {
  const { currentUser } = useAuth();
  const { tasks, getFilteredTasks, createTask, deleteTask } = useTasks();
console.log("📦 Raw tasks:", tasks);
  const filteredTasks = useMemo(() => {
  const result = getFilteredTasks();
  console.log("🎯 Filtered tasks:", result);
  return result;
}, [tasks, getFilteredTasks]);

console.log("👤 Current user:", currentUser?.id);

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium'
  });

  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setAvailableUsers(data);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    fetchUsers();
  }, []);

  const columns = useMemo(() => [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: info => <div className="font-medium">{info.getValue() || '—'}</div>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        const className = {
          done: 'bg-green-100 text-green-800',
          inprogress: 'bg-yellow-100 text-yellow-800',
          frozen: 'bg-gray-100 text-gray-800',
          todo: 'bg-blue-100 text-blue-800'
        }[status] || 'bg-gray-200 text-gray-800';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
            {status || '—'}
          </span>
        );
      }
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: info => {
        const priority = info.getValue();
        const className = {
          high: 'bg-red-100 text-red-800',
          medium: 'bg-yellow-100 text-yellow-800',
          low: 'bg-green-100 text-green-800'
        }[priority] || 'bg-gray-200 text-gray-800';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
            {priority || '—'}
          </span>
        );
      }
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: info => {
        const task = info.row.original;
        return (
          <div>
            {task.assignedToName || '—'}
          </div>
        );
      }
    },
    {
      accessorKey: 'timeSpent',
      header: 'Time Spent',
      cell: info => {
        const task = info.row?.original;
        if (!task || !task.startTime) return '—';
        try {
          const end = task.endTime ? new Date(task.endTime) : new Date();
          const start = new Date(task.startTime);
          const hours = Math.round((end - start) / (1000 * 60 * 60));
          return `${hours}h`;
        } catch {
          return '—';
        }
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <div className="flex space-x-2">
          <button
            onClick={() => console.log('Edit not implemented')}
            className="text-blue-600 hover:text-blue-800"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(info.row.original.id)}
            className="text-red-600 hover:text-red-800"
          >
            <FaTrash />
          </button>
        </div>
      )
    }
  ], []);

  const table = useReactTable({
    data: filteredTasks || [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  const handleCreateTask = async () => {
    const result = await createTask(newTask);
    if (!result.success) {
      alert(result.error || 'Failed to create task');
    }
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium'
    });
    setIsCreating(false);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const result = await deleteTask(taskId);
      if (!result.success) {
        alert(result.error || 'Failed to delete task');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search tasks..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="form-input"
          />
          <button onClick={() => setIsCreating(true)} className="btn-primary flex items-center">
            <FaPlus className="mr-2" />
            New Task
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                className="form-input mt-1"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="form-input mt-1"
                value={newTask.description}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned To</label>
              <select
                className="form-input mt-1"
                value={newTask.assignedTo}
                onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
              >
                <option value="">Select user</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                className="form-input mt-1"
                value={newTask.priority}
                onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsCreating(false)} className="btn-outline">
                Cancel
              </button>
              <button onClick={handleCreateTask} className="btn-primary">
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      {header.column.getCanSort() && (
                        <span>
                          {{ asc: <FaSortUp />, desc: <FaSortDown /> }[header.column.getIsSorted()] ?? <FaSort />}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Tasks;
