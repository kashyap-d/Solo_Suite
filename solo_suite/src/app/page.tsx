import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Users, Briefcase, ArrowRight, CheckCircle } from "lucide-react"
import { ModeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">SoloSuite</h1>
            <Badge className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">Beta</Badge>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/auth/signin">
              <Button variant="outline" className="border-gray-200 dark:border-gray-700">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            The Ultimate Platform for
            <span className="text-indigo-600 dark:text-indigo-400"> Student Entrepreneurs</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect talented student creators with clients who need their services. Build your portfolio, grow your
            business, and achieve your entrepreneurial dreams.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="text-lg px-8 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-gray-200 dark:border-gray-700">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Everything You Need to Succeed</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Whether you're a service provider or looking to hire talent, SoloSuite has the tools to help you thrive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
              <CardTitle className="text-gray-900 dark:text-white">AI-Powered Taskboard</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Generate detailed project tasks automatically using advanced AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Smart task generation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Priority and time estimation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Progress tracking
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <CardTitle className="text-gray-900 dark:text-white">Dual User System</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Separate dashboards for service providers and clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Provider dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Client marketplace
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Role-based features
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <Briefcase className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
              <CardTitle className="text-gray-900 dark:text-white">Project Management</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Keep track of all your projects and deadlines in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Deadline tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Client communication
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Revenue analytics
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-indigo-600 dark:bg-indigo-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Launch Your Solo Career?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of student entrepreneurs who are already building their future with SoloSuite.
          </p>
          <Link href="/auth/signup">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-3 bg-white text-indigo-600 hover:bg-gray-100"
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-300">
          <p>&copy; 2024 SoloSuite. Built for student entrepreneurs, by student entrepreneurs.</p>
        </div>
      </footer>
    </div>
  )
}
