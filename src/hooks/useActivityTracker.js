import { useState, useRef, useCallback } from 'react'

export function useActivityTracker() {
  const [isTracking, setIsTracking] = useState(false)
  const [activityData, setActivityData] = useState({
    mouseClicks: 0,
    keyPresses: 0,
    mouseMovements: 0,
    lastActive: null
  })
  
  const timeoutRef = useRef(null)
  const activityRef = useRef(activityData)
  
  // Update reference when state changes
  activityRef.current = activityData
  
  // Track mouse clicks
  const handleMouseClick = useCallback(() => {
    setActivityData(prev => ({
      ...prev,
      mouseClicks: prev.mouseClicks + 1,
      lastActive: new Date()
    }))
    
    // In a real app, you might send this data to your backend
    console.log('Mouse click detected')
  }, [])
  
  // Track key presses
  const handleKeyPress = useCallback(() => {
    setActivityData(prev => ({
      ...prev,
      keyPresses: prev.keyPresses + 1,
      lastActive: new Date()
    }))
    
    // In a real app, you might send this data to your backend
    console.log('Key press detected')
  }, [])
  
  // Track mouse movements (throttled)
  const handleMouseMove = useCallback(() => {
    if (timeoutRef.current) return
    
    timeoutRef.current = setTimeout(() => {
      setActivityData(prev => ({
        ...prev,
        mouseMovements: prev.mouseMovements + 1,
        lastActive: new Date()
      }))
      
      // In a real app, you might send this data to your backend periodically
      timeoutRef.current = null
    }, 500) // Throttle to avoid too many updates
  }, [])
  
  // Start tracking user activity
  const startTracking = useCallback(() => {
    if (isTracking) return
    
    window.addEventListener('click', handleMouseClick)
    window.addEventListener('keydown', handleKeyPress)
    window.addEventListener('mousemove', handleMouseMove)
    
    setIsTracking(true)
    console.log('Activity tracking started')
    
    return () => {
      window.removeEventListener('click', handleMouseClick)
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isTracking, handleMouseClick, handleKeyPress, handleMouseMove])
  
  // Stop tracking user activity
  const stopTracking = useCallback(() => {
    if (!isTracking) return
    
    window.removeEventListener('click', handleMouseClick)
    window.removeEventListener('keydown', handleKeyPress)
    window.removeEventListener('mousemove', handleMouseMove)
    
    setIsTracking(false)
    console.log('Activity tracking stopped')
  }, [isTracking, handleMouseClick, handleKeyPress, handleMouseMove])
  
  // Periodically send activity data to the server
  const sendActivityData = useCallback(() => {
    // In a real application, you would send this data to your backend
    console.log('Sending activity data to server:', activityRef.current)
    
    // Reset counters after sending
    setActivityData(prev => ({
      ...prev,
      mouseClicks: 0,
      keyPresses: 0,
      mouseMovements: 0
    }))
  }, [])
  
  return {
    isTracking,
    activityData,
    startTracking,
    stopTracking,
    sendActivityData
  }
}