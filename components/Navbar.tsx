"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { usePatient } from '@/contexts/PatientContext'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/appointments', label: 'Appointments' },
  { href: '/billing', label: 'Billing' },
  { href: '/rx', label: 'Rx' },
  { href: '/communications', label: 'Communications' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { selectedPatient } = usePatient()

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary mr-8">
              MH Billing
            </Link>
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="text-sm font-medium">
            {selectedPatient ? (
              <span>Current Patient: {selectedPatient.full_name}</span>
            ) : (
              <span>No patient selected</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}