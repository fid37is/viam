'use client'

import AuthSection from './auth-section'
import HomeNav from './home-nav'

export default function HomeHero() {
  return (
    <div className="min-h-screen bg-white">
      {/* TOP NAVIGATION */}
      <HomeNav />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Auth Section */}
          <div className="order-2 lg:order-1">
            <AuthSection />
          </div>

          {/* Right Side - Illustration */}
          <div className="order-1 lg:order-2">
            <div className="relative aspect-square w-full max-w-lg mx-auto">
              {/* Placeholder illustration - replace with actual image */}
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-3xl flex items-center justify-center border-2 border-gray-200">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-600 font-medium">App Illustration</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Track applications → Get insights → Land your dream job
                  </p>
                </div>
              </div>
              {/* When you have an actual image, use: */}
              {/* <Image 
                src="/images/app-illustration.png" 
                alt="Viam app illustration" 
                fill
                className="object-contain"
              /> */}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-gradient-to-br from-accent/5 to-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600">
              Track, analyze, and land your perfect role
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎯"
              title="Smart Matching"
              description="AI-powered insights help you discover which companies align with your values and career goals."
            />
            <FeatureCard
              icon="📊"
              title="Organized Tracking"
              description="Keep all your applications, notes, and research in one beautiful dashboard."
            />
            <FeatureCard
              icon="🔔"
              title="Never Miss Out"
              description="Get reminded about follow-ups, interviews, and important deadlines."
            />
            <FeatureCard
              icon="🔍"
              title="Company Insights"
              description="Automatic research and analysis of every company you apply to."
            />
            <FeatureCard
              icon="📈"
              title="Track Progress"
              description="Visualize your job search journey with detailed analytics and insights."
            />
            <FeatureCard
              icon="⚡"
              title="Lightning Fast"
              description="Add applications in seconds with smart link parsing and auto-fill."
            />
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by job seekers
            </h2>
            <p className="text-xl text-gray-600">
              See what people are saying about Viam
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Viam helped me organize 50+ applications and land my dream role. The AI matching feature is incredible!"
              author="Sarah M."
              role="Software Engineer"
            />
            <TestimonialCard
              quote="Finally, a tool that understands what I'm looking for. The company insights saved me hours of research."
              author="James K."
              role="Product Manager"
            />
            <TestimonialCard
              quote="I never missed a follow-up again. Viam's reminders helped me stay on top of every opportunity."
              author="Emily R."
              role="Marketing Lead"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary via-accent to-secondary py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to find your way?
          </h2>
          <p className="text-xl text-gray-800 mb-8">
            Join thousands of job seekers who found their perfect role with Viam
          </p>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Get Started Free
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Viam</h3>
              <p className="text-gray-400">
                Find your way to the perfect role
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Viam. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-primary/50 transition-all hover:shadow-lg">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
      <div className="text-primary text-3xl mb-4">"</div>
      <p className="text-gray-700 mb-6 italic">{quote}</p>
      <div>
        <p className="font-semibold text-gray-900">{author}</p>
        <p className="text-sm text-gray-600">{role}</p>
      </div>
    </div>
  )
}