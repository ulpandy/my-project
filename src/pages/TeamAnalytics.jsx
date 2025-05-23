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
import { Bar, Doughnut } from 'react-chartjs-2'
import { FaUsers, FaTasks, FaCheckCircle, FaClock, FaFilePdf } from 'react-icons/fa'
import { useTasks } from '../context/TasksContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

function TeamAnalytics() {
  const { getFilteredTasks } = useTasks()
  const [dateRange, setDateRange] = useState('week')
  const [teamMetrics, setTeamMetrics] = useState({
    totalMembers: 3,
    activeMembers: 2,
    totalTasks: 0,
    completedTasks: 0,
    averageCompletionTime: 0
  })

  const tasks = getFilteredTasks()

  useEffect(() => {
    const completed = tasks.filter(task => task.status === 'done')
    const totalTime = completed.reduce((acc, task) => {
      if (task.startTime && task.endTime) {
        return acc + (new Date(task.endTime) - new Date(task.startTime))
      }
      return acc
    }, 0)

    setTeamMetrics({
      totalMembers: 3,
      activeMembers: 2,
      totalTasks: tasks.length,
      completedTasks: completed.length,
      averageCompletionTime: completed.length ? totalTime / completed.length : 0
    })
  }, [tasks])

const handleDownloadPdf = async () => {
  try {
    const token = localStorage.getItem('token')

    const today = new Date()
    const startDate = today.toISOString().split('T')[0]

    const end = new Date(today)
    end.setDate(end.getDate() + 1)
    const endDate = end.toISOString().split('T')[0]

    const params = new URLSearchParams({ startDate, endDate })

    const res = await fetch(`http://localhost:3000/api/activity/pdf?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!res.ok) throw new Error('Failed to generate PDF')

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'activity-report.pdf'
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    alert('Error downloading PDF: ' + err.message)
  }
}


  const memberDistributionData = {
    labels: ['Admin', 'Manager', 'Worker'],
    datasets: [{
      data: [
        tasks.filter(t => t.assignedTo === '1').length,
        tasks.filter(t => t.assignedTo === '2').length,
        tasks.filter(t => t.assignedTo === '3').length
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.5)',
        'rgba(245, 158, 11, 0.5)',
        'rgba(34, 197, 94, 0.5)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(245, 158, 11)',
        'rgb(34, 197, 94)'
      ]
    }]
  }

  const completionRateData = {
    labels: ['Admin', 'Manager', 'Worker'],
    datasets: [{
      label: 'Completion Rate (%)',
      data: [
        tasks.filter(t => t.assignedTo === '1').length ?
          (tasks.filter(t => t.assignedTo === '1' && t.status === 'done').length /
            tasks.filter(t => t.assignedTo === '1').length) * 100 : 0,
        tasks.filter(t => t.assignedTo === '2').length ?
          (tasks.filter(t => t.assignedTo === '2' && t.status === 'done').length /
            tasks.filter(t => t.assignedTo === '2').length) * 100 : 0,
        tasks.filter(t => t.assignedTo === '3').length ?
          (tasks.filter(t => t.assignedTo === '3' && t.status === 'done').length /
            tasks.filter(t => t.assignedTo === '3').length) * 100 : 0
      ],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)'
    }]
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Team Analytics</h1>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="form-input py-1"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button
            onClick={handleDownloadPdf}
            className="btn-outline flex items-center space-x-2"
          >
            <FaFilePdf />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-white p-6"><FaUsers /> Members: {teamMetrics.activeMembers}/{teamMetrics.totalMembers}</div>
        <div className="card bg-white p-6"><FaTasks /> Total Tasks: {teamMetrics.totalTasks}</div>
        <div className="card bg-white p-6"><FaCheckCircle /> Completed: {teamMetrics.completedTasks}</div>
        <div className="card bg-white p-6"><FaClock /> Avg. Time: {Math.round(teamMetrics.averageCompletionTime / (1000 * 60 * 60))}h</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Task Distribution</h2>
          <Doughnut data={memberDistributionData} />
        </div>
        <div className="card bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Completion Rate</h2>
          <Bar data={completionRateData} options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, max: 100, title: { display: true, text: 'Completion Rate (%)' } }
            }
          }} />
        </div>
      </div>
    </div>
  )
}

export default TeamAnalytics
