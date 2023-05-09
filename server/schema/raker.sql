CREATE TABLE raker(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    survey_id INTEGER NOT NULL,
    [Name] TEXT,
    [Start Lat] DOUBLE,
    [Start Long] DOUBLE,
    [Start Time] DATETIME,
    [End Time] DATETIME,
    [Mid Lat] DOUBLE,
    [Mid Long] DOUBLE,
    [End Lat] DOUBLE,
    [End Long] DOUBLE,
    [Start Depth] DOUBLE,
    [End Depth] DOUBLE,
    [Rake Distance] DOUBLE,
    [Rake Width] DOUBLE,
    [Number] INTEGER,
    FOREIGN KEY (survey_id) REFERENCES survey(id) ON DELETE CASCADE ON UPDATE CASCADE
);
