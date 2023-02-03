 -- (NOTE andrew): double check if we want to collapse first/last name into one field,
 --                given that the Raker table does it that way
 -- (NOTE andrew): also double check if enum works & if roles are appropriate

CREATE TABLE users(
  id     INTEGER PRIMARY KEY,
  email       VARCHAR(255),
  role   ENUM('admin', 'editor', 'viewer'),
  first_name  VARCHAR(50),
  last_name   VARCHAR(50),
  PRIMARY KEY(id)
);
