import { Link } from 'react-router-dom'
import { FaTasks, FaUsers, FaChartLine } from 'react-icons/fa'
import remsImage from "../assets/image/rems.jpg";
import anelImage from "../assets/image/anel.jpg";
import muraImage from "../assets/image/mura.jpg";
import ulpanImage from "../assets/image/ulpan.jpg";


function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-16 md:py-24">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Supercharge Your Productivity with REMS
              </h1>
              <p className="text-xl mb-8 text-accent-300">
                The fastest way to manage tasks, track progress, and collaborate with your team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn bg-white text-primary-500 hover:bg-accent-300">
                  Get Started — It's Free
                </Link>
                <Link to="/about" className="btn border border-white text-white hover:bg-primary-500">
                  Learn More
                </Link>
              </div>
            </div>

            <div className="md:w-1/2 mt-8 md:mt-0">
              <div className="bg-white p-6 rounded-lg shadow-2xl transform rotate-1 hover:rotate-0 transition-transform">
                <img
                  src={remsImage}
                  alt="Team collaboration"
                  className="rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              ['2,500+', 'Active Users'],
              ['15,000+', 'Tasks Completed'],
              ['300+', 'Teams'],
              ['99.9%', 'Uptime'],
            ].map(([stat, label], idx) => (
              <div key={idx} className="p-4">
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat}</div>
                <div className="text-lg text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-primary-700">Why Choose REMS?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our powerful features help teams stay organized, focused, and productive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              [<FaTasks className="h-12 w-12 text-secondary-500 mx-auto mb-4" />, 'Task Management', 'Create, assign, and track tasks with ease. Move tasks between columns as they progress.'],
              [<FaUsers className="h-12 w-12 text-secondary-500 mx-auto mb-4" />, 'Team Collaboration', 'Work together seamlessly with role-based permissions and real-time updates.'],
              [<FaChartLine className="h-12 w-12 text-secondary-500 mx-auto mb-4" />, 'Performance Tracking', 'Monitor productivity with built-in analytics and custom activity tracking.'],
            ].map(([icon, title, desc], idx) => (
              <div key={idx} className="card text-center p-6 bg-primary-50 rounded-lg shadow-md">
                {icon}
                <h3 className="text-xl font-semibold mb-2 text-primary-700">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent-500 text-white text-center">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-4">Ready to boost your productivity?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of teams who use Bolt to streamline their workflow and get more done.
          </p>
          <Link to="/register" className="btn bg-white text-accent-500 hover:bg-primary-50">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-primary-700">we are</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              ['Munayev Movladi', 'Developer', {muraImage}, ' The interface is intuitive and the role-based system ensures everyone knows their responsibilities.'],
              ['Yelmurat Ulpan', 'Developer', {ulpanImage}, "The activity tracking feature provides valuable insights into our team's productivity patterns, helping us optimize our workflow."],
              ['Nurzhatayeva Anel', 'Developer', {anelImage}, 'Our project completion rate has increased by 35%. The ROI has been incredible for our organization.'],
            ].map(([name, title, img, feedback], idx) => (
              <div key={idx} className="card p-6 bg-primary-50 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <img src={img} alt={name} className="w-12 h-12 rounded-full object-cover mr-4" />
                  <div>
                    <h4 className="font-semibold text-primary-700">{name}</h4>
                    <p className="text-gray-600 text-sm">{title}</p>
                  </div>
                </div>
                <p className="text-gray-600">{feedback}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
