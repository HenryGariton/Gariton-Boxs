"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUsers, FaRss, FaBlog, FaUserCircle } from "react-icons/fa";
import { useAuth } from "@/lib/hooks/useAuth";
import { UserMenu } from "@/components/layout/UserMenu";
import { cn } from "@/lib/utils/cn";
import { APP_CONFIG } from "@/lib/utils/constants";

const NAV_LINKS = [
  { href: "/discover", label: "广场", icon: FaUsers },
  { href: "/feed", label: "动态", icon: FaRss },
  { href: "/blog", label: "博客", icon: FaBlog },
];

export function Navbar() {
  const pathname = usePathname();
  const { appUser, loading } = useAuth();

  // 未登录时不显示导航
  if (!appUser || loading) return null;

  return (
    <header className="sticky top-0 z-40 hidden md:block">
      <nav className="glass-strong border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/discover"
            className="flex items-center gap-2 font-bold text-lg text-white"
          >
            <FaUserCircle className="text-xl" />
            <span>{APP_CONFIG.name}</span>
          </Link>

          {/* 导航链接 */}
          <div className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    "min-h-[44px]",
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* 用户菜单 */}
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
