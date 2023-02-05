CREATE TABLE raker(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    survey_id INTEGER NOT NULL,
    name VARCHAR NOT NULL,
    start_lat DECIMAL NOT NULL,
    start_long DECIMAL NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    end_lat DECIMAL NOT NULL,
    end_long DECIMAL NOT NULL,
    start_depth DECIMAL NOT NULL,
    end_depth DECIMAL NOT NULL,
    start_slope DECIMAL NOT NULL,
    end_slope DECIMAL NOT NULL,
    rake_area VARCHAR NOT NULL,
    FOREIGN KEY (survey_id) REFERENCES survey(id) ON DELETE CASCADE ON UPDATE CASCADE
);

