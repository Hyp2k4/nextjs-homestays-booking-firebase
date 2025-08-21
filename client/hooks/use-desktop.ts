import * as React from "react"

const DESKTOP_BREAKPOINT = 1280 // xl breakpoint

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`)
    
    const onChange = () => {
      setIsDesktop(mql.matches)
    }

    mql.addEventListener("change", onChange)
    setIsDesktop(mql.matches) // Set initial value

    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isDesktop
}
