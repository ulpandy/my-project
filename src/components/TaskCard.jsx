import { useState, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import {
  FaTrash, FaEdit, FaExclamationCircle, FaRegCheckCircle,
  FaClock, FaPlay, FaStop, FaPause
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'  // ✅ этот импорт обязателен
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
  const [isPaused, setIsPaused] = useState(false)
  const [pauseStartTime, setPauseStartTime] = useState(null)
  const [totalPausedTime, setTotalPausedTime] = useState(0)

  useEffect(() => {
    let interval
    if (task.status === 'inprogress' && task.startTime && !isPaused) {
      interval = setInterval(() => {
        const now = Date.now()
        const start = new Date(task.startTime).getTime()
        const activeTime = now - start - totalPausedTime
        setElapsedTime(activeTime)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [task.status, task.startTime, isPaused, totalPausedTime])

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id },
    canDrag: true,
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
    const now = new Date().toISOString()
    updateTask(task.id, {
      status: 'inprogress',
      startTime: now,
      endTime: null,
      timeSpent: null
    })
  }

  const handlePauseTask = () => {
    if (!isPaused) {
      setPauseStartTime(Date.now())
    } else {
      const pauseEnd = Date.now()
      const pauseDuration = pauseEnd - pauseStartTime
      setTotalPausedTime(prev => prev + pauseDuration)
      setPauseStartTime(null)
    }
    setIsPaused(!isPaused)
  }

  const handleStopTask = () => {
    if (!task.startTime) {
      alert('Cannot complete task: start time is missing.')
      return
    }

    const now = new Date()
    const start = new Date(task.startTime)
    const rawTime = now.getTime() - start.getTime() - totalPausedTime
    const timeSpent = Math.max(rawTime, 1000)

    updateTask(task.id, {
      status: 'done',
      endTime: now.toISOString(),
      timeSpent
    })

    setIsPaused(false)
    setTotalPausedTime(0)
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
        return isPaused 
          ? <span className="text-gray-400" title="Paused">⏸</span>
          : <FaExclamationCircle className="text-yellow-500" title="In Progress" />
      case 'done':
        return <FaRegCheckCircle className="text-green-500" title="Completed" />
      case 'frozen':
        return <span className="text-gray-400" title="Frozen">❄️</span>
      default:
        return null
    }
  }

  const getFormattedTimeSpent = () => {
    if (typeof task.timeSpent === 'number') {
      return formatTime(task.timeSpent)
    } else if (task.startTime && task.endTime) {
      const start = new Date(task.startTime)
      const end = new Date(task.endTime)
      const fallbackTime = Math.max(end - start, 1000)
      return formatTime(fallbackTime)
    } else {
      return 'Not tracked'
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

          {task.startTime && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              <strong>Start:</strong> {new Date(task.startTime).toLocaleString()}
            </div>
          )}

          {task.endTime && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              <strong>End:</strong> {new Date(task.endTime).toLocaleString()}
            </div>
          )}

          {task.status === 'inprogress' && task.startTime && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
              <FaClock className="mr-1" />
              Time spent: {formatTime(elapsedTime)}
              {isPaused && <span className="ml-1 text-gray-400">(paused)</span>}
            </div>
          )}

          {task.status === 'done' && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
              <FaClock className="mr-1" />
              <span className="font-medium">Time spent:</span>&nbsp;
              {getFormattedTimeSpent()}
            </div>
          )}

          <div className="flex gap-2">
            {task.status === 'todo' && (
              <button 
                onClick={handleStartTask} 
                className="text-primary-600 dark:text-primary-400 hover:underline text-sm mb-2 flex items-center"
              >
                <FaPlay className="mr-1" /> Start
              </button>
            )}

            {task.status === 'inprogress' && (
              <>
                <button 
                  onClick={handlePauseTask} 
                  className="text-yellow-600 dark:text-yellow-400 hover:underline text-sm mb-2 flex items-center"
                >
                  <FaPause className="mr-1" /> {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button 
                  onClick={handleStopTask} 
                  className="text-red-600 dark:text-red-400 hover:underline text-sm mb-2 flex items-center"
                >
                  <FaStop className="mr-1" /> Complete
                </button>
              </>
            )}
          </div>

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
