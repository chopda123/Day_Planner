import Link from 'next/link'

export default function Home() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Welcome to <span className="text-primary">Todo App</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        A modern Next.js application with App Router, Tailwind CSS, and Supabase integration.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="font-semibold text-lg mb-2">Next.js 14</h3>
          <p className="text-gray-600">Using the latest App Router with server components.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="font-semibold text-lg mb-2">Tailwind CSS</h3>
          <p className="text-gray-600">Utility-first CSS framework for rapid UI development.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="font-semibold text-lg mb-2">Supabase</h3>
          <p className="text-gray-600">Open-source Firebase alternative with real-time database.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link
          href="/dashboard"
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
        
        <div className="mt-6">
          <a
            href="/api/health"
            target="_blank"
            className="text-secondary hover:underline"
          >
            Check API Health
          </a>
        </div>
      </div>
    </div>
  )
}