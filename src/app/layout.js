import "./globals.css"
import { Dashboard } from "@/cmp/dashboard"

export const metadata = {
  title: "maru2katabmi",
  description: "",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        { children }
        <Dashboard/>
      </body>
    </html>
  )
}