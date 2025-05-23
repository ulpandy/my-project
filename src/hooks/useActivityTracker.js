import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

const AI_SITES = ['chat.openai.com', 'bard.google.com', 'copilot.microsoft.com']

export function useActivityTracker() {
  const [isTracking, setIsTracking] = useState(false)
  const [lastActive, setLastActive] = useState(null)
  const intervalRef = useRef(null)
  const activityBuffer = useRef([])
  const lastWindow = useRef('')

  useEffect(() => {
    const handleClick = () => bufferEvent('mouse_click')
    const handleKeydown = () => bufferEvent('key_press')
    const handleMouseMove = () => bufferEvent('mouse_move')

    if (isTracking) {
      window.addEventListener('click', handleClick)
      window.addEventListener('keydown', handleKeydown)
      window.addEventListener('mousemove', handleMouseMove)
      intervalRef.current = setInterval(() => {
        detectWindow()
        sendBufferedEvents()
      }, 10000)
    }

    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('mousemove', handleMouseMove)
      clearInterval(intervalRef.current)
    }
  }, [isTracking])

  function bufferEvent(type, extraData = {}) {
    activityBuffer.current.push({
      type,
      timestamp: new Date().toISOString(),
      ...extraData
    })
    setLastActive(new Date())
  }

  function detectWindow() {
    try {
      const activeUrl = document.hasFocus() ? window.location.href : null
      const domain = activeUrl ? new URL(activeUrl).hostname : 'none'
      if (domain && domain !== lastWindow.current) {
        lastWindow.current = domain
        bufferEvent('window_switch', {
          title: document.title,
          url: activeUrl
        })
      }
    } catch (e) {
      console.warn('Window switch detection error:', e)
    }
  }

  async function sendBufferedEvents() {
    const token = localStorage.getItem('token')
    if (!token || activityBuffer.current.length === 0) return

    const grouped = {
      mouseClicks: 0,
      keyPresses: 0,
      mouseMovements: 0
    }

    const events = activityBuffer.current
    activityBuffer.current = []

    for (const event of events) {
      if (event.type === 'mouse_click') grouped.mouseClicks++
      else if (event.type === 'key_press') grouped.keyPresses++
      else if (event.type === 'mouse_move') grouped.mouseMovements++
      else if (event.type === 'window_switch') {
        const isAiTool = AI_SITES.includes(new URL(event.url).hostname)
        try {
          await axios.post('http://localhost:3000/api/activity', {
            type: 'window-switch',
            timestamp: event.timestamp,
            title: event.title,
            url: event.url,
            isAiTool
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
        } catch (err) {
          console.error('Failed to log window switch:', err)
        }
      }
    }

    if (grouped.mouseClicks || grouped.keyPresses || grouped.mouseMovements) {
      try {
        await axios.post('http://localhost:3000/api/activity', {
          type: 'user-activity',
          timestamp: new Date().toISOString(),
          mouseClicks: grouped.mouseClicks,
          keyPresses: grouped.keyPresses,
          mouseMovements: grouped.mouseMovements
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (err) {
        console.error('Failed to log user activity:', err)
      }
    }
  }

  return {
    isTracking,
    startTracking: () => setIsTracking(true),
    stopTracking: () => setIsTracking(false),
    lastActive
  }
}
