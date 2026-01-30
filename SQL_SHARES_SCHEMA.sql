-- Paylaşılan rüyalar tablosu
CREATE TABLE public.dream_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dream_id, shared_with) -- Aynı rüya aynı kişiye 2 kez paylaşılamaz
);

-- RLS Policies
ALTER TABLE public.dream_shares ENABLE ROW LEVEL SECURITY;

-- Rüya sahibi kendi rüyasını paylaşabilir
CREATE POLICY "Users can share their own dreams"
  ON public.dream_shares
  FOR INSERT
  WITH CHECK (shared_by = auth.uid());

-- Rüya sahibi paylaşımları silebilir
CREATE POLICY "Users can delete their own shares"
  ON public.dream_shares
  FOR DELETE
  USING (shared_by = auth.uid());

-- Paylaşılan rüyaya erişeni ve sahibi görebilir
CREATE POLICY "Users can view shares of their dreams"
  ON public.dream_shares
  FOR SELECT
  USING (shared_by = auth.uid() OR shared_with = auth.uid());

-- Index
CREATE INDEX idx_dream_shares_shared_with ON public.dream_shares(shared_with);
CREATE INDEX idx_dream_shares_dream_id ON public.dream_shares(dream_id);
