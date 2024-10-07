"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from '@/lib/supabase'
import { Pencil, UserPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { usePatient } from '@/contexts/PatientContext'

export default function AppointmentsPage() {
  const { toast } = useToast()
  const { selectedPatient, setSelectedPatient } = usePatient()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState('')
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [newPatient, setNewPatient] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    email: '',
  })
  const [isAddingPatient, setIsAddingPatient] = useState(false)

  useEffect(() => {
    fetchPatients()
    fetchAppointments()
  }, [])

  async function fetchPatients() {
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name')
      .order('full_name', { ascending: true })
    
    if (error) {
      console.error('Error fetching patients:', error)
      toast({
        title: "Error",
        description: "Failed to fetch patients. Please try again.",
        variant: "destructive",
      })
    } else {
      setPatients(data || [])
    }
  }

  async function fetchAppointments() {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        status,
        patient_id,
        patients (
          full_name
        )
      `)
      .order('appointment_date', { ascending: true })
    
    if (error) {
      console.error('Error fetching appointments:', error)
      toast({
        title: "Error",
        description: "Failed to fetch appointments. Please try again.",
        variant: "destructive",
      })
    } else {
      setAppointments(data || [])
    }
  }

  async function scheduleAppointment() {
    if (!date || !time || !selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a date, time, and patient.",
        variant: "destructive",
      })
      return
    }

    const appointmentDate = new Date(date)
    const [hours, minutes] = time.split(':')
    appointmentDate.setHours(parseInt(hours), parseInt(minutes))

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: selectedPatient.id,
        appointment_date: appointmentDate.toISOString(),
        status: 'scheduled'
      })
    
    if (error) {
      console.error('Error scheduling appointment:', error)
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Appointment scheduled successfully.",
      })
      setDate(new Date())
      setTime('')
      fetchAppointments()
    }
  }

  async function updateAppointment() {
    if (!editingAppointment || !editingAppointment.date || !editingAppointment.time || !editingAppointment.patient_id) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    const appointmentDate = new Date(editingAppointment.date)
    const [hours, minutes] = editingAppointment.time.split(':')
    appointmentDate.setHours(parseInt(hours), parseInt(minutes))

    const { data, error } = await supabase
      .from('appointments')
      .update({
        patient_id: editingAppointment.patient_id,
        appointment_date: appointmentDate.toISOString(),
        status: editingAppointment.status
      })
      .eq('id', editingAppointment.id)
    
    if (error) {
      console.error('Error updating appointment:', error)
      toast({
        title: "Error",
        description: "Failed to update appointment. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Appointment updated successfully.",
      })
      setEditingAppointment(null)
      fetchAppointments()
    }
  }

  function handleEdit(appointment) {
    const appointmentDate = new Date(appointment.appointment_date)
    setEditingAppointment({
      ...appointment,
      date: appointmentDate,
      time: appointmentDate.toTimeString().slice(0, 5)
    })
  }

  async function addPatient(e) {
    e.preventDefault()
    const { data, error } = await supabase
      .from('patients')
      .insert([newPatient])
    
    if (error) {
      console.error('Error adding patient:', error)
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Patient added successfully.",
      })
      setNewPatient({
        full_name: '',
        date_of_birth: '',
        gender: '',
        phone_number: '',
        email: '',
      })
      setIsAddingPatient(false)
      fetchPatients()
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Appointments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="patient">Patient</Label>
                <Dialog open={isAddingPatient} onOpenChange={setIsAddingPatient}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add New Patient
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Patient</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={addPatient} className="space-y-4">
                      {/* ... (rest of the form remains the same) ... */}
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <Select
                value={selectedPatient?.id}
                onValueChange={(value) => {
                  const patient = patients.find(p => p.id === value)
                  setSelectedPatient(patient)
                }}
              >
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>{patient.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <Label>Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <Button onClick={scheduleAppointment}>Schedule Appointment</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p>No upcoming appointments</p>
            ) : (
              <ul className="space-y-2">
                {appointments.map((appointment) => (
                  <li key={appointment.id} className="border p-2 rounded flex justify-between items-center">
                    <div>
                      <p><strong>Patient:</strong> {appointment.patients.full_name}</p>
                      <p><strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleString()}</p>
                      <p><strong>Status:</strong> {appointment.status}</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(appointment)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Appointment</DialogTitle>
                        </DialogHeader>
                        {editingAppointment && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-patient">Patient</Label>
                              <Select
                                value={editingAppointment.patient_id}
                                onValueChange={(value) => {
                                  setEditingAppointment({...editingAppointment, patient_id: value})
                                  const patient = patients.find(p => p.id === value)
                                  setSelectedPatient(patient)
                                }}
                              >
                                <SelectTrigger id="edit-patient">
                                  <SelectValue placeholder="Select a patient" />
                                </SelectTrigger>
                                <SelectContent>
                                  {patients.map((patient) => (
                                    <SelectItem key={patient.id} value={patient.id}>{patient.full_name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-date">Date</Label>
                              <Input
                                id="edit-date"
                                type="date"
                                value={editingAppointment.date.toISOString().split('T')[0]}
                                onChange={(e) => setEditingAppointment({...editingAppointment, date: new Date(e.target.value)})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-time">Time</Label>
                              <Input
                                id="edit-time"
                                type="time"
                                value={editingAppointment.time}
                                onChange={(e) => setEditingAppointment({...editingAppointment, time: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-status">Status</Label>
                              <Select
                                value={editingAppointment.status}
                                onValueChange={(value) => setEditingAppointment({...editingAppointment, status: value})}
                              >
                                <SelectTrigger id="edit-status">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button onClick={updateAppointment}>Update Appointment</Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}