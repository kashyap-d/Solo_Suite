"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Users, Briefcase, ArrowRight, CheckCircle } from "lucide-react"
import { ModeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { Typewriter } from "react-simple-typewriter"
import { useState, useEffect } from 'react'

export default function HomePage() {
    const [showSubtext, setShowSubtext] = useState(false)

    useEffect(() => {
      const timer = setTimeout(() => setShowSubtext(true), 3500) // Typing duration
      return () => clearTimeout(timer)
    }, [])
    
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900 transition-colors overflow-hidden">
      {/* Animated Blobs Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute w-72 h-72 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/3 left-2/3 w-72 h-72 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6">
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
      <motion.section
        className="relative z-10 container mx-auto px-4 py-20 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.h1
          className="text-5xl font-bold text-gray-900 dark:text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          The Ultimate Platform for{" "}
          <span className="text-indigo-600 dark:text-indigo-400">
            <Typewriter
              words={["Student Entrepreneurs"]}
              loop={1}
              cursor
              cursorStyle="_"
              typeSpeed={70}
              deleteSpeed={30}
              delaySpeed={700}
            />
          </span>
        </motion.h1>
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
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Everything You Need to Succeed</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Whether you're a service provider or looking to hire talent, SoloSuite has the tools to help you thrive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[{
            Icon: Sparkles,
            title: "AI-Powered Taskboard",
            description: "Generate detailed project tasks automatically using advanced AI",
            features: ["Smart task generation", "Priority and time estimation", "Progress tracking"]
          }, {
            Icon: Users,
            title: "Dual User System",
            description: "Separate dashboards for service providers and clients",
            features: ["Provider dashboard", "Client marketplace", "Role-based features"]
          }, {
            Icon: Briefcase,
            title: "Project Management",
            description: "Keep track of all your projects and deadlines in one place",
            features: ["Deadline tracking", "Client communication", "Revenue analytics"]
          }].map(({ Icon, title, description, features }, i) => (
            <motion.div
            key={title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="cursor-pointer"
            >

              <Card className="hover:shadow-xl transition-shadow border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader>
                  <Icon className="h-12 w-12 mb-4 text-indigo-600 dark:text-indigo-400" />
                  <CardTitle className="text-gray-900 dark:text-white">{title}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="relative z-10 container mx-auto px-4 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
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
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-300">
          <p>&copy; 2026 SoloSuite. Built for student entrepreneurs, by student entrepreneurs.</p>
        </div>
      </footer>
    </div>
  )
}
