-- ============================================
-- 多用户名片社交平台 - 数据库初始化
-- 在 Supabase Dashboard > SQL Editor 中执行此文件
-- ============================================

-- 1. users 表
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname    TEXT UNIQUE NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. cards 表（个人名片）
CREATE TABLE cards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name  TEXT NOT NULL DEFAULT '',
  title         TEXT DEFAULT '',
  company       TEXT DEFAULT '',
  bio           TEXT DEFAULT '',
  skills        TEXT[] DEFAULT '{}',
  social_links  JSONB DEFAULT '{}',
  contact_email TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  theme_color   TEXT DEFAULT 'violet',
  views_count   INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. posts 表（动态 + 文章，用 type 区分）
CREATE TABLE posts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type           TEXT NOT NULL DEFAULT 'short' CHECK (type IN ('short', 'article')),
  title          TEXT DEFAULT '',
  content        TEXT NOT NULL DEFAULT '',
  excerpt        TEXT DEFAULT '',
  cover_image    TEXT,
  images         TEXT[] DEFAULT '{}',
  likes_count    INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_posts_type_created ON posts(type, created_at DESC);
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- 4. likes 表（多目标点赞）
CREATE TABLE likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('card', 'post')),
  target_id   UUID NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);
CREATE INDEX idx_likes_target ON likes(target_type, target_id);

-- 5. comments 表（多目标评论，支持楼中楼）
CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('card', 'post')),
  target_id   UUID NOT NULL,
  content     TEXT NOT NULL,
  parent_id   UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_comments_target ON comments(target_type, target_id);

-- ============================================
-- 触发器：自动维护计数字段
-- ============================================

CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1
    WHERE id = NEW.target_id AND NEW.target_type = 'post';
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.target_id AND OLD.target_type = 'post';
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1
    WHERE id = NEW.target_id AND NEW.target_type = 'post';
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.target_id AND OLD.target_type = 'post';
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comments_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- ============================================
-- RLS 行级安全策略
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- users: 公开读，仅本人可增/改/删
CREATE POLICY "users_select_all" ON users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "users_insert_own" ON users FOR INSERT TO anon, authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "users_update_own" ON users FOR UPDATE TO anon, authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "users_delete_own" ON users FOR DELETE TO anon, authenticated USING (id = auth.uid());

-- cards: 公开读，仅本人可增/改/删
CREATE POLICY "cards_select_all" ON cards FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "cards_insert_own" ON cards FOR INSERT TO anon, authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "cards_update_own" ON cards FOR UPDATE TO anon, authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "cards_delete_own" ON cards FOR DELETE TO anon, authenticated USING (user_id = auth.uid());

-- posts: 公开读，仅本人可增/改/删
CREATE POLICY "posts_select_all" ON posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "posts_insert_own" ON posts FOR INSERT TO anon, authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "posts_update_own" ON posts FOR UPDATE TO anon, authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "posts_delete_own" ON posts FOR DELETE TO anon, authenticated USING (user_id = auth.uid());

-- likes: 公开读，仅本人可增/删
CREATE POLICY "likes_select_all" ON likes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "likes_insert_own" ON likes FOR INSERT TO anon, authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "likes_delete_own" ON likes FOR DELETE TO anon, authenticated USING (user_id = auth.uid());

-- comments: 公开读，仅本人可增/改/删
CREATE POLICY "comments_select_all" ON comments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "comments_insert_own" ON comments FOR INSERT TO anon, authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "comments_update_own" ON comments FOR UPDATE TO anon, authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "comments_delete_own" ON comments FOR DELETE TO anon, authenticated USING (user_id = auth.uid());

-- ============================================
-- Storage Buckets（头像和动态图片）
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS：公开读，认证用户写自己的目录
CREATE POLICY "avatars_read_all" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'avatars');
CREATE POLICY "avatars_write_own" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "post_images_read_all" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'post-images');
CREATE POLICY "post_images_write_own" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "post_images_delete_own" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text);
