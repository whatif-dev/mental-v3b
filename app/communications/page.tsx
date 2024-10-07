"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePatient } from '@/contexts/PatientContext'
import { supabase } from '@/lib/supabase'

export default function CommunicationsPage() {
  const [messages, setMessages] = useState([])
  const [patients, setPatients] = useState([])
  const { selectedPatient, setSelectedPatient } = usePatient()
  const [newMessage, setNewMessage] = useState({
    type: 'email',
    to: '',
    subject: '',
    content: ''
  })

  useEffect(() => {
    fetchPatients()
    fetchMessages()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      fetchMessages()
    }
  }, [selectedPatient])

  async function fetchPatients() {
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name, email, phone_number')
      .order('full_name', { ascending: true })
    
    if (error) {
      console.error('Error fetching patients:', error)
    } else {
      setPatients(data || [])
    }
  }

  async function fetchMessages() {
    if (!selectedPatient) return

    const { data, error } = await supabase
      .from('communications')
      .select('*')
      .eq('patient_id', selectedPatient.id)
      .order('sent_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching messages:', error)
    } else {
      setMessages(data || [])
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!selectedPatient) {
      alert('Please select a patient first')
      return
    }

    const messageToSend = {
      ...newMessage,
      patient_id: selectedPatient.id,
      sent_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('communications')
      .insert([messageToSend])

    if (error) {
      console.error('Error sending message:', error)
    } else {
      setMessages([...messages, messageToSend])
      setNewMessage({
        type: newMessage.type,
        to: '',
        subject: '',
        content: ''
      })
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Communications</h1>
      <div className="mb-4">
        <Label htmlFor="patient-select">Select Patient</Label>
        <Select
          value={selectedPatient?.id}
          onValueChange={(value) => {
            const patient = patients.find(p => p.id === value)
            setSelectedPatient(patient)
            setNewMessage(prev => ({
              ...prev,
              to: patient.email || patient.phone_number || ''
            }))
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
      <Tabs defaultValue="email" className="mb-8">
        <TabsList>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Send Email</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={sendMessage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-to">To</Label>
                  <Input
                    id="email-to"
                    type="email"
                    value={newMessage.to}
                    onChange={(e) => setNewMessage({...newMessage, to: e.target.value, type: 'email'})}
                    placeholder="patient@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Subject</Label>
                  <Input
                    id="email-subject"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                    placeholder="Enter email subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-body">Message</Label>
                  <Textarea
                    id="email-body"
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                    placeholder="Enter your message"
                  />
                </div>
                <Button type="submit">Send Email</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>Send SMS</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={sendMessage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sms-to">To</Label>
                  <Input
                    id="sms-to"
                    type="tel"
                    value={newMessage.to}
                    onChange={(e) => setNewMessage({...newMessage, to: e.target.value, type: 'sms'})}
                    placeholder="(123) 456-7890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sms-body">Message</Label>
                  <Textarea
                    id="sms-body"
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                    placeholder="Enter your message"
                  />
                </div>
                <Button type="submit">Send SMS</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p>No messages sent yet.</p>
          ) : (
            <ul className="space-y-2">
              {messages.map((message) => (
                <li key={message.id} className="bg-muted p-2 rounded">
                  <strong>{message.type === 'email' ? 'Email' : 'SMS'}:</strong> {message.content}
                  <br />
                  <small>Sent at: {new Date(message.sent_at).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}