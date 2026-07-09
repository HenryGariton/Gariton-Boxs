"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { type IconType } from "react-icons";
import {
  FaGithub,
  FaTwitter,
  FaWeibo,
  FaGlobe,
  FaWeixin,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { SiZhihu, SiJuejin } from "react-icons/si";
import { GlassCard } from "@/components/ui/GlassCard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCard } from "@/lib/hooks/useCard";
import { SOCIAL_PLATFORMS } from "@/lib/utils/constants";
import type { Card } from "@/lib/types/database";

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

interface CardFormProps {
  initialData: Card | null;
  onSave?: (card: Card) => void;
}

export function CardForm({ initialData, onSave }: CardFormProps) {
  const { user } = useAuth();
  const { createCard, updateCard } = useCard();

  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // 表单字段
  const [displayName, setDisplayName] = useState(initialData?.display_name || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [company, setCompany] = useState(initialData?.company || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [contactEmail, setContactEmail] = useState(initialData?.contact_email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");

  // 技能标签
  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const [skillInput, setSkillInput] = useState("");

  // 社交链接
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(
    initialData?.social_links || {}
  );

  // 添加技能
  const addSkill = useCallback(() => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  }, [skillInput, skills]);

  // 删除技能
  const removeSkill = useCallback((skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  }, [skills]);

  // 技能输入回车
  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  // 更新社交链接
  const handleSocialChange = (key: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
  };

  // 保存
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const cardData = {
        display_name: displayName,
        title,
        company,
        bio,
        skills,
        social_links: socialLinks,
        contact_email: contactEmail,
        phone,
      };

      let result: Card;
      if (initialData) {
        result = await updateCard(initialData.id, cardData);
      } else {
        result = await createCard(user.id, cardData);
      }

      onSave?.(result);
    } catch (err) {
      console.error("保存名片失败:", err);
      alert("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassCard className="p-4 sm:p-6 md:p-8">
      <div className="space-y-6">
        {/* 头像 */}
        <div className="flex flex-col items-center gap-3">
          <Avatar
            url={avatarUrl}
            nickname={user?.email || undefined}
            size="xl"
            editable
            userId={user?.id}
            onUploaded={(url) => setAvatarUrl(url)}
          />
          <p className="text-xs text-white/50">点击头像上传</p>
        </div>

        {/* 基本信息 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="姓名"
            placeholder="你的展示名"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input
            label="职位"
            placeholder="如：前端工程师"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="公司"
            placeholder="如：某科技公司"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <Input
            label="联系邮箱"
            type="email"
            placeholder="contact@example.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>

        {/* 简介 */}
        <Textarea
          label="个人简介"
          placeholder="介绍一下自己..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
        />

        {/* 技能标签 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">
            技能标签
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="输入技能后按回车添加"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              className="flex-1"
            />
            <Button variant="outline" size="md" onClick={addSkill} type="button">
              <FaPlus />
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => removeSkill(skill)}
                  className="group"
                  type="button"
                >
                  <Badge className="flex items-center gap-1 pr-2 cursor-pointer hover:bg-white/20 transition-all">
                    {skill}
                    <FaTimes className="text-[10px] text-white/50 group-hover:text-white/80" />
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 社交链接 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">
            社交链接
          </label>
          <div className="space-y-3">
            {SOCIAL_PLATFORMS.map((platform) => {
              const Icon = ICON_MAP[platform.icon] || FaGlobe;
              return (
                <div key={platform.key} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 glass rounded-xl shrink-0">
                    <Icon className="text-base text-white/70" />
                  </div>
                  <Input
                    placeholder={platform.placeholder}
                    value={socialLinks[platform.key] || ""}
                    onChange={(e) =>
                      handleSocialChange(platform.key, e.target.value)
                    }
                    className="flex-1"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* 电话 */}
        <Input
          label="电话"
          placeholder="你的联系方式（选填）"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* 保存按钮 */}
        <div className="flex justify-end pt-2">
          <Button
            size="lg"
            loading={saving}
            onClick={handleSave}
            disabled={!user}
          >
            {initialData ? "保存修改" : "创建名片"}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
