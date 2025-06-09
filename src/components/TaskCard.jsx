import { useState, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import {
  FaTrash, FaEdit, FaExclamationCircle, FaRegCheckCircle,
  FaClock, FaPlay, FaStop
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../context/TasksContext'
import { formatDuration, intervalToDuration } from 'date-fns'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

function TaskCard({ task }) {
  const { currentUser } = useAuth()
  const { deleteTask, updateTask } = useTasks()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    let interval
    if (task.status === 'inprogress' && task.startTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - new Date(task.startTime).getTime()
        setElapsedTime(elapsed)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [task.status, task.startTime])

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id },
    canDrag: () => currentUser.role !== 'worker' || task.assignedTo === currentUser.id,
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }))

  const handleDelete = () => {
    if (window.confirm('Delete this task?')) deleteTask(task.id)
  }

  const handleSave = () => {
    updateTask(task.id, { title, description })
    setIsEditing(false)
  }

  const handleStartTask = () => {
    updateTask(task.id, {
      startTime: new Date().toISOString(),
      status: 'inprogress'
    })
  }

  const handleStopTask = () => {
    updateTask(task.id, {
      endTime: new Date().toISOString(),
      status: 'done',
      timeSpent: elapsedTime
    })
  }

  const formatTime = (ms) => {
    const duration = intervalToDuration({ start: 0, end: ms })
    return formatDuration(duration, { format: ['hours', 'minutes', 'seconds'] })
  }

  const getPriorityBadge = () => {
    const base = 'text-xs px-2 py-0.5 rounded-full font-medium'
    switch (task.priority) {
      case 'high':
        return <span className={`${base} bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400`}>High</span>
      case 'medium':
        return <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400`}>Medium</span>
      case 'low':
        return <span className={`${base} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`}>Low</span>
      default:
        return null
    }
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case 'inprogress':
        return <FaExclamationCircle className="text-yellow-500" title="In Progress" />
      case 'done':
        return <FaRegCheckCircle className="text-green-500" title="Completed" />
      case 'frozen':
        return <span className="text-gray-400" title="Frozen">❄️</span>
      default:
        return null
    }
  }

  return (
    <div
      ref={drag}
      className={`rounded-lg shadow-sm p-4 bg-white dark:bg-[#1F1F2C] border border-gray-200 dark:border-gray-700 transition
        ${isDragging ? 'opacity-50' : ''}`}
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            className="form-input w-full"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <ReactQuill
            theme="snow"
            value={description}
            onChange={setDescription}
            placeholder="Task description..."
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['clean']
              ],
            }}
          />
          <div className="flex justify-end space-x-2">
            <button className="btn-outline text-sm" onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="btn-primary text-sm" onClick={handleSave}>Save</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">{task.title}</h4>
            </div>
            {getPriorityBadge()}
          </div>

          <div
            className="text-sm text-gray-600 dark:text-gray-300 mb-1"
            dangerouslySetInnerHTML={{ __html: task.description }}
          />

          {task.projectName && (
            <p className="text-xs italic text-gray-500 dark:text-gray-400 mb-2">
              Project: {task.projectName}
            </p>
          )}

          {task.status === 'inprogress' && task.startTime && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
              <FaClock className="mr-1" />
              Time spent: {formatTime(elapsedTime)}
            </div>
          )}

          {task.status === 'todo' && (
            <button onClick={handleStartTask} className="text-primary-600 dark:text-primary-400 hover:underline text-sm mb-2 flex items-center">
              <FaPlay className="mr-1" /> Start
            </button>
          )}

          {task.status === 'inprogress' && (
            <button onClick={handleStopTask} className="text-red-600 dark:text-red-400 hover:underline text-sm mb-2 flex items-center">
              <FaStop className="mr-1" /> Complete
            </button>
          )}

          {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
            <div className="flex justify-end gap-3 text-gray-500 dark:text-gray-400 mt-2">
              <button onClick={() => setIsEditing(true)} title="Edit task">
                <FaEdit />
              </button>
              <button onClick={handleDelete} title="Delete task">
                <FaTrash />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TaskCard