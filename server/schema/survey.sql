CREATE TABLE survey(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  beach_id INTEGER,
  lot INTEGER,
  date DATETIME,
  location VARCHAR,
  duration INTEGER,
  start_depth DECIMAL,
  end_depth DECIMAL,
  slope DECIMAL,
  rakers INTEGER,
  start_time TIME,
  method VARCHAR,
  tide DOUBLE
);
