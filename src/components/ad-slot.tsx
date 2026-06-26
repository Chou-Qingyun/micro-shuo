import { BadgeDollarSign } from "lucide-react";

export function AdSlot({ label = "Advertisement" }: { label?: string }) {
  const adsenseEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

  if (!adsenseEnabled) {
    return null;
  }

  return (
    <aside className="rounded-[8px] border border-dashed border-[#d8b8a8] bg-[#fffdfb] p-5 text-center text-sm text-[#8a6c67]">
      <div className="mx-auto mb-2 grid size-9 place-items-center rounded-[8px] bg-[#eef5ef] text-[#557463]">
        <BadgeDollarSign size={18} aria-hidden="true" />
      </div>
      <p className="font-medium">{label}</p>
      {/* 后续申请 AdSense 通过后，把广告代码放在这个组件内部统一管理。 */}
    </aside>
  );
}
