CREATE TABLE survey(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  beach_id INTEGER,
  lot INTEGER,
  date DATETIME,
  location VARCHAR,
  method VARCHAR,
  tide DOUBLE
);
