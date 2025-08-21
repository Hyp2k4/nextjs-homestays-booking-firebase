"use client"
import React, { useState, useEffect } from "react"
import { db } from "@/lib/firebase/config"
import { doc, Timestamp, setDoc, deleteDoc, onSnapshot, DocumentSnapshot, writeBatch, collection } from "firebase/firestore"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { VoucherService } from "@/lib/voucher-service"
import type { Voucher, VoucherScope } from "@/types/voucher"
import { useAuth } from "@/contexts/auth-context"

export default function FlashPromoPage() {
    const { user } = useAuth()
    const [livePromo, setLivePromo] = useState<Voucher | null>(null)
    const [timeLeft, setTimeLeft] = useState("")
    const [discount, setDiscount] = useState(15)
    const [duration, setDuration] = useState(60) // in minutes
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const promoRef = doc(db, "settings", "live_promo")
        const unsubscribe = onSnapshot(promoRef, (docSnap: DocumentSnapshot) => {
            if (docSnap.exists()) {
                setLivePromo({ id: docSnap.id, ...docSnap.data() } as Voucher)
            } else {
                setLivePromo(null)
            }
        })
        return () => unsubscribe()
    }, [])

    useEffect(() => {
        if (!livePromo) return

        const interval = setInterval(() => {
            const expiry = livePromo.expiryDate.toDate()
            const now = new Date()
            const distance = expiry.getTime() - now.getTime()

            if (distance < 0) {
                setTimeLeft("Expired")
                clearInterval(interval)
                return
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((distance % (1000 * 60)) / 1000)
            setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
        }, 1000)

        return () => clearInterval(interval)
    }, [livePromo])

    const handleLaunchPromo = async () => {
        setIsSubmitting(true)
        try {
            const now = new Date()
            const expiryDate = new Date(now.getTime() + duration * 60000)

            const promoVoucher = {
                code: `FLASH${VoucherService.generateVoucherCode(4)}`,
                description: `Flash Sale! ${discount}% off all bookings.`,
                discountType: 'percentage' as 'percentage' | 'fixed_amount',
                discountValue: discount,
                validFrom: Timestamp.now(),
                expiryDate: Timestamp.fromDate(expiryDate),
                scope: 'all_homestays' as VoucherScope,
                usageLimit: 1,
                redeemedCount: 0,
                redeemedBy: [],
                isActive: true,
            }

            await setDoc(doc(db, "settings", "live_promo"), promoVoucher)
            toast.success(`Flash promotion launched! Code: ${promoVoucher.code}`, {
                description: `Expires in ${duration} minutes.`,
            })
        } catch (error) {
            console.error("Failed to launch flash promo:", error)
            toast.error("Failed to launch promotion.")
        } finally {
            setIsSubmitting(false)
        }
    }
    
    const handleEndPromo = async () => {
        setIsSubmitting(true)
        try {
            await deleteDoc(doc(db, "settings", "live_promo"));
            toast.success("Live promotion has been ended.");
        } catch (error) {
            console.error("Failed to end flash promo:", error);
            toast.error("Failed to end promotion.");
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClaimVoucher = async () => {
        if (!user) {
            toast.error("You must be logged in to claim a voucher.");
            return;
        }
        if (!livePromo || livePromo.claimedBy) {
            toast.error("This voucher has already been claimed.");
            return;
        }

        setIsSubmitting(true);
        try {
            const batch = writeBatch(db);

            // 1. Create a new voucher in the main collection
            const newVoucherRef = doc(collection(db, "vouchers"));
            const permanentVoucher = {
                ...livePromo,
                claimedBy: user.id,
                expiryDate: Timestamp.fromDate(new Date("2099-12-31")), // "Permanent"
                usageLimit: 1,
                isActive: true,
            };
            batch.set(newVoucherRef, permanentVoucher);

            // 2. Delete the live promo
            const promoRef = doc(db, "settings", "live_promo");
            batch.delete(promoRef);

            await batch.commit();
            toast.success(`Congratulations ${user.name}! You've claimed the voucher!`);
        } catch (error) {
            console.error("Failed to claim voucher:", error);
            toast.error("Failed to claim voucher. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Flash Promotion</CardTitle>
                <CardDescription>Launch or end a site-wide promotional badge.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {livePromo ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                        <p className="font-semibold text-blue-800">Live Promotion Active!</p>
                        <p className="text-2xl font-bold text-blue-900 my-2">{livePromo.code}</p>
                        <p className="text-sm text-blue-700">Ends in: <span className="font-mono">{timeLeft}</span></p>
                        {livePromo.claimedBy ? (
                            <p className="text-sm text-green-700 mt-2">Claimed by: {livePromo.claimedBy}</p>
                        ) : (
                             user && user.role !== 'admin' && (
                                <Button onClick={handleClaimVoucher} disabled={isSubmitting} className="mt-4">
                                    Claim Voucher
                                </Button>
                            )
                        )}
                    </div>
                ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                        <p className="text-gray-600">No active promotion.</p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="flash-discount">Discount (%)</Label>
                        <Input id="flash-discount" type="number" min="1" max="90" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
                    </div>
                    <div>
                        <Label htmlFor="flash-duration">Duration (minutes, max 60)</Label>
                        <Input id="flash-duration" type="number" min="1" max="60" value={duration} onChange={e => setDuration(Number(e.target.value))} />
                    </div>
                </div>
                {user && user.role === 'admin' && (
                    <div className="flex gap-4">
                        <Button onClick={handleLaunchPromo} disabled={isSubmitting || !!livePromo}>Launch Promotion</Button>
                        <Button onClick={handleEndPromo} variant="destructive" disabled={isSubmitting || !livePromo}>End Live Promotion</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
