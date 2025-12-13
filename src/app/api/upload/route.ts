import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileType = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isPortfolio = fileType === "portfolio";
    let allowedTypes: string[];
    let allowedExtensions: string[];
    let maxSize: number;
    let filePath: string;
    let errorMessage: string;

    if (isPortfolio) {
      // Portfolio/video file validation
      allowedTypes = [
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
        "video/x-msvideo",
        "video/webm",
      ];
      allowedExtensions = [".mp4", ".mov", ".avi", ".webm", ".mpeg"];
      maxSize = 50 * 1024 * 1024; // 50MB for videos
      errorMessage =
        "Invalid file type. Please upload video files (MP4, MOV, AVI, WEBM, MPEG).";
    } else {
      // Resume file validation (default)
      allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      allowedExtensions = [".pdf", ".doc", ".docx"];
      maxSize = 10 * 1024 * 1024; // 10MB for resumes
      errorMessage =
        "Invalid file type. Please upload PDF, DOC, or DOCX files.";
    }

    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Validate file size
    if (file.size > maxSize) {
      const sizeLimitMB = Math.floor(maxSize / (1024 * 1024));
      return NextResponse.json(
        { error: `File size exceeds ${sizeLimitMB}MB limit` },
        { status: 400 },
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}-${sanitizedName}`;
    filePath = isPortfolio ? `portfolio-files/${fileName}` : `resumes/${fileName}`;

    // Upload to Supabase storage
    // Supabase accepts File, Blob, ArrayBuffer, or FormData
    const { error: uploadError } = await supabase.storage
      .from("assets")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 },
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("assets").getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrl,
      fileName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
