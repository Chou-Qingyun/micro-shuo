import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 仅在服务端使用的 Supabase 客户端，使用 service_role 密钥，可绕过 Storage RLS 执行后台管理操作。
// 严禁在浏览器端引入本文件，否则会泄露 service_role 密钥。
export const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      })
    : null;
