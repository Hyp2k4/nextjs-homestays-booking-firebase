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
        </div>

        <!-- Details Card -->
        <div style="background: white; padding: 20px; border-radius: 10px; margin-top: 15px; box-shadow: 0 3px 10px rgba(0,0,0,0.08);">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="vertical-align: top; padding-right: 10px; border-right: 1px solid #e5e7eb;">
                <h3 style="color: #111827; margin-top: 0; margin-bottom: 12px;">👤 User Info</h3>
                <p><strong>Name:</strong> ${
                  bookingDetails.userName || "Guest"
                }</p>
                <p><strong>Phone:</strong> ${
                  bookingDetails.phone || "Guest"
                }</p>
                <p><strong>Email:</strong> ${
                  bookingDetails.userEmail || "Guest"
                }</p>
              </td>
              <td style="vertical-align: top; padding-left: 10px;">
                <h3 style="color: #111827; margin-top: 0; margin-bottom: 12px;">🏨 Booking Info</h3>
                <p><strong>Room:</strong> ${bookingDetails.roomName}</p>
                <p><strong>Address:</strong> ${
                  bookingDetails.location || "Not specified"
                }</p>
                <p><strong>Phone:</strong> ${bookingDetails.phone || "N/A"}</p>
                <p><strong>Check-in:</strong> ${new Date(
                  bookingDetails.checkInDate
                ).toDateString()}</p>
                <p><strong>Check-out:</strong> ${new Date(
                  bookingDetails.checkOutDate
                ).toDateString()}</p>
                <hr/>
                <p><strong>Total:</strong> ${
                  bookingDetails.totalPrice +
                  (bookingDetails.discountAmount || 0)
                } VND</p>
                ${
                  bookingDetails.voucherCode
                    ? `<p><strong>Discount (${bookingDetails.voucherCode}):</strong> -${bookingDetails.discountAmount} VND</p>`
                    : ""
                }
                <p><strong>Total Price:</strong> ${
                  bookingDetails.totalPrice
                } VND</p>
              </td>
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
