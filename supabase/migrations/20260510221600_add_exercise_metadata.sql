-- Adicionando metadados visuais para a tabela exercises
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;
