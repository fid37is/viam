'use client'

import AuthSection from './auth-section';
import { Target, BarChart3, Bell, Search, TrendingUp, Zap } from 'lucide-react'
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

          {/* Right Side - Image Placeholder */}
          <div className="order-1 lg:order-2">
            <div className="relative w-full max-w-8xl mx-auto h-[600px] lg:h-[700px]">
              <div className="relative w-full h-full">
                <img
                  src="/hero-image.png"
                  alt="TrailAm Dashboard Preview"
                  className="w-full h-full rounded-3xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-linear-to-br from-primary/5 via-accent/5 to-primary/3 dark:from-primary/10 dark:via-accent/10 dark:to-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Track, analyze, and land your perfect role with powerful tools designed for modern job seekers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Target className="w-8 h-8" />}
              title="Smart Matching"
              description="AI-powered insights analyze company culture, values, and growth trajectory to help you discover roles that truly align with your career goals and aspirations."
              color="primary"
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Organized Tracking"
              description="Centralize all your applications, interview notes, contacts, and research in one intuitive dashboard that grows with your job search journey."
              color="accent"
            />
            <FeatureCard
              icon={<Bell className="w-8 h-8" />}
              title="Never Miss Out"
              description="Smart reminders keep you on track with follow-ups, interview prep, thank-you notes, and application deadlines so opportunities never slip through."
              color="secondary"
            />
            <FeatureCard
              icon={<Search className="w-8 h-8" />}
              title="Company Insights"
              description="Get instant access to funding rounds, team size, tech stack, recent news, and culture reviews for every company you're considering."
              color="primary"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Track Progress"
              description="Visualize your application-to-interview conversion rates, identify successful strategies, and optimize your approach with detailed analytics."
              color="accent"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Lightning Fast"
              description="Add applications in seconds with smart job posting parsers that automatically extract company details, role info, and requirements."
              color="secondary"
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
              Join thousands who transformed their job search with TrailAm
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="TrailAm helped me organize 50+ applications and land my dream role at a Series B startup. The AI matching feature showed me companies I never would have discovered on my own!"
              author="Sarah M."
              role="Software Engineer"
            />
            <TestimonialCard
              quote="Finally, a tool that understands what I'm looking for in company culture and growth stage. The automated company research saved me literally hours every week."
              author="James K."
              role="Product Manager"
            />
            <TestimonialCard
              quote="I went from scattered spreadsheets to a streamlined process. Never missed a follow-up again and my response rate doubled. This tool paid for itself 10x over."
              author="Emily R."
              role="Marketing Lead"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-linear-to-r from-primary via-accent to-secondary py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to find your way?
          </h2>
          <p className="text-xl text-gray-800 mb-8">
            Join thousands of job seekers who found their perfect role with TrailAm
          </p>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="bg-primary hover:bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Get Started Free
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 text-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">TrailAm</h3>
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
            <p>&copy; 2025 TrailAm. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'primary' | 'accent' | 'secondary';
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary border-primary/20 hover:border-primary/40',
    accent: 'bg-accent/10 text-accent border-accent/20 hover:border-accent/40',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20 hover:border-secondary/40'
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="text-primary text-4xl mb-4 font-serif">"</div>
      <p className="text-gray-700 dark:text-gray-300 mb-6 italic">{quote}</p>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">{author}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
      </div>
    </div>
  )
}