"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { VoucherService } from "@/lib/voucher-service"
import type { Voucher } from "@/types/voucher"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FixedSizeGrid as Grid } from "react-window"

export default function MyVouchersPage() {
  const { user } = useAuth()
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) return
    const fetchVouchers = async () => {
      setLoading(true)
      try {
        const myVouchers = await VoucherService.getMyVouchers(user.id)
        setVouchers(myVouchers)
      } catch (err) {
        console.error(err)
        setError("Không thể tải danh sách voucher")
      } finally {
        setLoading(false)
      }
    }
    fetchVouchers()
  }, [user])

  if (loading) return <div className="container mx-auto p-4 text-center">Đang tải...</div>
  if (error) return <div className="container mx-auto p-4 text-center text-red-600">{error}</div>

  const now = new Date().getTime()
  const available = vouchers.filter(v =>
    !v.redeemedBy.includes(user!.id) &&
    v.status === "unused" &&
    new Date(v.expiryDate).getTime() >= now
  )

  const rowCount = Math.ceil(available.length / 3) // 3 cột
  const columnCount = 3
  const columnWidth = 320
  const rowHeight = 220
  const gridWidth = columnWidth * columnCount
  const gridHeight = 600 // chiều cao cố định, scroll được

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-foreground">Voucher của tôi</h1>
        {available.length === 0 ? (
          <p className="text-gray-500 text-center">Bạn không có voucher nào khả dụng</p>
        ) : (
          <Grid
            columnCount={columnCount}
            columnWidth={columnWidth}
            height={gridHeight}
            rowCount={rowCount}
            rowHeight={rowHeight}
            width={gridWidth}
          >
            {({ columnIndex, rowIndex, style }) => {
              const index = rowIndex * columnCount + columnIndex
              if (index >= available.length) return null
              const v = available[index]
              return (
                <div style={style} className="p-2">
                  <VoucherCard voucher={v} />
                </div>
              )
            }}
          </Grid>
        )}
      </main>
      <Footer />
    </div>
  )
}

function VoucherCard({ voucher }: { voucher: Voucher }) {
  const now = new Date().getTime()
  const expired = new Date(voucher.expiryDate).getTime() < now
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg truncate">{voucher.code}</h3>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            expired ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"
          }`}
        >
          {expired ? "Hết hạn" : "Khả dụng"}
        </span>
      </div>
      <p className="text-gray-600 mb-3 line-clamp-3">{voucher.description}</p>
      <div className="flex justify-between items-center mt-auto">
        <span className="font-semibold">
          {voucher.discountType === "percentage"
            ? `Giảm ${voucher.discountValue}%`
            : `Giảm ${voucher.discountValue?.toLocaleString()}đ`}
        </span>
        <span className="text-sm text-gray-500">
          Hết hạn: {new Date(voucher.expiryDate).toLocaleDateString("vi-VN")}
        </span>
      </div>
    </div>
  )
}
