CREATE TABLE clam (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    survey_id INTEGER NOT NULL,
    [Name] TEXT NOT NULL,
    [Color] TEXT NOT NULL,
    [Lat] DOUBLE NOT NULL,]
    [Lon] DOUBLE NOT NULL,
    [Length] DOUBLE NOT NULL,
    [Width] DOUBLE NOT NULL,
    [Weight] DOUBLE NOT NULL,
    [Comments] TEXT NULL,
    [Image] TEXT NULL,
    FOREIGN KEY (survey_id) REFERENCES survey(id) ON DELETE CASCADE ON UPDATE CASCADE
);
