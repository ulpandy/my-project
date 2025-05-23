import { useDrop } from 'react-dnd'
import TaskCard from './TaskCard'
import { useTasks } from '../context/TasksContext'
import { useAuth } from '../context/AuthContext'

function TaskColumn({ status, title, tasks }) {
  const { updateTask } = useTasks()
  const { currentUser } = useAuth()
  
  // Set up drop target
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item) => {
      handleDrop(item.id)
    },
    canDrop: (item) => {
      // Workers can only move their own tasks
      if (currentUser.role === 'worker') {
        const task = tasks.find(t => t.id === item.id)
        return task && task.assignedTo === currentUser.id
      }
      return true
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }))
  
  const handleDrop = (taskId) => {
    updateTask(taskId, { status })
  }
  
  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'todo':
        return 'border-blue-500 bg-blue-50'
      case 'inprogress':
        return 'border-yellow-500 bg-yellow-50'
      case 'done':
        return 'border-green-500 bg-green-50'
      case 'frozen':
        return 'border-gray-500 bg-gray-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }
  
  return (
    <div 
      ref={drop}
      className={`task-column ${getStatusColor()} border-t-4 ${isOver ? 'ring-2 ring-primary-500' : ''}`}
    >
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-md">
          No tasks
        </div>
      ) : (
        tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))
      )}
    </div>
  )
}

export default TaskColumn