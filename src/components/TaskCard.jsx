import { useState, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { FaTrash, FaEdit, FaExclamationCircle, FaRegCheckCircle, FaClock, FaPlay, FaStop } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../context/TasksContext'
import { formatDistanceToNow, formatDuration, intervalToDuration } from 'date-fns'

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
    canDrag: () => {
      if (currentUser.role === 'worker') {
        return task.assignedTo === currentUser.id
      }
      return true
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id)
    }
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
    switch (task.priority) {
      case 'high':
        return <span className="bg-error-100 text-error-800 text-xs px-2 py-1 rounded-full">High</span>
      case 'medium':
        return <span className="bg-warning-100 text-warning-800 text-xs px-2 py-1 rounded-full">Medium</span>
      case 'low':
        return <span className="bg-success-100 text-success-800 text-xs px-2 py-1 rounded-full">Low</span>
      default:
        return null
    }
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case 'todo':
        return null
      case 'inprogress':
        return <FaExclamationCircle className="text-yellow-500" title="In progress" />
      case 'done':
        return <FaRegCheckCircle className="text-green-500" title="Completed" />
      case 'frozen':
        return <span className="text-gray-500" title="Frozen">❄️</span>
      default:
        return null
    }
  }

  return (
    <div
      ref={drag}
      className={`task-card ${isDragging ? 'opacity-50' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            className="form-input text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />
          <textarea
            className="form-input text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
            rows={3}
          ></textarea>
          <div className="flex justify-end space-x-2">
            <button className="btn-outline text-sm py-1 px-2" onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="btn-primary text-sm py-1 px-2" onClick={handleSave}>Save</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <h4 className="font-medium text-gray-900">{task.title}</h4>
            </div>
            {getPriorityBadge()}
          </div>

          <p className="text-sm text-gray-600 mb-1">{task.description}</p>

          {task.projectName && (
            <div className="text-xs text-gray-500 italic mb-2">
              Project: {task.projectName}
            </div>
          )}

          {task.status === 'inprogress' && task.startTime && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <FaClock className="mr-1" />
              Time spent: {formatTime(elapsedTime)}
            </div>
          )}

          {task.status === 'todo' && (
            <button
              onClick={handleStartTask}
              className="flex items-center text-sm text-primary-600 hover:text-primary-700 mb-3"
            >
              <FaPlay className="mr-1" />
              Start Task
            </button>
          )}

          {task.status === 'inprogress' && (
            <button
              onClick={handleStopTask}
              className="flex items-center text-sm text-error-600 hover:text-error-700 mb-3"
            >
              <FaStop className="mr-1" />
              Complete Task
            </button>
          )}

          {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
            <div className="flex justify-end space-x-2 text-gray-500">
              <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-primary-600" title="Edit task">
                <FaEdit />
              </button>
              <button onClick={handleDelete} className="text-gray-500 hover:text-error-600" title="Delete task">
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
