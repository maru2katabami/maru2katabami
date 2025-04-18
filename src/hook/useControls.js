import { useEffect, useRef } from "react"

const keyControlMap = {
  " ": "brake",
  ArrowDown: "backward",
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "forward",
  a: "left",
  d: "right",
  r: "reset",
  s: "backward",
  w: "forward",
  j: "jump"
}

const isControlKey = key => Object.keys(keyControlMap).includes(key)

export function useControls() {
  // キー操作／タッチ操作の状態
  const controls = useRef({
    backward: false,
    brake:    false,
    forward:  false,
    left:     false,
    reset:    false,
    right:    false,
    jump:     false,
  })

  // タッチ開始位置などを保持
  const touchData = useRef({
    startX: 0,
    startY: 0,
    isTouching: false,
  })

  useEffect(() => {
    // キー押下／離鍵
    const onKeyDown = e => {
      if (!isControlKey(e.key)) return
      controls.current[keyControlMap[e.key]] = true
    }
    const onKeyUp = e => {
      if (!isControlKey(e.key)) return
      controls.current[keyControlMap[e.key]] = false
    }

    // タッチ開始：座標記録
    const onTouchStart = e => {
      const t = e.touches[0]
      touchData.current = {
        startX: t.clientX,
        startY: t.clientY,
        isTouching: true,
      }
    }
    // タッチ移動：スワイプ方向判定
    const onTouchMove = e => {
      if (!touchData.current.isTouching) return
      const t = e.touches[0]
      const dx = t.clientX - touchData.current.startX
      const dy = t.clientY - touchData.current.startY

      // 水平方向スワイプが大きいかどうか
      if (Math.abs(dx) > Math.abs(dy)) {
        controls.current.left  = dx < 0
        controls.current.right = dx > 0
        // 垂直方向フラグはオフ
        controls.current.forward  = false
        controls.current.backward = false
      } else {
        controls.current.forward  = dy < 0
        controls.current.backward = dy > 0
        // 水平フラグはオフ
        controls.current.left  = false
        controls.current.right = false
      }
    }
    // タッチ終了：全リセット
    const onTouchEnd = () => {
      touchData.current.isTouching = false
      Object.keys(controls.current).forEach(key => {
        controls.current[key] = false
      })
    }

    // イベント登録
    window.addEventListener("keydown",   onKeyDown)
    window.addEventListener("keyup",     onKeyUp)
    window.addEventListener("touchstart", onTouchStart)
    window.addEventListener("touchmove",  onTouchMove)
    window.addEventListener("touchend",   onTouchEnd)

    return () => {
      // クリーンアップ
      window.removeEventListener("keydown",   onKeyDown)
      window.removeEventListener("keyup",     onKeyUp)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove",  onTouchMove)
      window.removeEventListener("touchend",   onTouchEnd)
    }
  }, [])

  return controls
}
