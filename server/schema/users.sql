 -- (NOTE andrew): double check if we want to collapse first/last name into one field,
 --                given that the Raker table does it that way
 -- (NOTE andrew): also double check if enum works & if roles are appropriate

CREATE TABLE users(
  user_id     INTEGER PRIMARY KEY,
  email       VARCHAR(255),
  user_role   VARCHAR(50) NOT NULL,
  first_name  VARCHAR(50),
  last_name   VARCHAR(50),
  PRIMARY KEY(user_id)
);
