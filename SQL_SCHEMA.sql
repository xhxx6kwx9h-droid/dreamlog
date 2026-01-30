-- Dreams tablosunu UUID ile kılıfla
CREATE TABLE dreams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  occurred_at timestamptz NOT NULL,
  mood text NOT NULL DEFAULT 'neutral',
  intensity integer NOT NULL DEFAULT 5 CHECK (intensity >= 1 AND intensity <= 10),
  lucid boolean NOT NULL DEFAULT false,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Real-time için active yapılandırılması
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

-- Tüm users kendi rüyalarını görebilsin
CREATE POLICY "Users can view their own dreams"
  ON dreams FOR SELECT
  USING (auth.uid() = user_id);

-- Tüm users kendi rüyalarını oluşturabilsin
CREATE POLICY "Users can create dreams"
  ON dreams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tüm users kendi rüyalarını güncelleyebilsin
CREATE POLICY "Users can update their own dreams"
  ON dreams FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tüm users kendi rüyalarını silebilsin
CREATE POLICY "Users can delete their own dreams"
  ON dreams FOR DELETE
  USING (auth.uid() = user_id);

-- Indeksleri ekle performans için
CREATE INDEX idx_dreams_user_id ON dreams(user_id);
CREATE INDEX idx_dreams_created_at ON dreams(created_at DESC);
