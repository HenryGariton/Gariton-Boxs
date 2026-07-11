-- ============================================
-- 修复：名片点赞/评论计数
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ============================================

-- 1. cards 表新增计数字段
ALTER TABLE cards ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS comments_count INT DEFAULT 0;

-- 2. 删除旧触发器（只认 posts）
DROP TRIGGER IF EXISTS trg_likes_count ON likes;
DROP TRIGGER IF EXISTS trg_comments_count ON comments;
DROP FUNCTION IF EXISTS update_likes_count;
DROP FUNCTION IF EXISTS update_comments_count;

-- 3. 重建点赞触发器（同时处理 posts 和 cards）
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'post' THEN
      UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'card' THEN
      UPDATE cards SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'post' THEN
      UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'card' THEN
      UPDATE cards SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.target_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- 4. 重建评论触发器（同时处理 posts 和 cards）
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'post' THEN
      UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'card' THEN
      UPDATE cards SET comments_count = comments_count + 1 WHERE id = NEW.target_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'post' THEN
      UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'card' THEN
      UPDATE cards SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.target_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comments_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comments_count();
