import { Link } from 'react-router-dom'
import { FaTasks, FaUsers, FaChartLine } from 'react-icons/fa'
import { motion } from 'framer-motion'
import remsImage from "../assets/image/rems.jpg"
import anelImage from "../assets/image/anel.jpg"
import muraImage from "../assets/image/mura.jpg"
import ulpanImage from "../assets/image/ulpan.jpg"

function Home() {
  return (
    <div className="bg-white dark:bg-[#1D0036] text-gray-900 dark:text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 dark:from-[#3C1260] dark:to-[#4A3BA6] py-24 md:py-32">
        <div className="container-custom">
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-between gap-12"
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}>
            <div className="md:w-1/2">
              <h1 className="text-5xl font-bold leading-tight mb-6 tracking-tight text-white">Supercharge Your Productivity with REMS</h1>
              <p className="text-xl mb-8 text-accent-200 dark:text-accent-100 max-w-lg">
                The fastest way to manage tasks, track progress, and collaborate with your team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn bg-white text-primary-600 hover:bg-accent-200 hover:text-white transition-all">
                  Get Started — It's Free
                </Link>
                <Link to="/about" className="btn border border-white text-white hover:bg-primary-600">
                  Learn More
                </Link>
              </div>
            </div>
            <motion.div 
              className="md:w-1/2 mt-8 md:mt-0"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}>
              <div className="bg-white dark:bg-[#3C1260] p-6 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
                <img src={remsImage} alt="Team collaboration" className="rounded-xl" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-primary-50 to-secondary-50 dark:bg-[#2D2040] dark:bg-none">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[['2,500+', 'Active Users'], ['15,000+', 'Tasks Completed'], ['300+', 'Teams'], ['99.9%', 'Uptime']].map(([stat, label], idx) => (
              <motion.div 
                key={idx} 
                className=""
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}>
                <div className="text-4xl font-bold text-primary-700 dark:text-white mb-2">{stat}</div>
                <div className="text-lg text-gray-600 dark:text-gray-300 uppercase tracking-wide">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-[#1E152F]">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-primary-700 dark:text-primary-300 tracking-tight">Why Choose REMS?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our powerful features help teams stay organized, focused, and productive.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[ 
              [<FaTasks className="h-12 w-12 text-secondary-500 mx-auto mb-4" />, 'Task Management', 'Create, assign, and track tasks with ease.'],
              [<FaUsers className="h-12 w-12 text-secondary-500 mx-auto mb-4" />, 'Team Collaboration', 'Work together seamlessly with role-based permissions.'],
              [<FaChartLine className="h-12 w-12 text-secondary-500 mx-auto mb-4" />, 'Performance Tracking', 'Monitor productivity with built-in analytics.']
            ].map(([icon, title, desc], idx) => (
              <motion.div 
                key={idx} 
                className="p-6 rounded-2xl bg-white dark:bg-[#3C1260] shadow-md hover:shadow-xl transition-all duration-300 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}>
                {icon}
                <h3 className="text-xl font-semibold mb-2 text-primary-700 dark:text-primary-200">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-accent-500 to-secondary-500 text-white dark:from-[#743AA6] dark:to-[#4A3BA6] text-center">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Ready to boost your productivity?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of teams who use REMS to streamline their workflow and get more done.
            </p>
            <Link to="/register" className="btn bg-white text-accent-600 hover:bg-primary-50 transition-all">
              Get Started for Free
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white dark:bg-[#1D0036]">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-primary-700 dark:text-primary-300">Meet Our Team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              ['Munayev Movladi', 'Developer', muraImage, 'The interface is intuitive and the role-based system ensures everyone knows their responsibilities.'],
              ['Yelmurat Ulpan', 'Developer', ulpanImage, "The activity tracking feature provides valuable insights into our team's productivity patterns."],
              ['Nurzhatayeva Anel', 'Developer', anelImage, 'Our project completion rate has increased by 35%. The ROI has been incredible.']
            ].map(([name, title, img, feedback], idx) => (
              <motion.div 
                key={idx} 
                className="p-8 rounded-2xl bg-white dark:bg-[#3C1260] shadow-xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}>
                <div className="flex items-center mb-4">
                  <img src={img} alt={name} className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-primary-600" />
                  <div>
                    <h4 className="font-semibold text-primary-700 dark:text-primary-200">{name}</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{title}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">“{feedback}”</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home