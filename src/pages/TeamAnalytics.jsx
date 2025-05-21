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
import { FaUsers, FaTasks, FaCheckCircle, FaClock } from 'react-icons/fa'
import { useTasks } from '../context/TasksContext'

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

  // Task distribution by member
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

  // Task completion rate by member
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

      {/* Team Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaUsers className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-semibold text-gray-900">
                {teamMetrics.activeMembers}/{teamMetrics.totalMembers}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FaTasks className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{teamMetrics.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaCheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{teamMetrics.completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaClock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Completion Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(teamMetrics.averageCompletionTime / (1000 * 60 * 60))}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Task Distribution by Member</h2>
          <div className="aspect-square">
            <Doughnut 
              data={memberDistributionData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top'
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="card bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Completion Rate by Member</h2>
          <Bar 
            data={completionRateData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: 'Completion Rate (%)'
                  }
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