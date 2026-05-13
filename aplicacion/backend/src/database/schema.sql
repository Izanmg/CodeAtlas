-- CodeAtlas — schema inicial
-- Ejecutar contra la base de datos `codeatlas`

CREATE TABLE IF NOT EXISTS users (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  email       VARCHAR(255) NOT NULL UNIQUE,
  name        VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS projects (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id     CHAR(36)     NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_update DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id CHAR(36)     NOT NULL,
  theme   VARCHAR(20)  NOT NULL DEFAULT 'light',
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS diagrams (
  id             CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id        CHAR(36)     NOT NULL,
  project_id     CHAR(36)     NOT NULL,
  name           VARCHAR(255) NOT NULL,
  description    TEXT,
  model_json     LONGTEXT     NOT NULL,
  layout_json    LONGTEXT     NOT NULL,
  count_modules  SMALLINT     NOT NULL DEFAULT 0,
  count_screens  SMALLINT     NOT NULL DEFAULT 0,
  count_tables   SMALLINT     NOT NULL DEFAULT 0,
  count_flows    SMALLINT     NOT NULL DEFAULT 0,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_diagrams_user_id (user_id),
  INDEX idx_diagrams_project_id (project_id)
);

CREATE TABLE IF NOT EXISTS bot_sessions (
  id           CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id      CHAR(36)     NOT NULL,
  title        VARCHAR(255) NOT NULL DEFAULT 'Nueva conversación',
  history_json LONGTEXT     NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_bot_sessions_user (user_id, updated_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bot_files (
  session_id CHAR(36)     NOT NULL,
  path       VARCHAR(255) NOT NULL,
  content    LONGTEXT     NOT NULL,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (session_id, path),
  FOREIGN KEY (session_id) REFERENCES bot_sessions(id) ON DELETE CASCADE
);

-- Migración para bases de datos existentes:
-- ALTER TABLE diagrams ADD COLUMN count_modules SMALLINT NOT NULL DEFAULT 0;
-- ALTER TABLE diagrams ADD COLUMN count_screens  SMALLINT NOT NULL DEFAULT 0;
-- ALTER TABLE diagrams ADD COLUMN count_tables   SMALLINT NOT NULL DEFAULT 0;
-- ALTER TABLE diagrams ADD COLUMN count_flows    SMALLINT NOT NULL DEFAULT 0;
--
-- Migración user_id en diagrams (poblar desde projects, luego añadir constraint):
-- ALTER TABLE diagrams ADD COLUMN user_id CHAR(36) NULL AFTER id;
-- UPDATE diagrams d JOIN projects p ON p.id = d.project_id SET d.user_id = p.user_id;
-- ALTER TABLE diagrams MODIFY COLUMN user_id CHAR(36) NOT NULL;
-- ALTER TABLE diagrams ADD CONSTRAINT fk_diagrams_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- ALTER TABLE diagrams ADD INDEX idx_diagrams_user_id (user_id);
