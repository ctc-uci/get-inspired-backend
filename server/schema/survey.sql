CREATE TABLE survey(
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  beach TEXT,
  start_time TIME,
  location TEXT,
  method TEXT,
  date DATETIME,
  start_depth DOUBLE,
  end_depth DOUBLE,
  tide DOUBLE,
  duration INTEGER,
  distance DOUBLE,
  slope DOUBLE,
  rakers INTEGER
);
