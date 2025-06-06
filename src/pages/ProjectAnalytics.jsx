import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  FaProjectDiagram,
  FaTasks,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function ProjectAnalytics() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const [projRes, taskRes] = await Promise.all([
          fetch('http://localhost:3000/api/projects/with-summary', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:3000/api/tasks', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const projectData = await projRes.json();
        const taskData = await taskRes.json();

        setProjects(projectData);
        setTasks(taskData);
      } catch (err) {
        console.error('❌ Error loading analytics data:', err);
      }
    };

    fetchData();
  }, []);

  const filteredTasks = selectedProject === 'all'
    ? tasks
    : tasks.filter(task => task.projectId === selectedProject);

  const taskStatusCounts = {
    todo: filteredTasks.filter(t => t.status === 'todo').length,
    inprogress: filteredTasks.filter(t => t.status === 'inprogress').length,
    done: filteredTasks.filter(t => t.status === 'done').length,
    frozen: filteredTasks.filter(t => t.status === 'frozen').length
  };

  const progressData = {
    labels: selectedProject === 'all'
      ? projects.map(p => p.name)
      : [projects.find(p => p.id === selectedProject)?.name || 'Unknown'],
    datasets: [
      {
        label: 'Progress',
        data: selectedProject === 'all'
          ? projects.map(p => {
              const projectTasks = tasks.filter(t => t.projectId === p.id);
              const total = projectTasks.length;
              const completed = projectTasks.filter(t => t.status === 'done').length;
              return total > 0 ? Math.round((completed / total) * 100) : 0;
            })
          : (() => {
              const filtered = tasks.filter(t => t.projectId === selectedProject);
              const total = filtered.length;
              const completed = filtered.filter(t => t.status === 'done').length;
              return [total > 0 ? Math.round((completed / total) * 100) : 0];
            })(),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)'
      }
    ]
  };

  const taskDistributionData = {
    labels: ['To Do', 'In Progress', 'Completed', 'Frozen'],
    datasets: [
      {
        data: [
          taskStatusCounts.todo,
          taskStatusCounts.inprogress,
          taskStatusCounts.done,
          taskStatusCounts.frozen
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(245, 158, 11, 0.5)',
          'rgba(34, 197, 94, 0.5)',
          'rgba(107, 114, 128, 0.5)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(245, 158, 11)',
          'rgb(34, 197, 94)',
          'rgb(107, 114, 128)'
        ]
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Project Analytics</h1>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="form-input py-1"
        >
          <option value="all">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-white p-6">
          <FaProjectDiagram className="text-blue-600 mb-2" />
          <p className="text-sm font-medium text-gray-600">Total Projects</p>
          <p className="text-2xl font-semibold text-gray-900">{projects.length}</p>
        </div>

        <div className="card bg-white p-6">
          <FaTasks className="text-yellow-600 mb-2" />
          <p className="text-sm font-medium text-gray-600">Total Tasks</p>
          <p className="text-2xl font-semibold text-gray-900">{filteredTasks.length}</p>
        </div>

        <div className="card bg-white p-6">
          <FaCheckCircle className="text-green-600 mb-2" />
          <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
          <p className="text-2xl font-semibold text-gray-900">{taskStatusCounts.done}</p>
        </div>

        <div className="card bg-white p-6">
          <FaClock className="text-purple-600 mb-2" />
          <p className="text-sm font-medium text-gray-600">Frozen Tasks</p>
          <p className="text-2xl font-semibold text-gray-900">{taskStatusCounts.frozen}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Project Progress</h2>
          <Bar
            data={progressData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: { stepSize: 10, precision: 0 },
                  title: { display: true, text: 'Progress (%)' }
                }
              }
            }}
          />
        </div>

        <div className="card bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Task Distribution</h2>
          <Doughnut
            data={taskDistributionData}
            options={{
              responsive: true,
              plugins: { legend: { position: 'top' } }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ProjectAnalytics;
