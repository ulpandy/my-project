import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { FaUsers, FaTasks, FaCheckCircle, FaClock, FaFilePdf } from 'react-icons/fa'
import { useTasks } from '../context/TasksContext'
import axios from 'axios'
import { saveAs } from 'file-saver'
import { intervalToDuration, formatDuration } from 'date-fns'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

function TeamAnalytics() {
  const { filteredTasks } = useTasks()
  const [userRoles, setUserRoles] = useState({})
  const [teamMetrics, setTeamMetrics] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalTasks: 0,
    completedTasks: 0,
    averageCompletionTime: 0
  })

  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')

  const downloadPdf = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Authorization token not found')
        return
      }

      const now = new Date()
      const startDate = new Date(now)
      const endDate = new Date(now)
      startDate.setDate(startDate.getDate() - 7)
      endDate.setDate(endDate.getDate() + 1)

      const formatDate = (date) => date.toISOString().split('T')[0]

      const response = await axios.get('http://localhost:3000/api/activity/pdf', {
        params: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate)
        },
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      })

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' })
      saveAs(pdfBlob, 'activity-report.pdf')
    } catch (error) {
      console.error('Failed to download PDF:', error)
      alert('PDF download failed')
    }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3000/api/users/with-activity', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) throw new Error('Failed to fetch users')
        const users = await res.json()

        const active = users.filter(u => u.tasks && u.tasks.length > 0).length

        const rolesMap = {}
        users.forEach(user => {
          rolesMap[user.id] = user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
        })

        setUserRoles(rolesMap)
        setTeamMetrics(prev => ({
          ...prev,
          totalMembers: users.length,
          activeMembers: active
        }))
      } catch (err) {
        console.error('Error loading users:', err)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    const completed = filteredTasks.filter(task => task.status === 'done')

    const totalTime = completed.reduce((acc, task) => {
      if (task.startTime && task.endTime) {
        const start = new Date(task.startTime)
        const end = new Date(task.endTime)
        if (!isNaN(start) && !isNaN(end)) {
          return acc + (end - start)
        }
      }
      return acc
    }, 0)

    setTeamMetrics(prev => ({
      ...prev,
      totalTasks: filteredTasks.length,
      completedTasks: completed.length,
      averageCompletionTime: completed.length ? totalTime / completed.length : 0
    }))
  }, [filteredTasks])

  const taskCountsByRole = { Admin: 0, Manager: 0, Worker: 0 }
  const completionRateByRole = {
    Admin: { total: 0, done: 0 },
    Manager: { total: 0, done: 0 },
    Worker: { total: 0, done: 0 }
  }

  filteredTasks.forEach(task => {
    const role = userRoles[task.assignedTo] || 'Worker'
    if (taskCountsByRole[role] !== undefined) {
      taskCountsByRole[role] += 1
    }
    if (completionRateByRole[role]) {
      completionRateByRole[role].total += 1
      if (task.status === 'done') {
        completionRateByRole[role].done += 1
      }
    }
  })

  const taskDistributionData = {
    labels: ['Admin', 'Manager', 'Worker'],
    datasets: [
      {
        label: 'Tasks by Role',
        data: [
          taskCountsByRole.Admin,
          taskCountsByRole.Manager,
          taskCountsByRole.Worker
        ],
        backgroundColor: isDark ? ['#BFA5FF', '#FFD479', '#60D394'] : ['#A5D8FF', '#FFD59E', '#D0BCFF']
      }
    ]
  }

  const completionRateData = {
    labels: ['Admin', 'Manager', 'Worker'],
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: ['Admin', 'Manager', 'Worker'].map(role => {
          const { total, done } = completionRateByRole[role]
          return total ? Math.round((done / total) * 100) : 0
        }),
        backgroundColor: isDark ? ['#BFA5FF', '#FFD479', '#60D394'] : ['#A5D8FF', '#FFD59E', '#D0BCFF']
      }
    ]
  }

  const formatAvgTime = (ms) => {
    if (ms === 0) return '0 min'
    const duration = intervalToDuration({ start: 0, end: ms })
    return formatDuration(duration, { format: ['hours', 'minutes'] })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Analytics</h1>
        <button
          onClick={downloadPdf}
          className="btn-outline flex items-center space-x-2 px-4 py-2 rounded border border-primary-500 text-primary-500 hover:bg-primary-50 transition"
        >
          <FaFilePdf />
          <span>Download PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-6 shadow-card bg-white text-gray-900 dark:bg-dark-500 dark:text-white">
          <FaUsers className="inline-block mr-2" /> Members: {teamMetrics.activeMembers}/{teamMetrics.totalMembers}
        </div>
        <div className="rounded-xl p-6 shadow-card bg-white text-gray-900 dark:bg-dark-500 dark:text-white">
          <FaTasks className="inline-block mr-2" /> Total Tasks: {teamMetrics.totalTasks}
        </div>
        <div className="rounded-xl p-6 shadow-card bg-white text-gray-900 dark:bg-dark-500 dark:text-white">
          <FaCheckCircle className="inline-block mr-2" /> Completed: {teamMetrics.completedTasks}
        </div>
        <div className="rounded-xl p-6 shadow-card bg-white text-gray-900 dark:bg-dark-500 dark:text-white">
          <FaClock className="inline-block mr-2" /> Avg. Time: {formatAvgTime(teamMetrics.averageCompletionTime)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-dark-500 p-6 rounded-xl shadow-card">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Task Distribution</h2>
          <Bar
            data={taskDistributionData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 1, precision: 0 }
                }
              }
            }}
          />
        </div>

        <div className="bg-white dark:bg-dark-500 p-6 rounded-xl shadow-card">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Completion Rate</h2>
          <Bar
            data={completionRateData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: { display: true, text: '%' }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default TeamAnalytics
