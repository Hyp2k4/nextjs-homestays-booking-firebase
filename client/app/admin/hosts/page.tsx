"use client"

import { useEffect, useState } from "react"
import { getHosts, updateUserStatus } from "@/lib/admin-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { StatusSelect } from "@/components/admin/status-select"

export default function ListHostsPage() {
  const [hosts, setHosts] = useState<any[]>([])
  const [filteredHosts, setFilteredHosts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const hostsData = await getHosts()
      setHosts(hostsData)
      setFilteredHosts(hostsData)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const results = hosts.filter((host) =>
      host.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredHosts(results)
  }, [searchTerm, hosts])

  const handleUserStatusUpdate = async (userId: string, isBanned: boolean) => {
    await updateUserStatus(userId, isBanned)
    const hostsData = await getHosts()
    setHosts(hostsData)
    setFilteredHosts(hostsData)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Hosts</h1>
      <Input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredHosts.map((host) => (
            <TableRow key={host.id}>
              <TableCell>{host.name}</TableCell>
              <TableCell>{host.email}</TableCell>
              <TableCell>{host.isBanned ? "Banned" : "Active"}</TableCell>
              <TableCell>
                <StatusSelect
                  defaultValue={host.isBanned ? "banned" : "active"}
                  onValueChange={(value) =>
                    handleUserStatusUpdate(host.id, value === "banned")
                  }
                  options={[
                    { value: "active", label: "Active" },
                    { value: "banned", label: "Banned" },
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
