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
import { FaLayerGroup, FaCheck, FaBolt, FaClock } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../context/TasksContext'
import { format, startOfWeek, eachDayOfInterval, addDays, isValid } from 'date-fns'

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
    const workerTasks = tasks.filter(task => task.assignedTo === currentUser.id)
    const completed = workerTasks.filter(task => task.status === 'done')
    const totalTime = completed.reduce((acc, task) => acc + (task.timeSpent || 0), 0)

    setMetrics({
      totalTasks: workerTasks.length,
      completedTasks: completed.length,
      averageTime: completed.length ? totalTime / completed.length : 0,
      efficiency: workerTasks.length ? (completed.length / workerTasks.length) * 100 : 0
    })
  }, [tasks, currentUser.id])

  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')

  const completionData = {
    labels: weekDays.map(day => format(day, 'EEE')),
    datasets: [{
      label: 'Tasks Completed',
      data: weekDays.map(day => tasks.filter(task => {
        if (task.assignedTo !== currentUser.id || task.status !== 'done' || !task.endTime) return false
        const endDate = new Date(task.endTime)
        return isValid(endDate) && format(endDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      }).length),
      backgroundColor: isDark ? '#BFA5FF' : '#A5D8FF',
      borderColor: isDark ? '#7C3AED' : '#60A5FA',
      borderWidth: 2
    }]
  }

  const distributionData = {
    labels: ['Completed', 'In Progress', 'To Do', 'Frozen'],
    datasets: [{
      data: [
        tasks.filter(t => t.assignedTo === currentUser.id && t.status === 'done').length,
        tasks.filter(t => t.assignedTo === currentUser.id && t.status === 'inprogress').length,
        tasks.filter(t => t.assignedTo === currentUser.id && t.status === 'todo').length,
        tasks.filter(t => t.assignedTo === currentUser.id && t.status === 'frozen').length
      ],
      backgroundColor: isDark
        ? ['#60D394', '#FFD479', '#BFA5FF', '#5C5F66']
        : ['#A5D8FF', '#FFD59E', '#D0BCFF', '#E2E8F0'],
      borderColor: isDark
        ? ['#60D394', '#FFD479', '#BFA5FF', '#5C5F66']
        : ['#A5D8FF', '#FFD59E', '#D0BCFF', '#E2E8F0'],
      borderWidth: 1
    }]
  }

  const timeData = {
    labels: weekDays.map(day => format(day, 'EEE')),
    datasets: [{
      label: 'Hours Worked',
      data: weekDays.map(day => tasks.filter(task => {
        if (task.assignedTo !== currentUser.id || !task.endTime) return false
        const endDate = new Date(task.endTime)
        return isValid(endDate) && format(endDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      }).reduce((acc, task) => acc + ((task.timeSpent || 0) / (1000 * 60 * 60)), 0)),
      fill: true,
      backgroundColor: isDark ? 'rgba(191,165,255,0.2)' : 'rgba(165,216,255,0.2)',
      borderColor: isDark ? '#BFA5FF' : '#60A5FA',
      tension: 0.4
    }]
  }

  return (
    <div className="space-y-6 bg-neutral-light dark:bg-dark-600 text-gray-900 dark:text-white p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Performance</h1>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="form-input py-1 bg-white dark:bg-dark-400 dark:text-white">
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<FaLayerGroup />} color="info" label="Total Tasks" value={metrics.totalTasks} />
        <StatCard icon={<FaCheck />} color="success" label="Completed" value={metrics.completedTasks} />
        <StatCard icon={<FaBolt />} color="warning" label="Efficiency" value={`${Math.round(metrics.efficiency)}%`} />
        <StatCard icon={<FaClock />} color="neutral" label="Avg. Time per Task" value={`${Math.round(metrics.averageTime / (1000 * 60 * 60))}h`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white dark:bg-dark-500 p-4 rounded-xl shadow-soft">
          <h2 className="text-lg font-semibold mb-4">Task Completion</h2>
          <Bar data={completionData} options={{ responsive: true, plugins: { legend: { position: 'top' }}}} />
        </div>
        <div className="card bg-white dark:bg-dark-500 p-4 rounded-xl shadow-soft">
          <h2 className="text-lg font-semibold mb-4">Task Distribution</h2>
          <div className="aspect-square">
            <Doughnut data={distributionData} options={{ responsive: true, plugins: { legend: { position: 'top' }}}} />
          </div>
        </div>
      </div>

      <div className="card bg-white dark:bg-dark-500 p-4 rounded-xl shadow-soft">
        <h2 className="text-lg font-semibold mb-4">Time Tracking</h2>
        <Line data={timeData} options={{ responsive: true, plugins: { legend: { position: 'top' }}, scales: { y: { beginAtZero: true, title: { display: true, text: 'Hours' }}} }} />
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color = 'primary' }) {
  const bgMap = {
    info: 'bg-info/20 text-info',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    neutral: 'bg-neutral/20 text-neutral-dark',
    primary: 'bg-primary-100 text-primary-500'
  }

  return (
    <div className="card bg-white dark:bg-dark-500 p-4 rounded-xl shadow-soft flex items-center">
      <div className={`p-3 rounded-lg ${bgMap[color]} text-xl`}>{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  )
}

export default WorkerAnalytics