'use client'

import AuthSection from './auth-section';
import { Target, BarChart3, Bell, Search, TrendingUp, Zap, Check } from 'lucide-react'
import HomeNav from './home-nav'

export default function HomeHero() {
  const handleUpgradeClick = () => {
    // Add upgrade parameter to URL
    const url = new URL(window.location.href)
    url.searchParams.set('upgrade', 'true')
    window.history.pushState({}, '', url)
    
    // Dispatch event immediately (before scroll)
    window.dispatchEvent(new CustomEvent('upgrade-intent'))
    
    // Smooth scroll to auth section at top
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    })
  }

  const handleFreeClick = () => {
    // Remove upgrade parameter if it exists
    const url = new URL(window.location.href)
    url.searchParams.delete('upgrade')
    window.history.pushState({}, '', url)
    
    // Dispatch event immediately (before scroll)
    window.dispatchEvent(new CustomEvent('free-signup'))
    
    // Smooth scroll to top
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}} />
      
      {/* TOP NAVIGATION */}
      <HomeNav />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Auth Section */}
          <div className="order-2 lg:order-1">
            <AuthSection />
          </div>

          {/* Right Side - Hero Visual with App Name */}
          <div className="order-1 lg:order-2">
            <div className="relative w-full max-w-4xl mx-auto h-[600px] lg:h-[700px]">
              {/* Left Side Decorative Stroke */}
              <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-transparent via-secondary to-transparent opacity-30"></div>
              
              <div className="relative w-full h-full rounded-3xl overflow-hidden">

                {/* Main content - App Name and Value Prop */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pb-20 text-center">
                  <h1 className="text-6xl lg:text-8xl font-bold text-foreground mb-12 tracking-tight">
                    TrailAm
                  </h1>
                  <p className="text-2xl lg:text-3xl text-muted-foreground font-light max-w-45 leading-relaxed">
                    Trail your every job application with intelligent tracking and insights
                  </p>
                  
                  {/* Bouncing Arrow */}
                  <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <svg 
                      className="w-8 h-8 text-secondary" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/3 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-muted-foreground">
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

      {/* Pricing Section */}
      <div id="pricing" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade when you're ready to go unlimited
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-card rounded-3xl border-2 border-border p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Free</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-5xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-muted-foreground">Perfect for getting started</p>
              </div>

              <ul className="space-y-4 mb-8">
                <BenefitItem text="Track up to 10 applications" />
                <BenefitItem text="AI job fit analysis" />
                <BenefitItem text="Company research & insights" />
                <BenefitItem text="Interview prep questions" />
                <BenefitItem text="Application status tracking" />
                <BenefitItem text="Smart notifications" />
                <BenefitItem text="Delete after 30 days only" muted />
              </ul>

              <button 
                onClick={handleFreeClick}
                className="w-full py-3 rounded-xl border-2 border-border text-foreground font-semibold hover:bg-muted transition-all duration-300 group-hover:border-primary/50"
              >
                Get Started Free
              </button>
            </div>

            {/* Premium Tier */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl border-2 border-primary p-8 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group animate-float">
              {/* Popular Badge */}
              <div className="absolute top-6 right-6 bg-secondary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Recommended
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Premium</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-5xl font-bold text-foreground">$12</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-muted-foreground">For serious job seekers</p>
              </div>

              <ul className="space-y-4 mb-8">
                <BenefitItem text="Unlimited applications" premium />
                <BenefitItem text="All AI features unlocked" premium />
                <BenefitItem text="Advanced company insights" premium />
                <BenefitItem text="Priority interview prep" premium />
                <BenefitItem text="Instant delete anytime" premium />
                <BenefitItem text="Application analytics" premium />
                <BenefitItem text="Export & backup data" premium />
              </ul>

              <button 
                onClick={handleUpgradeClick}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105"
              >
                Start With Premium
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Loved by job seekers
            </h2>
            <p className="text-xl text-muted-foreground">
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
      <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Ready to find your way?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of job seekers who found their perfect role with TrailAm
          </p>
          <button
            onClick={handleFreeClick}
            className="bg-primary text-primary-foreground hover:opacity-90 px-8 py-4 rounded-lg text-lg font-semibold transition-opacity"
          >
            Get Started Free
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card text-card-foreground py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">TrailAm</h3>
              <p className="text-muted-foreground">
                Find your way to the perfect role
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
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
    accent: 'bg-accent/10 text-accent-foreground border-accent/20 hover:border-accent/40',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20 hover:border-secondary/40'
  }

  return (
    <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-lg transition-all group">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${colorClasses[color]} group-hover:scale-110`}>
        <div className="animate-pulse-subtle">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="text-primary text-4xl mb-4 font-serif">"</div>
      <p className="text-card-foreground mb-6 italic">{quote}</p>
      <div>
        <p className="font-semibold text-foreground">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  )
}

function BenefitItem({ text, muted = false, premium = false }: { text: string; muted?: boolean; premium?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${premium ? 'text-primary' : muted ? 'text-muted-foreground' : 'text-foreground'}`} />
      <span className={`${muted ? 'text-muted-foreground' : 'text-foreground'}`}>{text}</span>
    </li>
  )
}