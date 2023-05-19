CREATE TABLE user(
  id     VARCHAR(255) PRIMARY KEY,
  email       VARCHAR(255),
  role   ENUM('admin', 'intern'),
  first_name  VARCHAR(50),
  last_name   VARCHAR(50)
);
