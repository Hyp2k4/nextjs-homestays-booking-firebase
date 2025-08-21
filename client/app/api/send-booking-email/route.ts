import { NextResponse } from "next/server";
import transporter from "@/lib/nodemailer";
import QRCode from "qrcode";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, bookingId, bookingDetails } = body;

    if (!to || !bookingId || !bookingDetails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/booking-details/${bookingId}`;
    const qrCodeImageBuffer = await QRCode.toBuffer(bookingUrl);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `✨ Your Homestay Booking Confirmation (#${bookingId})`,
      html: `
      <div style="font-family: Arial, sans-serif; background: linear-gradient(to bottom, #f9fafb, #e0f2fe); padding: 20px; border-radius: 10px; max-width: 650px; margin: auto; border: 1px solid #d1d5db;">
        
        <!-- Animated Banner -->
        <div style="text-align: center; margin-bottom: 15px;">
          <img src="https://media.giphy.com/media/OkJat1YNdoD3W/giphy.gif" alt="Booking Confirmed" style="width: 90px; margin-bottom: 8px;" />
          <h2 style="color: #2563eb; margin: 0;">Booking Confirmed!</h2>
          <p style="color: #4b5563; font-size: 15px; margin-top: 4px;">
            Hello <strong>${
              bookingDetails.userName || "Guest"
            }</strong>, we’re excited to host you!
          </p>
        </div>

        <!-- Details Card -->
        <div style="background: white; padding: 20px; border-radius: 10px; margin-top: 15px; box-shadow: 0 3px 10px rgba(0,0,0,0.08);">
          <h3 style="color: #111827; margin-top: 0; margin-bottom: 12px;">📅 Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #6b7280; width: 35%;"><strong>Booking ID:</strong></td>
              <td style="padding: 6px 0;">${bookingId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;"><strong>Homestay:</strong></td>
              <td style="padding: 6px 0;">${bookingDetails.roomName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;"><strong>Location:</strong></td>
              <td style="padding: 6px 0;">${
                bookingDetails.location || "Not specified"
              }</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;"><strong>Phone:</strong></td>
              <td style="padding: 6px 0;">${bookingDetails.phone || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;"><strong>Check-In:</strong></td>
              <td style="padding: 6px 0;">${new Date(
                bookingDetails.checkInDate
              ).toDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;"><strong>Check-Out:</strong></td>
              <td style="padding: 6px 0;">${new Date(
                bookingDetails.checkOutDate
              ).toDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;"><strong>Guests:</strong></td>
              <td style="padding: 6px 0;">${bookingDetails.guests}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;"><strong>Total Price:</strong></td>
              <td style="padding: 6px 0; color: #16a34a; font-weight: bold;">${
                bookingDetails.totalPrice
              } VND</td>
            </tr>
          </table>
        </div>

        <!-- QR Code -->
        <div style="text-align: center; margin-top: 25px;">
          <p style="font-size: 14px; color: #374151; margin-bottom: 8px;">Scan to view booking:</p>
          <img src="cid:qrcode" alt="Booking QR Code" style="width: 160px; height: 160px; border-radius: 8px; border: 4px solid #e5e7eb;" />
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-top: 25px;">
          <a href="${bookingUrl}" 
             style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; font-weight: bold; text-decoration: none; border-radius: 8px;">
            View My Booking
          </a>
        </div>

        <!-- Footer -->
        <div style="text-align: center; font-size: 13px; color: #6b7280; margin-top: 30px;">
          <p>We look forward to hosting you 🏡</p>
          <p style="margin: 0;">— The Homestay Team</p>
          <p style="margin-top: 10px; font-size: 11px; color: #9ca3af;">This is an automated email. Please do not reply.</p>
        </div>

      </div>
      `,
      attachments: [
        {
          filename: "qrcode.png",
          content: qrCodeImageBuffer,
          cid: "qrcode",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
