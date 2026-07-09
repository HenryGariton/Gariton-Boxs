"use client";

import { type IconType } from "react-icons";
import {
  FaGithub,
  FaTwitter,
  FaWeibo,
  FaGlobe,
  FaWeixin,
  FaHeart,
  FaComment,
} from "react-icons/fa";
import { SiZhihu, SiJuejin } from "react-icons/si";
import { GlassCard } from "@/components/ui/GlassCard";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { SOCIAL_PLATFORMS } from "@/lib/utils/constants";
import type { CardWithUser } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";

// 图标名 → 组件映射
const ICON_MAP: Record<string, IconType> = {
  FaGithub,
  FaTwitter,
  FaWeibo,
  SiZhihu,
  SiJuejin,
  FaGlobe,
  FaWeixin,
};

// 平台 key → { Icon, label } 映射
const PLATFORM_CONFIG: Record<string, { Icon: IconType; label: string }> = {};
SOCIAL_PLATFORMS.forEach((p) => {
  PLATFORM_CONFIG[p.key] = {
    Icon: ICON_MAP[p.icon] || FaGlobe,
    label: p.label,
  };
});

interface BusinessCardProps {
  card: CardWithUser;
  showActions?: boolean;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

export function BusinessCard({
  card,
  showActions = false,
  compact = false,
  onClick,
  className,
}: BusinessCardProps) {
  const {
    users,
    display_name,
    title,
    company,
    bio,
    skills,
    social_links,
    contact_email,
    phone,
  } = card;

  // 紧凑模式 — 用于网格列表
  if (compact) {
    return (
      <GlassCard
        hover
        onClick={onClick}
        className={cn("cursor-pointer p-4 sm:p-5", className)}
      >
        <div className="flex items-center gap-4">
          <Avatar url={users.avatar_url} nickname={users.nickname} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-white truncate">
              {display_name || users.nickname}
            </h3>
            {(title || company) && (
              <p className="text-sm text-white/60 truncate">
                {title}
                {title && company && " @ "}
                {company}
              </p>
            )}
          </div>
        </div>
        {bio && (
          <p className="mt-3 text-sm text-white/80 line-clamp-2">{bio}</p>
        )}
        {skills && skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {skills.slice(0, 4).map((skill) => (
              <Badge key={skill} className="text-[10px] px-2 py-0.5">
                {skill}
              </Badge>
            ))}
            {skills.length > 4 && (
              <span className="text-xs text-white/40 self-center">
                +{skills.length - 4}
              </span>
            )}
          </div>
        )}
      </GlassCard>
    );
  }

  // 完整模式 — 名片详情展示
  return (
    <GlassCard className={cn("p-4 sm:p-6 md:p-8", className)}>
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* 左侧 — 头像与基本信息 */}
        <div className="flex flex-col items-center md:items-start gap-3 md:w-1/3">
          <Avatar url={users.avatar_url} nickname={users.nickname} size="lg" />
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white">
              {display_name || users.nickname}
            </h2>
            {(title || company) && (
              <p className="text-sm text-white/60 mt-1">
                {title}
                {title && company && " @ "}
                {company}
              </p>
            )}
          </div>

          {showActions && (
            <div className="flex gap-2 mt-2">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm glass rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all">
                <FaHeart className="text-sm" />
                <span>点赞</span>
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm glass rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all">
                <FaComment className="text-sm" />
                <span>评论</span>
              </button>
            </div>
          )}
        </div>

        {/* 右侧 — 详细信息 */}
        <div className="flex-1 space-y-4">
          {bio && (
            <div>
              <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">
                简介
              </h4>
              <p className="text-sm text-white/80 leading-relaxed">{bio}</p>
            </div>
          )}

          {skills && skills.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                技能
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {social_links && Object.keys(social_links).length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                社交链接
              </h4>
              <div className="flex flex-wrap gap-3">
                {Object.entries(social_links).map(([key, value]) => {
                  if (!value) return null;
                  const config = PLATFORM_CONFIG[key] || {
                    Icon: FaGlobe,
                    label: key,
                  };
                  const isLink = value.startsWith("http");
                  const content = (
                    <>
                      <config.Icon className="text-base" />
                      <span className="text-xs text-white/70">
                        {config.label}
                      </span>
                    </>
                  );
                  return isLink ? (
                    <a
                      key={key}
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
                    >
                      {content}
                    </a>
                  ) : (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg text-white/80"
                    >
                      {content}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {(contact_email || phone) && (
            <div>
              <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                联系方式
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                {contact_email && (
                  <a
                    href={`mailto:${contact_email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm glass rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <FaGlobe className="text-sm" />
                    {contact_email}
                  </a>
                )}
                {phone && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm glass rounded-lg text-white/80">
                    <FaWeixin className="text-sm" />
                    {phone}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
