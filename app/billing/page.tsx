"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from '@/lib/supabase'
import { Pencil } from 'lucide-react'
import { usePatient } from '@/contexts/PatientContext'

const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
  "District of Columbia", "American Samoa", "Guam", "Northern Mariana Islands", "Puerto Rico", "U.S. Virgin Islands"
]

export default function BillingPage() {
  const { toast } = useToast()
  const { selectedPatient, setSelectedPatient } = usePatient()
  const [patients, setPatients] = useState([])
  const [patientInfo, setPatientInfo] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  })
  const [responsibleParty, setResponsibleParty] = useState({
    insurance_type: '',
    full_name: '',
    date_of_birth: '',
    phone_number: '',
    email: ''
  })
  const [insuranceInfo, setInsuranceInfo] = useState({
    carrier_name: '',
    group_number: '',
    phone_number: '',
    subscriber_relationship: ''
  })
  const [isEditingPatient, setIsEditingPatient] = useState(false)
  const [isEditingResponsibleParty, setIsEditingResponsibleParty] = useState(false)
  const [isEditingInsurance, setIsEditingInsurance] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientInfo(selectedPatient.id)
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

  async function fetchPatientInfo(patientId) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single()
    
    if (error) {
      console.error('Error fetching patient info:', error)
      toast({
        title: "Error",
        description: "Failed to fetch patient information. Please try again.",
        variant: "destructive",
      })
    } else {
      setPatientInfo({
        full_name: data.full_name || '',
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || '',
        phone_number: data.phone_number || '',
        email: data.email || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zip_code: data.zip_code || ''
      })
      fetchResponsibleParty(patientId)
      fetchInsuranceInfo(patientId)
    }
  }

  async function fetchResponsibleParty(patientId) {
    const { data, error } = await supabase
      .from('responsible_parties')
      .select('*')
      .eq('patient_id', patientId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching responsible party:', error)
      toast({
        title: "Error",
        description: "Failed to fetch responsible party information. Please try again.",
        variant: "destructive",
      })
    } else if (data) {
      setResponsibleParty({
        insurance_type: data.insurance_type || '',
        full_name: data.full_name || '',
        date_of_birth: data.date_of_birth || '',
        phone_number: data.phone_number || '',
        email: data.email || ''
      })
    } else {
      setResponsibleParty({
        insurance_type: '',
        full_name: '',
        date_of_birth: '',
        phone_number: '',
        email: ''
      })
    }
  }

  async function fetchInsuranceInfo(patientId) {
    const { data, error } = await supabase
      .from('insurance_information')
      .select('*')
      .eq('patient_id', patientId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching insurance info:', error)
      toast({
        title: "Error",
        description: "Failed to fetch insurance information. Please try again.",
        variant: "destructive",
      })
    } else if (data) {
      setInsuranceInfo({
        carrier_name: data.carrier_name || '',
        group_number: data.group_number || '',
        phone_number: data.phone_number || '',
        subscriber_relationship: data.subscriber_relationship || ''
      })
    } else {
      setInsuranceInfo({
        carrier_name: '',
        group_number: '',
        phone_number: '',
        subscriber_relationship: ''
      })
    }
  }

  async function updatePatientInfo() {
    const { error } = await supabase
      .from('patients')
      .update(patientInfo)
      .eq('id', selectedPatient.id)
    
    if (error) {
      console.error('Error updating patient info:', error)
      toast({
        title: "Error",
        description: "Failed to update patient information. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Patient information updated successfully.",
      })
      setIsEditingPatient(false)
    }
  }

  async function updateResponsibleParty() {
    const { error } = await supabase
      .from('responsible_parties')
      .upsert({ ...responsibleParty, patient_id: selectedPatient.id })
    
    if (error) {
      console.error('Error updating responsible party:', error)
      toast({
        title: "Error",
        description: "Failed to update responsible party information. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Responsible party information updated successfully.",
      })
      setIsEditingResponsibleParty(false)
    }
  }

  async function updateInsuranceInfo() {
    const { error } = await supabase
      .from('insurance_information')
      .upsert({ ...insuranceInfo, patient_id: selectedPatient.id })
    
    if (error) {
      console.error('Error updating insurance info:', error)
      toast({
        title: "Error",
        description: "Failed to update insurance information. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Insurance information updated successfully.",
      })
      setIsEditingInsurance(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Billing</h1>
      <div className="mb-4">
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
      {selectedPatient && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Patient Information</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsEditingPatient(!isEditingPatient)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isEditingPatient ? (
                <form onSubmit={(e) => { e.preventDefault(); updatePatientInfo(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={patientInfo.full_name}
                      onChange={(e) => setPatientInfo({...patientInfo, full_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={patientInfo.date_of_birth}
                      onChange={(e) => setPatientInfo({...patientInfo, date_of_birth: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      value={patientInfo.gender}
                      onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={patientInfo.phone_number}
                      onChange={(e) => setPatientInfo({...patientInfo, phone_number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={patientInfo.email}
                      onChange={(e) => setPatientInfo({...patientInfo, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={patientInfo.address}
                      onChange={(e) => setPatientInfo({...patientInfo, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={patientInfo.city}
                      onChange={(e) => setPatientInfo({...patientInfo, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={patientInfo.state}
                      onValueChange={(value) => setPatientInfo({...patientInfo, state: value})}
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">ZIP Code</Label>
                    <Input
                      id="zip_code"
                      value={patientInfo.zip_code}
                      onChange={(e) => setPatientInfo({...patientInfo, zip_code: e.target.value})}
                    />
                  </div>
                  <Button type="submit">Save Changes</Button>
                </form>
              ) : (
                <div className="space-y-2">
                  <p><strong>Full Name:</strong> {patientInfo.full_name}</p>
                  <p><strong>Date of Birth:</strong> {patientInfo.date_of_birth}</p>
                  <p><strong>Gender:</strong> {patientInfo.gender}</p>
                  <p><strong>Phone Number:</strong> {patientInfo.phone_number}</p>
                  <p><strong>Email:</strong> {patientInfo.email}</p>
                  <p><strong>Address:</strong> {patientInfo.address}</p>
                  <p><strong>City:</strong> {patientInfo.city}</p>
                  <p><strong>State:</strong> {patientInfo.state}</p>
                  <p><strong>ZIP Code:</strong> {patientInfo.zip_code}</p>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Responsible Party</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsEditingResponsibleParty(!isEditingResponsibleParty)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {isEditingResponsibleParty ? (
                  <form onSubmit={(e) => { e.preventDefault(); updateResponsibleParty(); }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="insurance_type">Insurance Type</Label>
                      <Input
                        id="insurance_type"
                        value={responsibleParty.insurance_type}
                        onChange={(e) => setResponsibleParty({...responsibleParty, insurance_type: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rp_full_name">Full Name</Label>
                      <Input
                        id="rp_full_name"
                        value={responsibleParty.full_name}
                        onChange={(e) => setResponsibleParty({...responsibleParty, full_name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rp_date_of_birth">Date of Birth</Label>
                      <Input
                        id="rp_date_of_birth"
                        type="date"
                        value={responsibleParty.date_of_birth}
                        onChange={(e) => setResponsibleParty({...responsibleParty, date_of_birth: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rp_phone_number">Phone Number</Label>
                      <Input
                        id="rp_phone_number"
                        value={responsibleParty.phone_number}
                        onChange={(e) => setResponsibleParty({...responsibleParty, phone_number: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rp_email">Email</Label>
                      <Input
                        id="rp_email"
                        type="email"
                        value={responsibleParty.email}
                        onChange={(e) => setResponsibleParty({...responsibleParty, email: e.target.value})}
                      />
                    </div>
                    <Button type="submit">Save Changes</Button>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <p><strong>Insurance Type:</strong> {responsibleParty.insurance_type}</p>
                    <p><strong>Full Name:</strong> {responsibleParty.full_name}</p>
                    <p><strong>Date of Birth:</strong> {responsibleParty.date_of_birth}</p>
                    <p><strong>Phone Number:</strong> {responsibleParty.phone_number}</p>
                    <p><strong>Email:</strong> {responsibleParty.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Insurance Information</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsEditingInsurance(!isEditingInsurance)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {isEditingInsurance ? (
                  <form onSubmit={(e) => { e.preventDefault(); updateInsuranceInfo(); }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="carrier_name">Carrier Name</Label>
                      <Input
                        id="carrier_name"
                        value={insuranceInfo.carrier_name}
                        onChange={(e) => setInsuranceInfo({...insuranceInfo, carrier_name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="group_number">Group Number</Label>
                      <Input
                        id="group_number"
                        value={insuranceInfo.group_number}
                        onChange={(e) => setInsuranceInfo({...insuranceInfo, group_number: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ins_phone_number">Phone Number</Label>
                      <Input
                        id="ins_phone_number"
                        value={insuranceInfo.phone_number}
                        onChange={(e) => setInsuranceInfo({...insuranceInfo, phone_number: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscriber_relationship">Subscriber Relationship</Label>
                      <Input
                        id="subscriber_relationship"
                        value={insuranceInfo.subscriber_relationship}
                        onChange={(e) => setInsuranceInfo({...insuranceInfo, subscriber_relationship: e.target.value})}
                      />
                    </div>
                    <Button type="submit">Save Changes</Button>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <p><strong>Carrier Name:</strong> {insuranceInfo.carrier_name}</p>
                    <p><strong>Group Number:</strong> {insuranceInfo.group_number}</p>
                    <p><strong>Phone Number:</strong> {insuranceInfo.phone_number}</p>
                    <p><strong>Subscriber Relationship:</strong> {insuranceInfo.subscriber_relationship}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}