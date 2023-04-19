CREATE TABLE raker(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    survey_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    [Start Time] DATETIME NOT NULL,
    [End Time] DATETIME NOT NULL,
    [Start Lat] DOUBLE NOT NULL,
    [Start Long] DOUBLE NOT NULL,
    [Mid Lat] DOUBLE NOT NULL,
    [Mid Long] DOUBLE NOT NULL,
    [End Lat] DOUBLE NOT NULL,
    [End Long] DOUBLE NOT NULL,
    [Start Depth] DOUBLE NOT NULL,
    [End Depth] DOUBLE NOT NULL,
    [Rake Distance] DOUBLE NOT NULL,
    [Rake Width] DOUBLE NOT NULL,
    FOREIGN KEY (survey_id) REFERENCES survey(id) ON DELETE CASCADE ON UPDATE CASCADE
);
