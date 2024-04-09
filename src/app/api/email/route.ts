import { NextResponse } from "next/server";
import { WelcomeEmail } from "@/emails/email";
import { Resend } from "resend";
import { google } from "googleapis";

const resend = new Resend(process.env.RESEND_API_KEY);
const SHEET_NAME = 'Sheet1';

export async function POST(request: Request) {
  const { firstName, email, number } = await request.json();

  await resend.emails.send({
    from: "Test <noreply@volshauz.com>",
    to: email,
    subject: "Sample",
    react: WelcomeEmail({
      firstname: firstName,
    }),
  });

  try {

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${SHEET_NAME}!A1:C1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[firstName, email, number]],
      },
    });

    return NextResponse.json({ status: "Email sent" });
  } catch (e) {
    return NextResponse.json({ status: "Error" });
  }

}
