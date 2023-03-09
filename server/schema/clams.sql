CREATE TABLE clam (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    survey_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    lat DECIMAL NOT NULL,
    lon DECIMAL NOT NULL,
    length DECIMAL NOT NULL,
    width DECIMAL NOT NULL,
    weight DECIMAL NOT NULL,
    comments TEXT NULL,
    image TEXT NULL,
    FOREIGN KEY (survey_id) REFERENCES survey(id) ON DELETE CASCADE ON UPDATE CASCADE
);
