// src/pages/Tasks.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { FaSortUp, FaSortDown, FaSort, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TasksContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Tasks() {
  const { currentUser } = useAuth();
  const { tasks, getFilteredTasks, createTask, deleteTask } = useTasks();

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    assignedRole: 'Worker',
    priority: 'medium',
    projectId: '',
  });

  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAvailableUsers(data);
      } catch (e) {
        console.error('Error loading users:', e);
      }
    };

    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAvailableProjects(data);
      } catch (e) {
        console.error('Error loading projects:', e);
      }
    };

    fetchUsers();
    fetchProjects();
  }, []);

  const filteredTasks = useMemo(() => getFilteredTasks(), [tasks, getFilteredTasks]);

  const handleCreateTask = async () => {
    const taskToSend = { ...newTask };
    if (!taskToSend.projectId) delete taskToSend.projectId;

    const result = await createTask(taskToSend);
    if (!result.success) {
      alert(result.error || 'Failed to create task');
      return;
    }

    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      assignedRole: 'Worker',
      priority: 'medium',
      projectId: '',
    });
    setIsCreating(false);
  };

  const handleDelete = async taskId => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const result = await deleteTask(taskId);
      if (!result.success) alert(result.error || 'Failed to delete task');
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: info => <div className="font-medium">{info.getValue() || '—'}</div>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: info => {
          const status = info.getValue();
          const className = {
            done: 'bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100',
            inprogress: 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100',
            frozen: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
            todo: 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100',
          }[status] || 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100';

          return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${className}`}>
              {status || '—'}
            </span>
          );
        },
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: info => {
          const priority = info.getValue();
          const className = {
            high: 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100',
            medium: 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100',
            low: 'bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100',
          }[priority] || 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100';

          return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${className}`}>
              {priority || '—'}
            </span>
          );
        },
      },
      {
        accessorKey: 'assignedToName',
        header: 'Assigned To',
        cell: info => info.getValue() || '—',
      },
      {
        accessorKey: 'projectName',
        header: 'Project',
        cell: info => info.getValue() || '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: info => (
          <div className="flex space-x-2 justify-center">
            <button
              onClick={() => alert('Edit not implemented')}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              title="Edit"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDelete(info.row.original.id)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
              title="Delete"
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredTasks || [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-6 p-6 dark:bg-[#1D0036] min-h-screen text-gray-900 dark:text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search tasks..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="border rounded px-3 py-2 bg-white dark:bg-[#2D2040] dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={() => setIsCreating(true)}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded flex items-center space-x-2"
          >
            <FaPlus />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="border rounded p-6 bg-white dark:bg-[#2D2040] shadow max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
          <div className="space-y-4">
            <input
              type="text"
              className="w-full border rounded px-3 py-2 dark:bg-[#1D0036] dark:text-white"
              placeholder="Title"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            />
            <ReactQuill
              theme="snow"
              value={newTask.description}
              onChange={value => setNewTask({ ...newTask, description: value })}
            />
            <select
              className="w-full border rounded px-3 py-2 dark:bg-[#1D0036] dark:text-white"
              value={newTask.assignedTo}
              onChange={e => {
                const userId = e.target.value;
                const user = availableUsers.find(u => u.id === userId);
                setNewTask({
                  ...newTask,
                  assignedTo: userId,
                  assignedRole: user?.role || 'Worker',
                });
              }}
            >
              <option value="">Select user</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            <select
              className="w-full border rounded px-3 py-2 dark:bg-[#1D0036] dark:text-white"
              value={newTask.priority}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              className="w-full border rounded px-3 py-2 dark:bg-[#1D0036] dark:text-white"
              value={newTask.projectId}
              onChange={e => setNewTask({ ...newTask, projectId: e.target.value })}
            >
              <option value="">Select project</option>
              {availableProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <div className="flex space-x-4">
              <button className="btn-primary" onClick={handleCreateTask}>Create</button>
              <button className="btn-outline" onClick={() => setIsCreating(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
        <thead className="bg-gray-100 dark:bg-[#2D2040]">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    onClick={header.column.getToggleSortingHandler()}
                    className="border border-gray-300 dark:border-gray-600 px-4 py-2 cursor-pointer"
                    title="Click to sort"
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                      <span>
                        {sorted === 'asc' ? <FaSortUp /> : sorted === 'desc' ? <FaSortDown /> : <FaSort />}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-100 dark:hover:bg-[#33144d]">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}