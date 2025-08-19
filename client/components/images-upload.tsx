import { v2 as cloudinary } from "cloudinary"
import formidable from "formidable"
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    const form = new formidable.IncomingForm()
    form.parse(req, async (err, fields, files: any) => {
      if (err) return res.status(500).json({ error: err.message })

      try {
        const fileKeys = Object.keys(files)
        const urls: string[] = []

        for (const key of fileKeys) {
          const file = files[key]
          const result = await cloudinary.uploader.upload(file.filepath, {
            folder: "rooms",
          })
          urls.push(result.secure_url)
        }

        res.status(200).json({ urls })
      } catch (error: any) {
        res.status(500).json({ error: error.message })
      }
    })
  } else {
    res.status(405).end()
  }
}
