import { Link } from 'react-router-dom'
import { FaLightbulb, FaRocket, FaUsers, FaLock, FaMobileAlt } from 'react-icons/fa'
import anelImage from "../assets/image/anel.jpg";
import muraImage from "../assets/image/mura.jpg";
import ulpanImage from "../assets/image/ulpan.jpg";
import remsImage from "../assets/image/rems.jpg";

function About() {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-primary-600 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl font-bold mb-4">About REMS</h1>
          <p className="text-xl max-w-3xl mx-auto">
            We're on a mission to make task management simpler, more efficient, and more collaborative for teams of all sizes.
          </p>
        </div>
      </div>
      
      {/* Our Story */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img 
                src={remsImage} 
                alt="Team" 
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-gray-700 mb-4">
                REMS was born out of frustration with existing task management solutions that were either too complex or too simplistic for real-world team needs.
              </p>
              <p className="text-gray-700 mb-4">
                Our developers, set out to create a tool that strikes the perfect balance between power and simplicity.
              </p>
              <p className="text-gray-700">
                Since our launch in 2025, we've helped thousands of teams across the globe streamline their workflows and boost their productivity.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do at REMS.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center p-6">
              <FaLightbulb className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600">
                We constantly push the boundaries of what's possible in task management, bringing fresh ideas to life.
              </p>
            </div>
            
            <div className="card text-center p-6">
              <FaRocket className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Efficiency</h3>
              <p className="text-gray-600">
                We're obsessed with creating tools that help teams work smarter, not harder.
              </p>
            </div>
            
            <div className="card text-center p-6">
              <FaUsers className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Collaboration</h3>
              <p className="text-gray-600">
                We believe in the power of teamwork and design our tools to make collaboration seamless.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The talented individuals behind REMS's success.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card p-6 text-center">
              <img 
                src={muraImage} 
                alt="Team member" 
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
              />
              <h3 className="font-semibold text-lg">Munayev Movladi</h3>
              <p className="text-gray-600 mb-2">Developer</p>
            </div>
            
            <div className="card p-6 text-center">
              <img 
                src={ulpanImage}
                alt="Team member" 
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
              />
              <h3 className="font-semibold text-lg">Yelmurat Ulpan</h3>
              <p className="text-gray-600 mb-2">Developer</p>
            </div>
            
            <div className="card p-6 text-center">
              <img 
                src={anelImage} 
                alt="Team member" 
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
              />
              <h3 className="font-semibold text-lg">Nurzhatayeva Anel</h3>
              <p className="text-gray-600 mb-2">Developer</p>
            </div>
            
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Join the REMS Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience the future of task management and boost your team's productivity today.
          </p>
          <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100">
            Get Started for Free
          </Link>
        </div>
      </section>
    </div>
  )
}

export default About