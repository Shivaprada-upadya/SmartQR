import { useState } from 'react'

export default function useDashboardNavigation(user) {
  const [activeNav, setActiveNav] = useState('Overview')

  const userInitials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const scrollToSection = (target, label) => {
    setActiveNav(label)
    document.getElementById(target)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return { activeNav, setActiveNav, userInitials, scrollToSection }
}
