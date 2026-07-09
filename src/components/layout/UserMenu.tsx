"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "@/lib/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";

export function UserMenu() {
  const { appUser, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!appUser) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 glass rounded-full p-1 pr-3 hover:bg-white/15 transition-all min-h-[44px]"
      >
        <Avatar
          url={appUser.avatar_url}
          nickname={appUser.nickname}
          size="sm"
        />
        <span className="text-sm text-white/80 max-w-[80px] truncate">
          {appUser.nickname}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 glass-strong rounded-xl shadow-xl py-1 overflow-hidden">
          <Link
            href={`/u/${appUser.nickname}`}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors min-h-[44px]"
            onClick={() => setOpen(false)}
          >
            <FaUser />
            我的名片
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors min-h-[44px]"
            onClick={() => setOpen(false)}
          >
            <FaCog />
            设置
          </Link>
          <button
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-300 hover:bg-white/10 transition-colors w-full min-h-[44px]"
          >
            <FaSignOutAlt />
            退出
          </button>
        </div>
      )}
    </div>
  );
}
