import { useCallback } from "react"
import toast from "react-hot-toast"

export default function useClipboard() {

  const handleCopy = useCallback( async ( text ) => {
    await navigator.clipboard.writeText( text )
    toast("コピーしました", { duration: 3000 })
  }, [])

  const handlePaste = useCallback( async () => {
    const text = await navigator.clipboard.readText()
    toast("ペーストしました", { duration: 3000 })
    return text
  }, [])

  return { handleCopy, handlePaste }
}
