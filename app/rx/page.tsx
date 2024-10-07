"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'
import { usePatient } from '@/contexts/PatientContext'
import { useToast } from "@/hooks/use-toast"

export default function RxPage() {
  const [prescriptions, setPrescriptions] = useState([])
  const [patients, setPatients] = useState([])
  const { selectedPatient, setSelectedPatient } = usePatient()
  const { toast } = useToast()
  const [newPrescription, setNewPrescription] = useState({
    medication_name: '',
    dosage: '',
    instructions: '',
    prescribed_date: new Date().toISOString().split('T')[0],
    end_date: ''
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      fetchPrescriptions()
    } else {
      setPrescriptions([])
    }
  }, [selectedPatient])

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

  async function fetchPrescriptions() {
    if (!selectedPatient) return

    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', selectedPatient.id)
      .order('prescribed_date', { ascending: false })
    
    if (error) {
      console.error('Error fetching prescriptions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch prescriptions. Please try again.",
        variant: "destructive",
      })
    } else {
      setPrescriptions(data)
    }
  }

  async function addPrescription(e) {
    e.preventDefault()
    
    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient first.",
        variant: "destructive",
      })
      return
    }

    // Create a new object without the end_date if it's empty
    const prescriptionToInsert = {
      ...newPrescription,
      patient_id: selectedPatient.id
    }
    if (!prescriptionToInsert.end_date) {
      delete prescriptionToInsert.end_date
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .insert([prescriptionToInsert])
    
    if (error) {
      console.error('Error adding prescription:', error)
      toast({
        title: "Error",
        description: "Failed to add prescription. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Prescription added successfully.",
      })
      setNewPrescription({
        medication_name: '',
        dosage: '',
        instructions: '',
        prescribed_date: new Date().toISOString().split('T')[0],
        end_date: ''
      })
      fetchPrescriptions()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Prescriptions (Rx)</h1>
      
      <div className="mb-8">
        <Label htmlFor="patient-select">Select Patient</Label>
        <Select
          value={selectedPatient?.id}
          onValueChange={(value) => {
            const patient = patients.find(p => p.id === value)
            setSelectedPatient(patient)
          }}
        >
          <SelectTrigger id="patient-select">
            <SelectValue placeholder="Select a patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>{patient.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedPatient ? (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Prescription for {selectedPatient.full_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addPrescription} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medication_name">Medication Name</Label>
                  <Input
                    id="medication_name"
                    value={newPrescription.medication_name}
                    onChange={(e) => setNewPrescription({...newPrescription, medication_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    value={newPrescription.dosage}
                    onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={newPrescription.instructions}
                    onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prescribed_date">Prescribed Date</Label>
                  <Input
                    id="prescribed_date"
                    type="date"
                    value={newPrescription.prescribed_date}
                    onChange={(e) => setNewPrescription({...newPrescription, prescribed_date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date (optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newPrescription.end_date}
                    onChange={(e) => setNewPrescription({...newPrescription, end_date: e.target.value})}
                  />
                </div>
                <Button type="submit">Add Prescription</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Prescriptions for {selectedPatient.full_name}</CardTitle>
            </CardHeader>
            <CardContent>
              {prescriptions.length === 0 ? (
                <p>No prescriptions found for this patient.</p>
              ) : (
                <ul className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <li key={prescription.id} className="border p-4 rounded-md">
                      <h3 className="font-bold">{prescription.medication_name}</h3>
                      <p><strong>Dosage:</strong> {prescription.dosage}</p>
                      <p><strong>Instructions:</strong> {prescription.instructions}</p>
                      <p><strong>Prescribed Date:</strong> {new Date(prescription.prescribed_date).toLocaleDateString()}</p>
                      {prescription.end_date && (
                        <p><strong>End Date:</strong> {new Date(prescription.end_date).toLocaleDateString()}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <p>Please select a patient to view and manage prescriptions.</p>
      )}
    </div>
  )
}