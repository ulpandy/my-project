import { useState, useEffect } from 'react'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { FaChartBar, FaClock, FaTasks, FaCheckCircle } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../context/TasksContext'
import { format, startOfWeek, eachDayOfInterval, addDays, isValid } from 'date-fns'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
)

function WorkerAnalytics() {
  const { currentUser } = useAuth()
  const { getFilteredTasks } = useTasks()
  const [dateRange, setDateRange] = useState('week')
  const [metrics, setMetrics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    averageTime: 0,
    efficiency: 0
  })

  const tasks = getFilteredTasks()
  const startOfCurrentWeek = startOfWeek(new Date())
  const weekDays = eachDayOfInterval({
    start: startOfCurrentWeek,
    end: addDays(startOfCurrentWeek, 6)
  })

  useEffect(() => {
    // Calculate worker-specific metrics
    const workerTasks = tasks.filter(task => task.assignedTo === currentUser.id)
    const completed = workerTasks.filter(task => task.status === 'done')
    
    const totalTime = completed.reduce((acc, task) => {
      return acc + (task.timeSpent || 0)
    }, 0)

    setMetrics({
      totalTasks: workerTasks.length,
      completedTasks: completed.length,
      averageTime: completed.length ? totalTime / completed.length : 0,
      efficiency: workerTasks.length ? (completed.length / workerTasks.length) * 100 : 0
    })
  }, [tasks, currentUser.id])

  // Task completion by day
  const completionData = {
    labels: weekDays.map(day => format(day, 'EEE')),
    datasets: [{
      label: 'Tasks Completed',
      data: weekDays.map(day => {
        return tasks.filter(task => {
          if (task.assignedTo !== currentUser.id || task.status !== 'done' || !task.endTime) {
            return false
          }
          const endDate = new Date(task.endTime)
          return format(endDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        }).length
      }),
      backgroundColor: 'rgba(37, 99, 235, 0.5)',
      borderColor: 'rgb(37, 99, 235)',
      borderWidth: 1
    }]
  }

  // Task status distribution
  const distributionData = {
    labels: ['Completed', 'In Progress', 'To Do', 'Frozen'],
    datasets: [{
      data: [
        tasks.filter(t => t.assignedTo === currentUser.id && t.status === 'done').length,
        tasks.filter(t => t.assignedTo === currentUser.id && t.status === 'inprogress').length,
        tasks.filter(t => t.assignedTo === currentUser.id && t.status === 'todo').length,
        tasks.filter(t => t.assignedTo === currentUser.id && t.status === 'frozen').length
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.5)',
        'rgba(245, 158, 11, 0.5)',
        'rgba(59, 130, 246, 0.5)',
        'rgba(156, 163, 175, 0.5)'
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(245, 158, 11)',
        'rgb(59, 130, 246)',
        'rgb(156, 163, 175)'
      ],
      borderWidth: 1
    }]
  }

  // Time tracking data
  const timeData = {
    labels: weekDays.map(day => format(day, 'EEE')),
    datasets: [{
      label: 'Hours Worked',
      data: weekDays.map(day => {
        const dayTasks = tasks.filter(task => {
          if (task.assignedTo !== currentUser.id || !task.endTime) {
            return false
          }
          const endDate = new Date(task.endTime)
          return format(endDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        })
        
        return dayTasks.reduce((acc, task) => {
          return acc + ((task.timeSpent || 0) / (1000 * 60 * 60)) // Convert ms to hours
        }, 0)
      }),
      fill: true,
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      borderColor: 'rgb(37, 99, 235)',
      tension: 0.4
    }]
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Performance</h1>
        
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="form-input py-1"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaTasks className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaCheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FaChartBar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Efficiency</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(metrics.efficiency)}%
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaClock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Time per Task</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(metrics.averageTime / (1000 * 60 * 60))}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Task Completion</h2>
          <Bar 
            data={completionData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: false
                }
              }
            }}
          />
        </div>

        <div className="card bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Task Distribution</h2>
          <div className="aspect-square">
            <Doughnut 
              data={distributionData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="card bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">Time Tracking</h2>
        <Line 
          data={timeData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Hours'
                }
              }
            }
          }}
        />
      </div>
    </div>
  )
}

export default WorkerAnalytics