import { useState } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

function FAQ() {
  // FAQ items with question and answer
  const faqItems = [
    {
      question: 'What is REMS?',
      answer: 'REMS is a task management platform designed to help teams organize, track, and manage their work efficiently. It features a kanban-style board with customizable columns, role-based permissions, and activity tracking.'
    },
    {
      question: 'How much does REMS cost?',
      answer: 'REMS offers a free tier for small teams and individual users. For larger teams with advanced needs, we have premium plans starting at $FREE per user per month. You can view our pricing page for more details on what each plan includes.'
    },
    {
      question: 'What are the different user roles in REMS?',
      answer: 'REMS has three user roles: Admin, Manager, and Worker. Admins have full control over the system, including user management. Managers can create and assign tasks, while Workers can view and update their assigned tasks.'
    },
    {
      question: 'How secure is my data on REMS?',
      answer: 'We take security very seriously. All data is encrypted in transit and at rest. We use industry-standard security practices and regularly conduct security audits to ensure your information is protected.'
    },
    {
      question: 'Can I integrate REMS with other tools?',
      answer: 'Yes, REMS offers integrations with popular tools like Slack, Google Calendar, Microsoft Teams, and more. We also have an API available for custom integrations.'
    },
    {
      question: 'What kind of customer support does REMS offer?',
      answer: 'We provide email support for all users. Premium plans include priority support and access to our customer success team for personalized assistance. We also have an extensive knowledge base with guides and tutorials.'
    },
    {
      question: 'Can I use REMS on mobile devices?',
      answer: 'Yes, REMS is fully responsive and works on all modern devices. We also have dedicated mobile apps for iOS and Android for a native mobile experience.'
    },
    {
      question: 'What is the user activity tracking feature?',
      answer: 'Our activity tracking feature helps teams monitor productivity by tracking user interactions like mouse clicks and keyboard input. This feature is optional and requires explicit user consent before activation.'
    },
    {
      question: 'How can I cancel my subscription?',
      answer: 'You can cancel your subscription at any time from your account settings page. Your access will continue until the end of your current billing period.'
    },
    {
      question: 'Do you offer a trial period for premium plans?',
      answer: 'Yes, we offer a 14-day free trial of all our premium features so you can test them before committing to a subscription. No credit card is required to start a trial.'
    }
  ]
  
  // State to track which FAQ items are expanded
  const [expandedItems, setExpandedItems] = useState([0]) // Default first item expanded
  
  // Toggle expansion of an FAQ item
  const toggleItem = (index) => {
    setExpandedItems(prev => {
      if (prev.includes(index)) {
        return prev.filter(item => item !== index)
      } else {
        return [...prev, index]
      }
    })
  }
  
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-primary-600 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Find answers to common questions about REMS's features, pricing, and more.
          </p>
        </div>
      </div>
      
      {/* FAQ List */}
      <section className="py-16">
        <div className="container-custom max-w-4xl">
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50 focus:outline-none"
                  onClick={() => toggleItem(index)}
                >
                  <span className="font-medium text-lg text-gray-900">{item.question}</span>
                  <span className="ml-6 flex-shrink-0 text-gray-500">
                    {expandedItems.includes(index) ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </button>
                {expandedItems.includes(index) && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-gray-700">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Still have questions */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Our support team is here to help you with any other questions you might have.
          </p>
          <div className="flex justify-center">
            <a 
              href="mailto:support@rems.com" 
              className="btn-primary"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FAQ