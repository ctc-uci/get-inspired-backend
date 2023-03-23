CREATE TABLE raker(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    survey_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    start_lat DOUBLE NOT NULL,
    start_long DOUBLE NOT NULL,
    mid_lat DOUBLE NOT NULL,
    mid_long DOUBLE NOT NULL,
    end_lat DOUBLE NOT NULL,
    end_long DOUBLE NOT NULL,
    start_depth DOUBLE NOT NULL,
    end_depth DOUBLE NOT NULL,
    rake_distance DOUBLE NOT NULL,
    rake_width DOUBLE NOT NULL,
    FOREIGN KEY (survey_id) REFERENCES survey(id) ON DELETE CASCADE ON UPDATE CASCADE
);
