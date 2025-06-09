// ProjectAnalytics.jsx
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

  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

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
        console.error('Error loading analytics data:', err);
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
        backgroundColor: isDark ? 'rgba(147,112,219,0.6)' : 'rgba(99,102,241,0.5)',
        borderColor: isDark ? 'rgb(186,85,211)' : 'rgb(99,102,241)'
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
        backgroundColor: isDark
          ? ['#C6DBFF', '#FFE7B3', '#CFF9E2', '#CED3E0']
          : ['#93C5FD', '#FDE047', '#86EFAC', '#CBD5E1'],
        borderColor: isDark
          ? ['#8FA2CC', '#D3B16E', '#7CCFA9', '#9AA5B3']
          : ['#3B82F6', '#EAB308', '#10B981', '#64748B'],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Analytics</h1>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="form-select py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-500 text-gray-800 dark:text-white"
        >
          <option value="all">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl shadow-card bg-white dark:bg-dark-500 text-gray-900 dark:text-white">
          <FaProjectDiagram className="text-indigo-500 mb-2" />
          <p className="text-sm font-medium">Total Projects</p>
          <p className="text-2xl font-semibold">{projects.length}</p>
        </div>

        <div className="p-6 rounded-2xl shadow-card bg-white dark:bg-dark-500 text-gray-900 dark:text-white">
          <FaTasks className="text-yellow-500 mb-2" />
          <p className="text-sm font-medium">Total Tasks</p>
          <p className="text-2xl font-semibold">{filteredTasks.length}</p>
        </div>

        <div className="p-6 rounded-2xl shadow-card bg-white dark:bg-dark-500 text-gray-900 dark:text-white">
          <FaCheckCircle className="text-emerald-500 mb-2" />
          <p className="text-sm font-medium">Completed Tasks</p>
          <p className="text-2xl font-semibold">{taskStatusCounts.done}</p>
        </div>

        <div className="p-6 rounded-2xl shadow-card bg-white dark:bg-dark-500 text-gray-900 dark:text-white">
          <FaClock className="text-slate-500 mb-2" />
          <p className="text-sm font-medium">Frozen Tasks</p>
          <p className="text-2xl font-semibold">{taskStatusCounts.frozen}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-500 p-6 rounded-2xl shadow-card">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Project Progress</h2>
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

        <div className="bg-white dark:bg-dark-500 p-6 rounded-2xl shadow-card">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Task Distribution</h2>
          <Doughnut
            data={taskDistributionData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    color: isDark ? '#ffffff' : '#1f2937',
                    font: { size: 14, weight: '500' }
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ProjectAnalytics;