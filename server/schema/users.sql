CREATE TABLE users(
  id     INTEGER PRIMARY KEY,
  email       VARCHAR(255),
  role   ENUM('admin', 'editor', 'viewer'),
  first_name  VARCHAR(50),
  last_name   VARCHAR(50),
  PRIMARY KEY(id)
);
