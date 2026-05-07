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
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Migración para bases de datos existentes:
-- ALTER TABLE diagrams ADD COLUMN count_modules SMALLINT NOT NULL DEFAULT 0;
-- ALTER TABLE diagrams ADD COLUMN count_screens  SMALLINT NOT NULL DEFAULT 0;
-- ALTER TABLE diagrams ADD COLUMN count_tables   SMALLINT NOT NULL DEFAULT 0;
-- ALTER TABLE diagrams ADD COLUMN count_flows    SMALLINT NOT NULL DEFAULT 0;
