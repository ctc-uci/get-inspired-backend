CREATE TABLE clam (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    survey_id INTEGER NOT NULL,
    [Name] TEXT,
    [Lat] DOUBLE,
    [Long] DOUBLE,
    [Length] DOUBLE,
    [Width] DOUBLE,
    [Weight] DOUBLE,
    [Color] TEXT,
    [Comments] TEXT,
    FOREIGN KEY (survey_id) REFERENCES survey(id) ON DELETE CASCADE ON UPDATE CASCADE
);
