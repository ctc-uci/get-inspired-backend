CREATE TABLE computations(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    survey_id INTEGER NOT NULL,
    num_people INTEGER NOT NULL,
    clams_found INTEGER NOT NULL,
    man_hours DOUBLE NOT NULL,
    dist_covered DOUBLE NOT NULL,
    clams_per_hour DOUBLE NOT NULL,
    clam_density DOUBLE NOT NULL,
    area_raked DOUBLE NOT NULL,
    total_rake_time DOUBLE NOT NULL,
    avg_clam_weight DOUBLE NOT NULL,
    avg_width DOUBLE NOT NULL,
    FOREIGN KEY (survey_id) REFERENCES survey(id) ON DELETE CASCADE ON UPDATE CASCADE
);
