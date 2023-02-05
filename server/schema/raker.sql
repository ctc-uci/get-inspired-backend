CREATE TABLE raker(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    survey_id INTEGER NOT NULL,
    FOREIGN KEY (survey_id) REFERENCES survey(id) ON DELETE CASCADE ON UPDATE CASCADE,
    name VARCHAR,
    start_lat DECIMAL,
    start_long DECIMAL,
    start_time DATETIME,
    end_time DATETIME,
    end_lat DECIMAL,
    end_long DECIMAL,
    start_depth DECIMAL,
    end_depth DECIMAL,
    start_slope DECIMAL,
    end_slope DECIMAL,
    rake_area VARCHAR,
);

