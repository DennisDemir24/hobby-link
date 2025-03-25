import { useEffect, useState } from "react";


  interface SwipeConfig {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    minSwipeDistance?: number
  }
  
  export function useSwipe({ onSwipeLeft, onSwipeRight, minSwipeDistance = 50 }: SwipeConfig) {
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)
  
    // The required distance between touchStart and touchEnd to be detected as a swipe
    const minSwipeDistanceValue = minSwipeDistance // min distance required for swipe
  
    useEffect(() => {
      const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(null) // reset touchEnd
        setTouchStart(e.targetTouches[0].clientX)
      }
  
      const onTouchMove = (e: TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
      }
  
      const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return
        
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistanceValue
        const isRightSwipe = distance < -minSwipeDistanceValue
        
        if (isLeftSwipe && onSwipeLeft) {
          onSwipeLeft()
        }
        
        if (isRightSwipe && onSwipeRight) {
          onSwipeRight()
        }
      }
  
      document.addEventListener('touchstart', onTouchStart)
      document.addEventListener('touchmove', onTouchMove)
      document.addEventListener('touchend', onTouchEnd)
  
      return () => {
        document.removeEventListener('touchstart', onTouchStart)
        document.removeEventListener('touchmove', onTouchMove)
        document.removeEventListener('touchend', onTouchEnd)
      }
    }, [onSwipeLeft, onSwipeRight, touchStart, touchEnd, minSwipeDistanceValue])
  
    return {}
  }
  