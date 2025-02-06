import "./globals.css"
import { Inter, Archivo } from "next/font/google"
import type React from "react" // Import React

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${archivo.variable}`}>
      <body className="font-sans bg-white text-gray-900">{children}</body>
    </html>
  )
}

