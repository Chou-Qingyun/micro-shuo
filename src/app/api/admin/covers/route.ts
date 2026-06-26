import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MAX_COVER_SIZE = 5 * 1024 * 1024;

// 后台封面上传接口：先校验 admin 登录态，再用 service_role 密钥上传到 covers bucket，返回公开 URL。
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "请先登录后台。" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "服务端未配置 SUPABASE_SERVICE_ROLE_KEY，无法上传。" },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "请选择要上传的图片。" }, { status: 400 });
  }

  if (file.size > MAX_COVER_SIZE) {
    return NextResponse.json({ message: "封面图片需小于 5MB。" }, { status: 400 });
  }

  const extension = file.name.split(".").pop() || "jpg";
  const filePath = `${Date.now()}.${extension}`;
  const { error } = await supabaseAdmin.storage.from("covers").upload(filePath, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from("covers").getPublicUrl(filePath);
  return NextResponse.json({ url: data.publicUrl });
}
