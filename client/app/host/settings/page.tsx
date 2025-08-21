"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { HostService } from "@/lib/host-service"
import type { Property, Room } from "@/types/property"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, PlusCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

// Helper component for managing a list of rules
const RulesManager = ({ title, rules, onAddRule, onDeleteRule }: {
  title: string
  rules: string[]
  onAddRule: (rule: string) => Promise<void>
  onDeleteRule: (rule: string) => Promise<void>
}) => {
  const [newRule, setNewRule] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleAddRule = async () => {
    if (!newRule.trim()) {
      toast.error("Rule cannot be empty.")
      return
    }
    setIsAdding(true)
    await onAddRule(newRule.trim())
    setNewRule("")
    setIsAdding(false)
  }

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {rules && rules.length > 0 ? (
            rules.map((rule, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <span className="text-sm">+) {rule}</span>
                <Button variant="ghost" size="sm" onClick={() => onDeleteRule(rule)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500">No rules defined yet.</p>
          )}
        </ul>
        <div className="flex gap-2">
          <Input
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            placeholder="Add a new rule"
            onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
          />
          <Button onClick={handleAddRule} disabled={isAdding}>
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
            <span className="ml-2">Add</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HostSettingsPage() {
  const { user } = useAuth()
  const [allHomestays, setAllHomestays] = useState<Property[]>([])
  const [selectedHomestay, setSelectedHomestay] = useState<Property | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRooms, setLoadingRooms] = useState(false)

  useEffect(() => {
    const fetchHomestays = async () => {
      if (!user) return
      setLoading(true)
      try {
        const hostHomestays = await HostService.getHostHomestays(user.id)
        setAllHomestays(hostHomestays)
        if (hostHomestays.length > 0) {
          // Automatically select the first homestay
          handleHomestaySelect(hostHomestays[0].id)
        }
      } catch (error) {
        toast.error("Failed to fetch homestays.")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchHomestays()
  }, [user])

  const handleHomestaySelect = async (homestayId: string) => {
    if (!user) return
    const newSelectedHomestay = allHomestays.find(h => h.id === homestayId)
    if (!newSelectedHomestay) return

    setSelectedHomestay(newSelectedHomestay)
    setLoadingRooms(true)
    try {
      const hostRooms = await HostService.getHostRooms(user.id, homestayId)
      setRooms(hostRooms)
    } catch (error) {
      toast.error("Failed to fetch rooms for the selected homestay.")
      console.error(error)
    } finally {
      setLoadingRooms(false)
    }
  }

  const refreshData = async () => {
    if (selectedHomestay) {
      handleHomestaySelect(selectedHomestay.id)
    }
  }

  const handleAddHomestayRule = async (rule: string) => {
    if (!user || !selectedHomestay) return
    const success = await HostService.addHomestayRule(selectedHomestay.id, rule, user.id)
    if (success) {
      toast.success("Homestay rule added.")
      refreshData() // Refresh data
    } else {
      toast.error("Failed to add homestay rule.")
    }
  }

  const handleDeleteHomestayRule = async (rule: string) => {
    if (!user || !selectedHomestay) return
    const success = await HostService.deleteHomestayRule(selectedHomestay.id, rule, user.id)
    if (success) {
      toast.success("Homestay rule deleted.")
      refreshData() // Refresh data
    } else {
      toast.error("Failed to delete homestay rule.")
    }
  }

  const handleAddRoomRule = async (roomId: string, rule: string) => {
    if (!user) return
    const success = await HostService.addRoomRule(roomId, rule, user.id)
    if (success) {
      toast.success("Room rule added.")
      refreshData() // Refresh data
    } else {
      toast.error("Failed to add room rule.")
    }
  }

  const handleDeleteRoomRule = async (roomId: string, rule: string) => {
    if (!user) return
    const success = await HostService.deleteRoomRule(roomId, rule, user.id)
    if (success) {
      toast.success("Room rule deleted.")
      refreshData() // Refresh data
    } else {
      toast.error("Failed to delete room rule.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (allHomestays.length === 0) {
    return (
      <div className="text-center py-10">
        <p>You have not registered any homestays yet.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Host Settings</h1>
        <p className="text-lg text-gray-500 mt-2">Manage rules for your properties and rooms.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="p-4">
              <CardTitle>Select Homestay</CardTitle>
              <CardDescription>Choose the property to manage.</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleHomestaySelect} value={selectedHomestay?.id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a homestay..." />
                </SelectTrigger>
                <SelectContent>
                  {allHomestays.map(h => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedHomestay && (
            <RulesManager
              title={`General Rules for ${selectedHomestay.name}`}
              rules={selectedHomestay.rules || []}
              onAddRule={handleAddHomestayRule}
              onDeleteRule={handleDeleteHomestayRule}
            />
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 mt-8 lg:mt-0">
          {selectedHomestay && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="p-4">
                <CardTitle>Room Specific Rules</CardTitle>
                <CardDescription>Set additional rules for each individual room in {selectedHomestay.name}.</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRooms ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : rooms.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {rooms.map(room => (
                      <AccordionItem value={room.id} key={room.id}>
                        <AccordionTrigger className="text-base font-semibold">{room.roomName} ({room.roomCode})</AccordionTrigger>
                        <AccordionContent className="p-4">
                          <RulesManager
                            title={`Rules for ${room.roomName}`}
                            rules={room.rules || []}
                            onAddRule={(rule) => handleAddRoomRule(room.id, rule)}
                            onDeleteRule={(rule) => handleDeleteRoomRule(room.id, rule)}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No rooms found for this homestay.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
