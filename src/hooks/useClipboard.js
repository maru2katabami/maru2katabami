// hooks/useClipboard.js
import { useCallback } from "react";

const useClipboard = () => {
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }, []);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (err) {
      console.error("Failed to paste: ", err);
      return "";
    }
  }, []);

  return { copyToClipboard, pasteFromClipboard };
};

export default useClipboard;
