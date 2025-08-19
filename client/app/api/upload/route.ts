import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = async (req: Request) => {
  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "rooms" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(buffer);
      });
      return result.secure_url; // đây là URL Cloudinary
    });

    const urls = await Promise.all(uploadPromises);

    return new Response(JSON.stringify({ urls }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
};
