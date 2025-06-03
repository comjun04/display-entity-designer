import { useEffect, useState } from 'react'
import { LuMaximize, LuMinimize } from 'react-icons/lu'

const FullscreenToggle = () => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err)
      })
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Error attempting to exit fullscreen:', err)
      })
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <button className="rounded-lg bg-black p-2" onClick={toggleFullscreen}>
      {isFullscreen ? <LuMinimize size={24} /> : <LuMaximize size={24} />}
    </button>
  )
}

export default FullscreenToggle
