CREATE TABLE survey(
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  beach TEXT NOT NULL,
  start_time TIME NOT NULL,
  location TEXT NOT NULL,
  method TEXT NOT NULL,
  date DATE NOT NULL,
  water_depth DOUBLE NOT NULL,
  tide TEXT NOT NULL,
  duration INTEGER NOT NULL,
  distance DOUBLE NOT NULL,
  slope DOUBLE NOT NULL
);
