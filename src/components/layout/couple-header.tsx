import Link from "next/link";
import { CoupleAvatars } from "@/components/shared/couple-avatars";
import { NotificationsInbox } from "@/components/notifications-inbox";

interface CoupleHeaderProps {
  initials: [string, string];
  avatarUrls: [string | null | undefined, string | null | undefined];
}

export function CoupleHeader({ initials, avatarUrls }: CoupleHeaderProps) {
  return (
    <div className="pointer-events-none absolute right-4 top-3 z-40 flex items-center gap-2">
      <div className="pointer-events-auto"><NotificationsInbox /></div>
      <Link href="/settings" aria-label="Mở cài đặt tài khoản" className="pointer-events-auto block rounded-full bg-white/90 p-1 shadow-sm backdrop-blur">
        <CoupleAvatars initials={initials} avatarUrls={avatarUrls} size="md" />
      </Link>
    </div>
  );
}
