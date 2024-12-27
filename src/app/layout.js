import "./globals.css"
import { Toaster } from "react-hot-toast"

export const metadata = {
  title: "maru2katabami",
  description: "",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        
      </head>
      <body>
        <Toaster/>
        { children }
      </body>
    </html>
  );
}
