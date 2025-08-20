"use client"

import { useEffect, useState } from "react"
import { getHomestays, updateHomestayStatus, getHomestayDetails } from "@/lib/admin-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusSelect } from "@/components/admin/status-select"
import { HomestayDetailModal } from "@/components/admin/homestay-detail-modal"

export default function ListHomestaysPage() {
  const [homestays, setHomestays] = useState<any[]>([])
  const [selectedHomestay, setSelectedHomestay] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const homestaysData = await getHomestays()
    setHomestays(homestaysData)
  }

  const handleStatusUpdate = async (homestayId: string, status: "approved" | "denied") => {
    await updateHomestayStatus(homestayId, status)
    fetchData()
  }

  const handleRowClick = async (homestay: any) => {
    const details = await getHomestayDetails(homestay.id)
    setSelectedHomestay({ ...homestay, ...details })
    setIsModalOpen(true)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Homestays</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Host</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {homestays.map((homestay) => (
            <TableRow key={homestay.id} onClick={() => handleRowClick(homestay)} className="cursor-pointer">
              <TableCell>{homestay.name}</TableCell>
              <TableCell>{homestay.hostName}</TableCell>
              <TableCell>{homestay.city}</TableCell>
              <TableCell>{homestay.status}</TableCell>
              <TableCell>
                <StatusSelect
                  defaultValue={homestay.status}
                  onValueChange={(value) => handleStatusUpdate(homestay.id, value as "approved" | "denied")}
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                    { value: "denied", label: "Denied" },
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <HomestayDetailModal
        homestay={selectedHomestay}
        host={selectedHomestay?.host}
        rooms={selectedHomestay?.rooms}
        bookings={selectedHomestay?.bookings}
        revenue={selectedHomestay?.revenue}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
