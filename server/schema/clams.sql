CREATE TABLE clam (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    survey_id INTEGER NOT NULL,
<<<<<<< HEAD
    [Name] TEXT NOT NULL,
    [Color] TEXT NOT NULL,
    [Lat] DOUBLE NOT NULL,
    [Long] DOUBLE NOT NULL,
    [Length] DOUBLE NOT NULL,
    [Width] DOUBLE NOT NULL,
    [Weight] DOUBLE NOT NULL,
    [Comments] TEXT NULL,
    [Image] TEXT NULL,
=======
    `Name` TEXT,
    `Lat` DOUBLE,
    `Long` DOUBLE,
    `Length` DOUBLE,
    `Width` DOUBLE,
    `Weight` DOUBLE,
    `Color` TEXT,
    `Comments` TEXT,
>>>>>>> dev
    FOREIGN KEY (survey_id) REFERENCES survey(id) ON DELETE CASCADE ON UPDATE CASCADE
);
