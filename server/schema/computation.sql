CREATE TABLE computation (
	survey_id INTEGER PRIMARY KEY REFERENCES survey.id,
    `# people` INTEGER NOT NULL DEFAULT 0,
    `# clams found` INTEGER NOT NULL DEFAULT 0,
    `# man hours` DECIMAL (65, 3) NOT NULL DEFAULT 0,
    `distance covered` DECIMAL (65, 3) NOT NULL DEFAULT 0,
    `clams/man hr` DECIMAL (65, 3) NOT NULL DEFAULT 0,
    `clam density` DECIMAL (65, 3) NOT NULL DEFAULT 0,
    `area raked` DECIMAL (65, 3) NOT NULL DEFAULT 0,
    `total time raking` DECIMAL (65, 3) NOT NULL DEFAULT 0,
    `avg weight` DECIMAL (65, 3) NOT NULL DEFAULT 0,
    `avg width`  DECIMAL (65, 3) NOT NULL DEFAULT 0
);

CREATE TRIGGER add_computation_row
AFTER INSERT ON survey
FOR EACH ROW
BEGIN
    INSERT INTO computation (survey_id,
    `# people`,
    `# clams found`,
    `# man hours`,
    `distance covered`,
    `clams/man hr`,
    `clam density`,
    `area raked`,
    `total time raking`,
    `avg weight`,
    `avg width`)
    VALUES (NEW.id,
    /* # people */
    IFNULL((SELECT COUNT(*) FROM raker WHERE raker.survey_id = NEW.id), 0),

    /* # clams found */
    IFNULL((SELECT COUNT(*) FROM clam WHERE clam.survey_id = NEW.id), 0),

    /* # man hours */
    IFNULL((SELECT HOUR(TIMEDIFF(end_time, start_time)) + MINUTE(TIMEDIFF(end_time, start_time)) / 60 FROM raker WHERE raker.survey_id = NEW.id), 0),

    /* distance covered */
    IFNULL((SELECT distance FROM survey WHERE survey.id = NEW.id), 0),

    /* # clams/man hr */
    IFNULL(((SELECT COUNT(*) from clam WHERE clam.survey_id = NEW.id) / (SELECT SUM(HOUR(TIMEDIFF(end_time, start_time)) + MINUTE(TIMEDIFF(end_time, start_time)) / 60) FROM raker WHERE raker.survey_id = NEW.id)), 0),

    /* clam density */
    IFNULL(((SELECT COUNT(*) from clam WHERE clam.survey_id = NEW.id) / (SELECT SUM(rake_width * rake_distance) FROM raker WHERE raker.survey_id = NEW.id)), 0),

    /* area raked */
    IFNULL((SELECT SUM(rake_width * rake_distance) FROM raker WHERE raker.survey_id = NEW.id), 0),

    /* total time raking */
    IFNULL((SELECT duration FROM survey WHERE survey.id = NEW.id), 0),

    /* avg clam weight */
    IFNULL((SELECT AVG(weight) FROM clam WHERE clam.survey_id = NEW.id), 0),

    /* avg clam width */
    IFNULL((SELECT AVG(width) FROM clam WHERE clam.survey_id = NEW.id), 0)
    );
END;

CREATE TRIGGER delete_computation_row
AFTER DELETE ON survey
FOR EACH ROW
BEGIN
    DELETE FROM computation WHERE survey_id = OLD.id;
END;

CREATE TRIGGER add_num_ppl
AFTER INSERT ON raker
FOR EACH ROW
BEGIN
      UPDATE computation
      SET `# people` = `# people` + 1
      WHERE computation.survey_id = NEW.survey_id;
END;

CREATE TRIGGER subtract_num_ppl
AFTER DELETE ON raker
FOR EACH ROW
BEGIN
      UPDATE computation
      SET `# people` = `# people` - 1
      WHERE computation.survey_id = OLD.survey_id;
END;

CREATE TRIGGER add_clam_found
AFTER INSERT ON clam
FOR EACH ROW
BEGIN
      UPDATE computation
      SET `# clams found` = `# clams found` + 1
      WHERE computation.survey_id = NEW.survey_id;
END;

CREATE TRIGGER subtract_clam_found
AFTER DELETE ON clam
FOR EACH ROW
BEGIN
      UPDATE computation
      SET `# clams found` = `# clams found` - 1
      WHERE computation.survey_id = OLD.survey_id;
END;

CREATE TRIGGER add_num_man_hours
AFTER INSERT ON raker
FOR EACH ROW
BEGIN
    UPDATE computation
    SET `# man hours` = `# man hours` + HOUR(TIMEDIFF(end_time, start_time)) + MINUTE(TIMEDIFF(end_time, start_time)) / 60
    WHERE computation.survey_id = NEW.survey_id;
END;

CREATE TRIGGER subtract_num_man_hours
AFTER DELETE ON raker
FOR EACH ROW
BEGIN
    UPDATE computation
    SET `# man hours` = `# man hours` - HOUR(TIMEDIFF(end_time, start_time)) + MINUTE(TIMEDIFF(OLD.end_time, OLD.start_time)) / 60
    WHERE computation.survey_id = OLD.survey_id;
END;

CREATE TRIGGER add_num_man_hours
AFTER UPDATE ON raker
FOR EACH ROW
BEGIN
    UPDATE computation
    SET `# man hours` = IFNULL((SELECT HOUR(TIMEDIFF(end_time, start_time)) + MINUTE(TIMEDIFF(end_time, start_time)) / 60 FROM raker WHERE raker.survey_id = computation.survey_id), 0)
    WHERE computation.survey_id = NEW.survey_id;
END;

CREATE TRIGGER update_distance
AFTER UPDATE on survey
FOR EACH ROW
BEGIN
    UPDATE computation
    SET `distance covered` = IFNULL((SELECT distance FROM survey WHERE survey.id = NEW.id), 0)
    WHERE computation.survey_id = NEW.id;
END;
