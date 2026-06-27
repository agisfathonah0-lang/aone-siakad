-- 028_chat_kelas.sql
CREATE TABLE IF NOT EXISTS {schema}.chat_grup_kelas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  kode_mk VARCHAR(50),
  created_by UUID NOT NULL REFERENCES {schema}.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.chat_grup_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grup_id UUID NOT NULL REFERENCES {schema}.chat_grup_kelas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES {schema}.users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(grup_id, user_id)
);

CREATE TABLE IF NOT EXISTS {schema}.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grup_id UUID NOT NULL REFERENCES {schema}.chat_grup_kelas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES {schema}.users(id) ON DELETE CASCADE,
  pesan TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_grup_members_user ON {schema}.chat_grup_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_grup ON {schema}.chat_messages(grup_id, created_at);
