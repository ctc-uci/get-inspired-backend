CREATE TABLE survey{
  FOREIGN KEY (survey_id) references Raker(survey_id) on DELETE CASCADE,
  beach_id INTEGER,
  lot INTEGER,
  date DATETIME,
  location VARCHAR,
  method VARCHAR,
  tide DOUBLE,
};
