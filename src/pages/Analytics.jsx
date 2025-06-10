import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../context/TasksContext'
import {
  isValid,
  isSameDay,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  formatDuration,
  intervalToDuration
} from 'date-fns'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
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
import { FaLayerGroup, FaCheck, FaBolt, FaClock } from 'react-icons/fa'

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
  const [timeStats, setTimeStats] = useState(Array(7).fill(0))
  const [taskTimeStats, setTaskTimeStats] = useState(Array(7).fill(0))
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const tasks = getFilteredTasks()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const parseDate = (value) => {
    if (!value) return null
    return typeof value === 'string' ? new Date(value + 'Z') : new Date(value)
  }

  useEffect(() => {
    const workerTasks = tasks.filter(t => t.assignedTo === currentUser.id)
    const completed = workerTasks.filter(t => t.status === 'done')
    const totalTime = completed.reduce((sum, t) => sum + (t.timeSpent || 0), 0)

    setMetrics({
      totalTasks: workerTasks.length,
      completedTasks: completed.length,
      averageTime: completed.length ? totalTime / completed.length : 0,
      efficiency: workerTasks.length ? (completed.length / workerTasks.length) * 100 : 0
    })
  }, [tasks, currentUser.id])

  const getDateRange = () => {
    const now = new Date()
    switch (dateRange) {
      case 'day':
        return {
          start: new Date(now.setHours(0, 0, 0, 0)),
          end: new Date(now.setHours(23, 59, 59, 999))
        }
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'week':
      default:
        return { start: startOfWeek(now), end: endOfWeek(now) }
    }
  }

  useEffect(() => {
    const fetchWorkedHours = async () => {
      try {
        const { start, end } = getDateRange()
        const res = await fetch(`/api/activity/worked-hours?startDate=${start.toISOString()}&endDate=${end.toISOString()}`)
        const data = await res.json()
        setTimeStats(data)
      } catch (err) {
        console.error('Failed to fetch worked hours', err)
      }
    }

    fetchWorkedHours()
  }, [dateRange])

  useEffect(() => {
    const { start, end } = getDateRange()
    const values = Array(7).fill(0)

    tasks.forEach(task => {
      if (task.assignedTo !== currentUser.id || task.status !== 'done' || !task.endTime || !task.timeSpent) return
      const endDate = parseDate(task.endTime)
      if (isValid(endDate) && isWithinInterval(endDate, { start, end })) {
        const day = endDate.getDay()
        values[day] += task.timeSpent / 3600000 // в часах
      }
    })

    setTaskTimeStats(values)
  }, [tasks, dateRange, currentUser.id])

  const completionData = useMemo(() => {
    const { start, end } = getDateRange()
    return {
      labels: dateRange === 'day' ? ['Today'] : weekDays,
      datasets: [{
        label: 'Tasks Completed',
        data: dateRange === 'day'
          ? [
              tasks.filter(task => {
                if (
                  task.assignedTo !== currentUser.id ||
                  task.status !== 'done' ||
                  !task.endTime
                ) return false
                const endDate = parseDate(task.endTime)
                return isValid(endDate) && isSameDay(endDate, new Date())
              }).length
            ]
          : weekDays.map((_, index) => {
              return tasks.filter(task => {
                if (
                  task.assignedTo !== currentUser.id ||
                  task.status !== 'done' ||
                  !task.endTime
                ) return false
                const endDate = parseDate(task.endTime)
                return isValid(endDate) &&
                  isWithinInterval(endDate, { start, end }) &&
                  endDate.getDay() === index
              }).length
            }),
        backgroundColor: isDark ? '#BFA5FF' : '#A5D8FF',
        borderColor: isDark ? '#7C3AED' : '#60A5FA',
        borderWidth: 2
      }]
    }
  }, [tasks, dateRange, currentUser.id, isDark])

  const distributionData = useMemo(() => ({
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
  }), [tasks, currentUser.id, isDark])

  const timeData = useMemo(() => ({
    labels: weekDays,
    datasets: [{
      label: 'Hours Worked (from logs)',
      data: timeStats,
      fill: true,
      backgroundColor: isDark ? 'rgba(191,165,255,0.2)' : 'rgba(165,216,255,0.2)',
      borderColor: isDark ? '#BFA5FF' : '#60A5FA',
      tension: 0.4
    }, {
      label: 'Hours by Tasks (timeSpent)',
      data: taskTimeStats,
      fill: false,
      borderColor: isDark ? '#FFD479' : '#F59E0B',
      backgroundColor: isDark ? 'rgba(255,212,121,0.3)' : 'rgba(245,158,11,0.3)',
      tension: 0.4,
      borderDash: [5, 5]
    }]
  }), [timeStats, taskTimeStats, isDark])

  return (
    <div className="space-y-6 bg-neutral-light dark:bg-dark-600 text-gray-900 dark:text-white p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Performance</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="form-input py-1 bg-white dark:bg-dark-400 dark:text-white"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<FaLayerGroup />} color="info" label="Total Tasks" value={metrics.totalTasks} />
        <StatCard icon={<FaCheck />} color="success" label="Completed" value={metrics.completedTasks} />
        <StatCard icon={<FaBolt />} color="warning" label="Efficiency" value={`${Math.round(metrics.efficiency)}%`} />
        <StatCard icon={<FaClock />} color="neutral" label="Avg. Time per Task" value={
          metrics.averageTime > 0
            ? formatDuration(intervalToDuration({ start: 0, end: metrics.averageTime }), {
                format: ['hours', 'minutes', 'seconds']
              })
            : '0s'
        } />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white dark:bg-dark-500 p-4 rounded-xl shadow-soft">
          <h2 className="text-lg font-semibold mb-4">Task Completion - {dateRange === 'day' ? 'Today' : dateRange === 'week' ? 'This Week' : 'This Month'}</h2>
          <Bar data={completionData} options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              tooltip: {
                callbacks: {
                  label: context =>
                    context.raw === 0 ? 'No tasks completed' : `${context.raw} task${context.raw !== 1 ? 's' : ''} completed`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { precision: 0 }
              }
            }
          }} />
        </div>

        <div className="card bg-white dark:bg-dark-500 p-4 rounded-xl shadow-soft">
          <h2 className="text-lg font-semibold mb-4">Task Distribution</h2>
          <div className="aspect-square">
            <Doughnut data={distributionData} options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                tooltip: {
                  callbacks: {
                    label: context => {
                      const total = context.dataset.data.reduce((a, b) => a + b, 0)
                      const value = context.raw
                      const percentage = Math.round((value / total) * 100)
                      return `${context.label}: ${value} (${percentage}%)`
                    }
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>

      <div className="card bg-white dark:bg-dark-500 p-4 rounded-xl shadow-soft">
       <h2 className="text-lg font-semibold mb-4">
         Time Tracking — Summary:
         <span className="ml-2 text-sm text-gray-500 dark:text-gray-300">
          {(Array.isArray(timeStats) ? timeStats.reduce((a, b) => a + b, 0) : 0).toFixed(1)}h (logs),{' '}
          {(Array.isArray(taskTimeStats) ? taskTimeStats.reduce((a, b) => a + b, 0) : 0).toFixed(1)}h (tasks)
         </span>
       </h2>

        <Line data={timeData} options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              callbacks: {
                label: context => `${context.raw.toFixed(1)} hours`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Hours' }
            }
          }
        }} />
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
