"use client"
import React, { useState, useEffect, useMemo } from "react"
import { db } from "@/lib/firebase/config"
import { Timestamp } from "firebase/firestore"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { getHosts, getUsers } from "@/lib/admin-service"
import { HostService } from "@/lib/host-service"
import { VoucherService } from "@/lib/voucher-service"
import { removeDiacritics } from "@/lib/utils"
import { BeautifulLoader } from "@/components/ui/beautiful-loader"
import { AdminDashboardLayout } from "@/components/admin/dashboard-layout"
import type { User } from "@/types/auth"
import type { Property } from "@/types/property"
import type { Voucher, VoucherScope } from "@/types/voucher"
import { format } from "date-fns"

const VoucherCreator = () => {
    const [hosts, setHosts] = useState<User[]>([])
    const [selectedHostHomestays, setSelectedHostHomestays] = useState<Property[]>([])
    const [isLoadingHosts, setIsLoadingHosts] = useState(true)
    const [isLoadingHomestays, setIsLoadingHomestays] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [bulkState, setBulkState] = useState<{
        quantity: number;
        description: string;
        discountType: 'percentage' | 'fixed_amount';
        discountValue: number;
        validFrom: string;
        expiryDate: string;
        scope: VoucherScope;
        usageLimit: number;
        totalQuantity: number | null;
    }>({
        quantity: 1,
        description: "",
        discountType: "percentage",
        discountValue: 10,
        validFrom: "",
        expiryDate: "",
        scope: "all_homestays",
        usageLimit: 1,
        totalQuantity: 100,
    })

    const [hostSpecificState, setHostSpecificState] = useState({
        selectedHostId: "",
        selectedHomestayId: "",
        quantity: 1,
    })

    useEffect(() => {
        const fetchHosts = async () => {
            setIsLoadingHosts(true)
            const hostData = await getHosts()
            setHosts(hostData as User[])
            setIsLoadingHosts(false)
        }
        fetchHosts()
    }, [])

    const handleHostSelect = async (hostId: string) => {
        setHostSpecificState(prev => ({ ...prev, selectedHostId: hostId, selectedHomestayId: "" }))
        setIsLoadingHomestays(true)
        const homestays = await HostService.getHostHomestays(hostId)
        setSelectedHostHomestays(homestays)
        setIsLoadingHomestays(false)
    }

    const handleBulkGenerate = async () => {
        const newErrors: Record<string, string> = {};
        if (!bulkState.description) newErrors.description = "Description is required.";
        if (!bulkState.validFrom) newErrors.validFrom = "Valid from date is required.";
        if (!bulkState.expiryDate) newErrors.expiryDate = "Expiry date is required.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill all required fields.");
            return;
        }

        const { description, expiryDate, validFrom, scope, usageLimit, totalQuantity } = bulkState

        toast.info("Fetching all users to generate vouchers...")
        const allUsers = await getUsers()
        if (!allUsers || allUsers.length === 0) {
            toast.error("No users found to generate vouchers for.")
            return
        }

        toast.info(`Generating vouchers for ${allUsers.length} users...`)
        let successCount = 0
        for (const user of allUsers) {
            const randomDiscount = Math.floor(Math.random() * 41) + 10 // 10-50%
            type VoucherStatus = 'unused' | 'used' | 'expired';
            const newVoucher: Omit<Voucher, "id" | "createdAt"> = {
                code: VoucherService.generateVoucherCode(6),
                description: description || `Exclusive ${randomDiscount}% discount for you, ${user.name}!`,
                discountType: 'percentage',
                discountValue: randomDiscount,
                validFrom: Timestamp.fromDate(new Date(validFrom)),
                expiryDate: Timestamp.fromDate(new Date(expiryDate)),
                scope,
                usageLimit: Number(usageLimit),
                totalQuantity: totalQuantity ? Number(totalQuantity) : undefined,
                redeemedCount: 0,
                redeemedBy: [],
                isActive: true,
                claimedBy: user.id,
                status: 'unused', // literal, đúng kiểu
            }

            const result = await VoucherService.createVoucher(newVoucher)
            if (result) successCount++
        }
        toast.success(`Successfully generated ${successCount} vouchers for ${allUsers.length} users!`)
    }

    const handleHostSpecificGenerate = async () => {
        const { selectedHostId, selectedHomestayId, quantity } = hostSpecificState
        if (!selectedHostId || quantity <= 0) {
            toast.error("Please select a host and specify a quantity.")
            return
        }

        const host = hosts.find(h => h.id === selectedHostId)
        if (!host) return

        toast.info(`Generating ${quantity} vouchers for ${host.name}...`)
        let successCount = 0
        for (let i = 0; i < quantity; i++) {
            const randomDiscount = Math.floor(Math.random() * 41) + 10
            const hostNameForCode = removeDiacritics(host.name.split(' ')[0].toUpperCase());
            const voucherCode = VoucherService.generateVoucherCode(6);

            const newVoucher = {
                code: `${hostNameForCode}${voucherCode}`,
                description: `Exclusive ${randomDiscount}% discount for ${host.name}'s properties`,
                discountType: "percentage" as 'percentage' | 'fixed_amount',
                discountValue: randomDiscount,
                validFrom: Timestamp.now(),
                expiryDate: Timestamp.fromDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1))),
                scope: (selectedHomestayId ? "specific_homestay" : "all_homestays") as VoucherScope,
                hostId: selectedHostId,
                applicableHomestayId: selectedHomestayId || undefined,
                usageLimit: 1,
                redeemedCount: 0,
                redeemedBy: [],
                isActive: true,
                status: 'unused' as 'unused' | 'used' | 'expired',
            }
            const result = await VoucherService.createVoucher(newVoucher)
            if (result) successCount++
        }
        toast.success(`Successfully generated ${successCount} vouchers!`)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Voucher Generation</CardTitle>
                <CardDescription>Create new discount vouchers.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="bulk">
                    <TabsList>
                        <TabsTrigger value="bulk">Bulk Generation</TabsTrigger>
                        <TabsTrigger value="host">Host-Specific</TabsTrigger>
                    </TabsList>
                    <TabsContent value="bulk" className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-3">
                                <Label htmlFor="bulk-desc" className={errors.description ? 'text-red-500' : ''}>Description</Label>
                                <Input id="bulk-desc" value={bulkState.description} onChange={e => {
                                    setBulkState(prev => ({ ...prev, description: e.target.value }));
                                    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                                }} placeholder="e.g., Summer Sale" />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>
                            <div>
                                <Label htmlFor="bulk-valid-from" className={errors.validFrom ? 'text-red-500' : ''}>Valid From</Label>
                                <Input id="bulk-valid-from" type="date" value={bulkState.validFrom} onChange={e => {
                                    setBulkState(prev => ({ ...prev, validFrom: e.target.value }));
                                    if (errors.validFrom) setErrors(prev => ({ ...prev, validFrom: '' }));
                                }} />
                                {errors.validFrom && <p className="text-red-500 text-xs mt-1">{errors.validFrom}</p>}
                            </div>
                            <div>
                                <Label htmlFor="bulk-expiry" className={errors.expiryDate ? 'text-red-500' : ''}>Expiry Date</Label>
                                <Input id="bulk-expiry" type="date" value={bulkState.expiryDate} onChange={e => {
                                    setBulkState(prev => ({ ...prev, expiryDate: e.target.value }));
                                    if (errors.expiryDate) setErrors(prev => ({ ...prev, expiryDate: '' }));
                                }} />
                                {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                            </div>
                            <div>
                                <Label htmlFor="bulk-usage-limit">Usage Limit (per user)</Label>
                                <Select value={String(bulkState.usageLimit)} onValueChange={val => setBulkState(prev => ({ ...prev, usageLimit: Number(val) }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Single use per user</SelectItem>
                                        <SelectItem value="0">Unlimited use per user</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="bulk-total-quantity">Total Quantity (optional)</Label>
                                <Input id="bulk-total-quantity" type="number" min="1" value={bulkState.totalQuantity ?? ""} onChange={e => setBulkState(prev => ({ ...prev, totalQuantity: e.target.value ? Number(e.target.value) : null }))} placeholder="Leave blank for unlimited" />
                            </div>
                            <div>
                                <Label htmlFor="bulk-scope">Scope</Label>
                                <Select value={bulkState.scope} onValueChange={(val: VoucherScope) => setBulkState(prev => ({ ...prev, scope: val }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all_homestays">All Homestays</SelectItem>
                                        <SelectItem value="all_rooms">All Rooms</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={handleBulkGenerate} className="mt-4">Generate Bulk Vouchers</Button>
                    </TabsContent>
                    <TabsContent value="host" className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Select Host</Label>
                                <Select onValueChange={handleHostSelect} disabled={isLoadingHosts}>
                                    <SelectTrigger><SelectValue placeholder="Select a host..." /></SelectTrigger>
                                    <SelectContent>
                                        {hosts.map(host => <SelectItem key={host.id} value={host.id}>{host.name} ({host.email})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Select Homestay (Optional)</Label>
                                <Select
                                    value={hostSpecificState.selectedHomestayId}
                                    onValueChange={val => setHostSpecificState(prev => ({ ...prev, selectedHomestayId: val }))}
                                    disabled={isLoadingHomestays || !hostSpecificState.selectedHostId}
                                >
                                    <SelectTrigger><SelectValue placeholder="All of host's homestays" /></SelectTrigger>
                                    <SelectContent>
                                        {selectedHostHomestays.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="host-quantity">Quantity (Max 10)</Label>
                                <Input id="host-quantity" type="number" min="1" max="10" value={hostSpecificState.quantity} onChange={e => setHostSpecificState(prev => ({ ...prev, quantity: Math.min(10, Number(e.target.value)) }))} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">Generates vouchers with a random 10-50% discount, expiring in one year.</p>
                        <Button onClick={handleHostSpecificGenerate} className="mt-4">Generate for Host</Button>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

const VoucherList = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    const fetchVouchers = async () => {
        setLoading(true)
        const data = await VoucherService.getAllVouchers()
        setVouchers(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchVouchers()
    }, [])

    const handleStatusToggle = async (voucher: Voucher) => {
        const success = await VoucherService.updateVoucherStatus(voucher.id, !voucher.isActive)
        if (success) {
            toast.success(`Voucher ${voucher.code} has been ${!voucher.isActive ? 'activated' : 'deactivated'}.`)
            fetchVouchers()
        } else {
            toast.error("Failed to update voucher status.")
        }
    }

    // Lọc theo code voucher
    const filteredVouchers = useMemo(() => {
        if (!search) return vouchers
        return vouchers.filter(v => v.code.toLowerCase().includes(search.toLowerCase()))
    }, [search, vouchers])

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Vouchers</CardTitle>
                <CardDescription>List of all generated vouchers in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex items-center gap-2">
                    <Input
                        placeholder="Search by voucher code..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1"
                    />
                    <Button onClick={() => setSearch("")}>Clear</Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow>
                        ) : filteredVouchers.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center">No vouchers found</TableCell></TableRow>
                        ) : filteredVouchers.map((v) => (
                            <TableRow key={v.id}>
                                <TableCell className="font-mono">{v.code}</TableCell>
                                <TableCell>{v.description}</TableCell>
                                <TableCell>{v.discountType === 'percentage' ? `${v.discountValue}%` : new Intl.NumberFormat('vi-VN').format(v.discountValue)}</TableCell>
                                <TableCell>{format(new Date(v.expiryDate), "dd/MM/yyyy")}</TableCell>
                                <TableCell>
                                    <Badge variant={v.isActive ? "default" : "outline"}>
                                        {v.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{v.redeemedCount} / {v.totalQuantity || '∞'}</TableCell>
                                <TableCell className="text-right">
                                    <Switch
                                        checked={v.isActive}
                                        onCheckedChange={() => handleStatusToggle(v)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}



export default function VoucherSettingsPage() {
    return (
        <div className="space-y-8">
            <VoucherCreator />
            <VoucherList />
        </div>
    )
}
