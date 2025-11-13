import Link from 'next/link'
import { BookOpen, Users, GitBranch, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            StoryVote
          </h1>
        </div>
        <nav className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-blue-600 transition">
            Login
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create Stories Together
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Collaborate with friends to build branching narratives powered by AI.
            Vote on what happens next, explore alternate timelines, and generate
            beautiful illustrated storybooks.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Start Creating
            </Link>
            <Link
              href="/explore"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-50 transition shadow-lg hover:shadow-xl border-2 border-blue-600"
            >
              Explore Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Sparkles className="h-8 w-8 text-blue-600" />}
            title="AI-Powered"
            description="Generate story continuations, illustrations, and audiobooks with cutting-edge AI"
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-purple-600" />}
            title="Collaborative"
            description="Create stories with friends through democratic voting and shared creativity"
          />
          <FeatureCard
            icon={<GitBranch className="h-8 w-8 text-pink-600" />}
            title="Branching Paths"
            description="Explore alternate timelines and create multiple story outcomes"
          />
          <FeatureCard
            icon={<BookOpen className="h-8 w-8 text-indigo-600" />}
            title="Rich Outputs"
            description="Export as illustrated books, audiobooks, PDFs, or shareable web stories"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-4xl font-bold text-center mb-16">How It Works</h3>
        <div className="max-w-4xl mx-auto space-y-12">
          <Step
            number="1"
            title="Create a Story"
            description="Choose your genre, tone, and length. AI generates an engaging opening scene."
          />
          <Step
            number="2"
            title="Vote & Contribute"
            description="The group votes on what happens next. Add your own ideas or let AI suggest options."
          />
          <Step
            number="3"
            title="Branch & Explore"
            description="Create alternate timelines. Explore different paths and see where each choice leads."
          />
          <Step
            number="4"
            title="Generate & Share"
            description="Create illustrated books, audiobooks, or share your story online."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white shadow-2xl">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Your Story?</h3>
          <p className="text-lg mb-8 opacity-90">
            Join creative communities and build amazing stories together.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>© 2024 StoryVote. Built with AI and love.</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
      <div className="mb-4">{icon}</div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
        {number}
      </div>
      <div>
        <h4 className="text-2xl font-semibold mb-2">{title}</h4>
        <p className="text-gray-600 text-lg">{description}</p>
      </div>
    </div>
  )
}
