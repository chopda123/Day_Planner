// import './../styles/globals.css'

// export const metadata = {
//   title: 'Todo App',
//   description: 'Next.js project with Supabase and Tailwind CSS',
// }

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className="bg-gray-50 text-gray-900">
//         <nav className="bg-white shadow-sm border-b">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex justify-between h-16">
//               <div className="flex items-center">
//                 <h1 className="text-xl font-bold text-primary">Todo App</h1>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
//                 <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
//               </div>
//             </div>
//           </div>
//         </nav>
//         <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//           {children}
//         </main>
//         <footer className="bg-white border-t mt-8">
//           <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
//             <p className="text-center text-gray-500 text-sm">
//               © 2024 Todo App. All rights reserved.
//             </p>
//           </div>
//         </footer>
//       </body>
//     </html>
//   )
// }





// import './../styles/globals.css'
// import { supabase } from '@/lib/supabaseClient'
// import AuthProvider from './auth-provider'
// import Navigation from './navigation'

// export const metadata = {
//   title: 'Self Upgrade Planner',
//   description: 'Build discipline with daily commitment',
// }

// export default async function RootLayout({ children }) {
//   const { data: { session } } = await supabase.auth.getSession()

//   return (
//     <html lang="en">
//       <body className="bg-gray-50 text-gray-900">
//         <AuthProvider session={session}>
//           <Navigation session={session} />
//           <main className="min-h-screen">
//             {children}
//           </main>
//           <footer className="bg-white border-t mt-8">
//             <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
//               <p className="text-center text-gray-500 text-sm">
//                 © {new Date().getFullYear()} Self Upgrade Planner. Discipline is freedom.
//               </p>
//             </div>
//           </footer>
//         </AuthProvider>
//       </body>
//     </html>
//   )
// }














import './../styles/globals.css'
import Navigation from './navigation'

export const metadata = {
  title: 'Self Upgrade Planner',
  description: 'Build discipline with daily commitment',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-white border-t mt-8">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} Self Upgrade Planner. Discipline is freedom.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}