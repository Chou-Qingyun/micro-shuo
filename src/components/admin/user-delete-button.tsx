"use client";

import { useRef } from "react";
import { Trash2 } from "lucide-react";
import { deleteUserAction } from "@/app/admin/actions";

export function UserDeleteButton({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[#f8e8e6] px-3 text-sm font-semibold text-[#9b405e]"
      >
        <Trash2 size={15} aria-hidden="true" />
        删除用户
      </button>

      <dialog
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 m-0 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-[8px] border border-rose-100 bg-white p-0 text-left shadow-[0_24px_80px_rgba(75,43,58,0.22)] backdrop:bg-[#281f2d]/35"
      >
        <div className="p-5">
          <p className="text-lg font-semibold text-[#281f2d]">确认删除用户</p>
          <p className="mt-3 text-sm leading-6 text-[#6c5b68]">
            删除后会同时移除 Supabase Auth 用户和本地业务数据，操作不可恢复。
          </p>
          <p className="mt-3 rounded-[8px] bg-[#fffaf8] px-3 py-2 text-sm font-semibold text-[#3a303c]">
            {email}
          </p>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <form method="dialog">
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-[8px] border border-rose-100 bg-white px-4 text-sm font-semibold text-[#6c5b68]"
              >
                取消
              </button>
            </form>
            <form action={deleteUserAction}>
              <input type="hidden" name="userId" value={userId} />
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#9b405e] px-4 text-sm font-semibold text-white"
              >
                <Trash2 size={15} aria-hidden="true" />
                确认删除
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
