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

  const downloadPdf = async () => {
    try {
      const token = localStorage.getItem('token')
      const startDate = '2025-06-01'  // Можно сделать динамическим
      const endDate = '2025-06-07'

      const response = await axios.get('http://localhost:3000/api/activity/pdf', {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${token}` },
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

        const active = users.filter(u => u.is_active).length

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
        return acc + (new Date(task.endTime) - new Date(task.startTime))
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
        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981']
      }
    ]
  }

  const completionRateData = {
    labels: ['Admin', 'Manager', 'Worker'],
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: [
          completionRateByRole.Admin.total
            ? Math.round((completionRateByRole.Admin.done / completionRateByRole.Admin.total) * 100)
            : 0,
          completionRateByRole.Manager.total
            ? Math.round((completionRateByRole.Manager.done / completionRateByRole.Manager.total) * 100)
            : 0,
          completionRateByRole.Worker.total
            ? Math.round((completionRateByRole.Worker.done / completionRateByRole.Worker.total) * 100)
            : 0
        ],
        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981']
      }
    ]
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Team Analytics</h1>
        <button
          onClick={downloadPdf}
          className="btn-outline flex items-center space-x-2 px-4 py-2 rounded border border-blue-500 text-blue-500 hover:bg-blue-50 transition"
        >
          <FaFilePdf />
          <span>Download PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-white p-6"><FaUsers /> Members: {teamMetrics.activeMembers}/{teamMetrics.totalMembers}</div>
        <div className="card bg-white p-6"><FaTasks /> Total Tasks: {teamMetrics.totalTasks}</div>
        <div className="card bg-white p-6"><FaCheckCircle /> Completed: {teamMetrics.completedTasks}</div>
        <div className="card bg-white p-6"><FaClock /> Avg. Time: {Math.round(teamMetrics.averageCompletionTime / (1000 * 60 * 60))}h</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Task Distribution</h2>
          <Bar
            data={taskDistributionData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    precision: 0
                  }
                }
              }
            }}
          />
        </div>

        <div className="card bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Completion Rate</h2>
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
