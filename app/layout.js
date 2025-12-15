





// import './../styles/globals.css'
// import Navigation from './navigation'

// export const metadata = {
//   title: 'Self Upgrade Planner',
//   description: 'Build discipline with daily commitment',
// }

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className="bg-gray-50 text-gray-900">
//         <Navigation />
//         <main className="min-h-screen">
//           {children}
//         </main>
//         <footer className="bg-white border-t mt-8">
//           <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
//             <p className="text-center text-gray-500 text-sm">
//               © {new Date().getFullYear()} Self Upgrade Planner. Discipline is freedom.
//             </p>
//           </div>
//         </footer>
//       </body>
//     </html>
//   )
// }









// /app/layout.js
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Ultimate Life Planner',
  description: 'Plan your perfect daily routine',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main>{children}</main>
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="mb-2">© 2024 Ultimate Life Planner. All rights reserved.</p>
            <p className="text-gray-400 text-sm">Built with ❤️ for better productivity</p>
          </div>
        </footer>
      </body>
    </html>
  )
}