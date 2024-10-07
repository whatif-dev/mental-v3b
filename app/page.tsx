import { Button } from "@/components/ui/button"
import Link from "next/link"
import { supabase } from '@/lib/supabase'

export default async function Home() {
  // Test Supabase connection
  const { data, error } = await supabase.from('patients').select('*').limit(1)

  if (error) {
    console.error('Error connecting to Supabase:', error)
  } else {
    console.log('Successfully connected to Supabase')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to Mental Health Billing</h1>
        {error && (
          <p className="text-red-500">Error connecting to database. Check console for details.</p>
        )}
        {data && (
          <p className="text-green-500">Successfully connected to database.</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
        <Link href="/appointments" className="w-full">
          <Button className="w-full">Appointments</Button>
        </Link>
        <Link href="/billing" className="w-full">
          <Button className="w-full">Billing</Button>
        </Link>
        <Link href="/rx" className="w-full">
          <Button className="w-full">Rx</Button>
        </Link>
        <Link href="/communications" className="w-full">
          <Button className="w-full">Communications</Button>
        </Link>
      </div>
    </div>
  )
}