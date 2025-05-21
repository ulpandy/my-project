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
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { FaProjectDiagram, FaTasks, FaCheckCircle, FaClock } from 'react-icons/fa'

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

function ProjectAnalytics() {
  const [selectedProject, setSelectedProject] = useState('all')
  const [dateRange, setDateRange] = useState('week')
  
  // Mock project data
  const projects = [
    {
      id: 1,
      name: 'Website Redesign',
      totalTasks: 12,
      completedTasks: 5,
      onTrack: true,
      startDate: '2024-01-01',
      deadline: '2024-02-01'
    },
    {
      id: 2,
      name: 'Mobile App Development',
      totalTasks: 8,
      completedTasks: 2,
      onTrack: false,
      startDate: '2024-01-15',
      deadline: '2024-03-15'
    }
  ]

  // Project progress data
  const progressData = {
    labels: projects.map(p => p.name),
    datasets: [{
      label: 'Progress',
      data: projects.map(p => (p.completedTasks / p.totalTasks) * 100),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)'
    }]
  }

  // Task status distribution
  const taskDistributionData = {
    labels: ['Completed', 'In Progress', 'To Do', 'Blocked'],
    datasets: [{
      data: [7, 5, 6, 2],
      backgroundColor: [
        'rgba(34, 197, 94, 0.5)',
        'rgba(245, 158, 11, 0.5)',
        'rgba(59, 130, 246, 0.5)',
        'rgba(239, 68, 68, 0.5)'
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(245, 158, 11)',
        'rgb(59, 130, 246)',
        'rgb(239, 68, 68)'
      ]
    }]
  }

  // Timeline data
  const timelineData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Planned Progress',
      data: [25, 50, 75, 100],
      borderColor: 'rgb(59, 130, 246)',
      borderDash: [5, 5],
      fill: false
    }, {
      label: 'Actual Progress',
      data: [20, 45, 60, 70],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true
    }]
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Project Analytics</h1>
        
        <div className="flex space-x-4">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="form-input py-1"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

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
      </div>

      {/* Project Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaProjectDiagram className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-semibold text-gray-900">{projects.length}</p>
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
              <p className="text-2xl font-semibold text-gray-900">
                {projects.reduce((acc, p) => acc + p.totalTasks, 0)}
              </p>
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
              <p className="text-2xl font-semibold text-gray-900">
                {projects.reduce((acc, p) => acc + p.completedTasks, 0)}
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
              <p className="text-sm font-medium text-gray-600">On Track</p>
              <p className="text-2xl font-semibold text-gray-900">
                {projects.filter(p => p.onTrack).length}/{projects.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Project Progress</h2>
          <Bar 
            data={progressData}
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
                    text: 'Progress (%)'
                  }
                }
              }
            }}
          />
        </div>

        <div className="card bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Task Distribution</h2>
          <div className="aspect-square">
            <Doughnut 
              data={taskDistributionData}
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
      </div>

      {/* Timeline Chart */}
      <div className="card bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">Project Timeline</h2>
        <Line 
          data={timelineData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: 'Progress (%)'
                }
              }
            }
          }}
        />
      </div>
    </div>
  )
}

export default ProjectAnalytics