"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUsers, FaRss, FaBlog, FaUser, FaPlus } from "react-icons/fa";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

// 左 2 个 + 中间发布 + 右 2 个
const LEFT_ITEMS = [
  { href: "/discover", label: "广场", icon: FaUsers },
  { href: "/feed", label: "动态", icon: FaRss },
];

const RIGHT_ITEMS = [
  { href: "/blog", label: "博客", icon: FaBlog },
  { href: "/settings", label: "我的", icon: FaUser },
];

export function BottomNav() {
  const pathname = usePathname();
  const { appUser, loading } = useAuth();

  if (!appUser || loading) return null;

  const renderItem = (item: (typeof LEFT_ITEMS)[0]) => {
    const Icon = item.icon;
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 flex-1 h-full",
          "transition-colors min-h-[44px]",
          isActive ? "text-white" : "text-white/50"
        )}
      >
        <Icon className="text-lg" />
        <span className="text-[10px]">{item.label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden">
      <div className="glass-strong border-t border-white/10 safe-bottom">
        <div className="flex items-center justify-around h-16">
          {LEFT_ITEMS.map(renderItem)}

          {/* 中间发布按钮 */}
          <Link
            href="/feed/new"
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full -mt-6",
              "bg-white/30 active:scale-90",
              "glass-strong shadow-lg transition-all",
              "min-h-[44px] min-w-[44px]"
            )}
          >
            <FaPlus className="text-xl text-white" />
          </Link>

          {RIGHT_ITEMS.map(renderItem)}
        </div>
      </div>
    </nav>
  );
}
