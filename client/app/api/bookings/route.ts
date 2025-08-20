import { NextRequest, NextResponse } from "next/server"
import { adminDb as db } from "@/lib/firebase/admin"
import transporter from "@/lib/nodemailer"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount)
}

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({ message: "This is the bookings API endpoint." })
}

export async function POST(req: NextRequest) {
  try {
    if (req.body === null) {
      return NextResponse.json({ success: false, message: "Request body is empty" }, { status: 400 })
    }
    const {
      roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests,
      totalPrice,
      user,
      roomData,
      status,
    } = await req.json()

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    // Create booking in Firestore
    const bookingRef = await db.collection("bookings").add({
      roomId,
      userId: user.uid,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      status: status || "confirmed",
      createdAt: new Date(),
      roomName: roomData.roomName,
      homestayName: roomData.homestay?.name,
    })

    const booking = {
      _id: bookingRef.id,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
    }

    // Send confirmation email
    const mailOptions = {
      from: "hiephoang1752004@gmail.com",
      to: user.email,
      subject: "✨ Your Homestay Booking Confirmation",
      html: `
    <div style="font-family: Arial, sans-serif; background: linear-gradient(to bottom, #f9fafb, #e0f2fe); padding: 20px; border-radius: 10px; max-width: 600px; margin: auto; border: 1px solid #d1d5db;">
      
      <!-- Animated Banner -->
      <div style="text-align: center;">
        <img src="https://media.giphy.com/media/OkJat1YNdoD3W/giphy.gif" alt="Booking Confirmed" style="width: 80px; margin-bottom: 10px;" />
        <h2 style="color: #2563eb; margin-bottom: 5px;">Booking Confirmed!</h2>
        <p style="color: #4b5563; font-size: 14px;">Hello <strong>${user.displayName}</strong>, we’re excited to host you!</p>
      </div>

      <!-- Details Card -->
      <div style="background: white; padding: 15px 20px; border-radius: 8px; margin-top: 15px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
        <h3 style="color: #111827; margin-top: 0;">📅 Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Booking ID:</strong></td>
            <td style="padding: 6px 0;">${booking._id}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Homestay Name:</strong></td>
            <td style="padding: 6px 0;">${roomData.homestay?.name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Room Name:</strong></td>
            <td style="padding: 6px 0;">${roomData.roomName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Address:</strong></td>
            <td style="padding: 6px 0;">${roomData.homestay?.address}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Check-In:</strong></td>
            <td style="padding: 6px 0;">${booking.checkInDate.toDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Check-Out:</strong></td>
            <td style="padding: 6px 0;">${booking.checkOutDate.toDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Guests:</strong></td>
            <td style="padding: 6px 0;">${booking.guests}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Total Price:</strong></td>
            <td style="padding: 6px 0; color: #16a34a; font-weight: bold;">${formatCurrency(booking.totalPrice)} VND</td>
          </tr>
        </table>
      </div>

      <!-- Footer -->
      <div style="text-align: center; font-size: 13px; color: #6b7280; margin-top: 20px;">
        <p>We look forward to hosting you 🏡</p>
        <p style="margin: 0;">— The Meap Homestay Team</p>
      </div>

    </div>
  `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true, message: "Booking created successfully", bookingId: bookingRef.id })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ success: false, message: "Failed to create booking" })
  }
}
