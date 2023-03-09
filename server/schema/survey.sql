CREATE TABLE survey(
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  beach TEXT,
  start_time TIME,
  location TEXT,
  method TEXT,
  date DATETIME,
  start_depth DECIMAL,
  end_depth DECIMAL,
  tide DECIMAL,
  duration INTEGER,
  distance DECIMAL,
  slope DECIMAL,
  rakers INTEGER
);
