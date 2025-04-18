import "./globals.css"

export const metadata = {
  title: "maru2katabami",
  description: "",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}