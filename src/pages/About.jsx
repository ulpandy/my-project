import { Link } from 'react-router-dom'
import { FaLightbulb, FaRocket, FaUsers } from 'react-icons/fa'
import anelImage from "../assets/image/anel.jpg";
import muraImage from "../assets/image/mura.jpg";
import ulpanImage from "../assets/image/ulpan.jpg";
import remsImage from "../assets/image/rems.jpg";
import { motion } from 'framer-motion';

const MotionLink = motion(Link);
const MotionDiv = motion.div;

function About() {
  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative bg-white dark:bg-[#1D0036] text-gray-900 dark:text-white overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -left-10 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#743AA6] to-[#3C1260] opacity-30 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#4A3BA6] to-[#1D0036] opacity-30 blur-3xl animate-pulse delay-2000"></div>
        <svg className="absolute top-1/4 left-1/3 w-[800px] h-[800px] opacity-10 animate-spin-slow" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" stroke="#743AA6" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white dark:from-[#3C1260] dark:to-[#4A3BA6] py-16 shadow-md"
        >
          <div className="container-custom text-center">
            <h1 className="text-5xl font-extrabold mb-4 tracking-tight">About REMS</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90 leading-relaxed">
              We're on a mission to make task management simpler, more efficient, and more collaborative for teams of all sizes.
            </p>
          </div>
        </motion.div>

        {/* Our Story */}
        <section className="py-20 bg-white dark:bg-[#2D2040]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="container-custom"
          >
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <img src={remsImage} alt="Team" className="rounded-xl shadow-2xl border border-white dark:border-[#4A3BA6]" />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  REMS was born out of frustration with existing task management solutions that were either too complex or too simplistic for real-world team needs.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  Our developers set out to create a tool that strikes the perfect balance between power and simplicity.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Since our launch in 2025, we've helped thousands of teams across the globe streamline their workflows and boost their productivity.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Team */}
        <section className="py-20 bg-white dark:bg-[#2D2040]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="container-custom"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                The talented individuals behind REMS's success.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[ 
                ['Munayev Movladi', muraImage], 
                ['Yelmurat Ulpan', ulpanImage], 
                ['Nurzhatayeva Anel', anelImage] 
              ].map(([name, img], idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-[#3C1260] shadow-lg border border-gray-100 dark:border-[#4A3BA6] text-center hover:scale-105 transition-transform duration-300">
                  <img src={img} alt={name} className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-primary-600 dark:border-[#743AA6]" />
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">Developer</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-accent-500 to-secondary-500 text-white dark:from-[#743AA6] dark:to-[#4A3BA6]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="container-custom text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Join the REMS Community</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Experience the future of task management and boost your team's productivity today.
            </p>
            <MotionLink
              to="/register"
              whileTap={{ scale: 0.95 }}
              className="btn bg-white text-primary-600 hover:bg-gray-100 shadow-md px-6 py-3 rounded-xl font-semibold"
            >
              Get Started for Free
            </MotionLink>
          </motion.div>
        </section>
      </div>
    </MotionDiv>
  )
}

export default About;