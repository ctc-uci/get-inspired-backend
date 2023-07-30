CREATE TABLE user(
  id          VARCHAR(255) PRIMARY KEY,
  email       TEXT NOT NULL,
  role        ENUM('admin', 'intern') NOT NULL,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL
);
