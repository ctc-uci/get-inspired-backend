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
    `avg width`  DECIMAL (65, 3) NOT NULL DEFAULT 0,
    `avg length`  DECIMAL (65, 3) NOT NULL DEFAULT 0
);

delimiter //
CREATE TRIGGER compute_on_survey_insert
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
    `avg width`,
    `avg length`)
    VALUES (NEW.id,
    /* # people */
    IFNULL((SELECT COUNT(*) FROM raker WHERE raker.survey_id = NEW.id), 0),

    /* # clams found */
    IFNULL((SELECT COUNT(*) FROM clam WHERE clam.survey_id = NEW.id), 0),

    /* # man hours */
    IFNULL((SELECT HOUR(TIMEDIFF(`End Time`, `Start Time`)) + MINUTE(TIMEDIFF(`End Time`, `Start Time`)) / 60 FROM raker WHERE raker.survey_id = NEW.id), 0),

    /* distance covered */
    IFNULL((SELECT Distance FROM survey WHERE survey.id = NEW.id), 0),

    /* # clams/man hr */
    IFNULL(((SELECT COUNT(*) from clam WHERE clam.survey_id = NEW.id) / (SELECT SUM(HOUR(TIMEDIFF(`End Time`, `Start Time`)) + MINUTE(TIMEDIFF(`End Time`, `Start Time`)) / 60) FROM raker WHERE raker.survey_id = NEW.id)), 0),

    /* clam density */
    IFNULL(((SELECT COUNT(*) from clam WHERE clam.survey_id = NEW.id) / (SELECT SUM(`Rake Width` * `Rake Distance`) FROM raker WHERE raker.survey_id = NEW.id)), 0),

    /* area raked */
    IFNULL((SELECT SUM(`Rake Width` * `Rake Distance`) FROM raker WHERE raker.survey_id = NEW.id), 0),

    /* total time raking */
    IFNULL((SELECT Duration FROM survey WHERE survey.id = NEW.id), 0),

    /* avg clam weight */
    IFNULL((SELECT AVG(Weight) FROM clam WHERE clam.survey_id = NEW.id), 0),

    /* avg clam width */
    IFNULL((SELECT AVG(Width) FROM clam WHERE clam.survey_id = NEW.id), 0),

    /* avg clam length */
    IFNULL((SELECT AVG(Length) FROM clam WHERE clam.survey_id = NEW.id), 0)
    );
END;//
delimiter ;

delimiter //
CREATE TRIGGER compute_on_survey_update
AFTER UPDATE ON survey
FOR EACH ROW
BEGIN
    UPDATE computation
    SET
        `distance covered` = IFNULL((SELECT Distance FROM survey WHERE survey.id = NEW.id), 0),
        `total time raking` = IFNULL((SELECT Duration FROM survey WHERE survey.id = NEW.id), 0)
    WHERE computation.survey_id = NEW.id;
END;

CREATE TRIGGER compute_on_survey_delete
AFTER DELETE ON survey
FOR EACH ROW
BEGIN
    DELETE FROM computation
    WHERE survey_id = OLD.id;
END;//
delimiter ;

delimiter //
CREATE TRIGGER compute_on_raker_insert
AFTER INSERT on raker
FOR EACH ROW
BEGIN
    UPDATE computation
    SET
        `# people` = `# people` + 1,
        `# man hours` = IFNULL((SELECT SUM(HOUR(TIMEDIFF(`End Time`, `Start Time`)) + MINUTE(TIMEDIFF(`End Time`, `Start Time`)) / 60) FROM raker WHERE raker.survey_id = NEW.survey_id), 0),
        `clams/man hr` = IFNULL((SELECT COUNT(*) from clam WHERE clam.survey_id = NEW.survey_id) / (SELECT SUM(HOUR(TIMEDIFF(`End Time`, `Start Time`)) + MINUTE(TIMEDIFF(`End Time`, `Start Time`)) / 60) FROM raker WHERE raker.survey_id = NEW.survey_id), 0),
        `clam density` = IFNULL(((SELECT COUNT(*) from clam WHERE clam.survey_id = NEW.survey_id) / (SELECT SUM(`Rake Width` * `Rake Distance`) FROM raker WHERE raker.survey_id = NEW.survey_id)), 0),
        `area raked` = IFNULL((SELECT SUM(`Rake Width` * `Rake Distance`) FROM raker WHERE raker.survey_id = NEW.survey_id), 0)
    WHERE computation.survey_id = NEW.survey_id;
END;//
delimiter ;

delimiter //
CREATE TRIGGER compute_on_raker_update
AFTER UPDATE on raker
FOR EACH ROW
BEGIN
    UPDATE computation
    SET
      `# man hours` = IFNULL((SELECT HOUR(TIMEDIFF(`End Time`, `Start Time`)) + MINUTE(TIMEDIFF(`End Time`, `Start Time`)) / 60 FROM raker WHERE raker.survey_id = NEW.survey_id), 0),
      `clams/man hr` = IFNULL((SELECT COUNT(*) from clam WHERE clam.survey_id = NEW.survey_id) / (SELECT SUM(HOUR(TIMEDIFF(`End Time`, `Start Time`)) + MINUTE(TIMEDIFF(`End Time`, `Start Time`)) / 60) FROM raker WHERE raker.survey_id = NEW.survey_id), 0),
      `clam density` = IFNULL(((SELECT COUNT(*) from clam WHERE clam.survey_id = NEW.survey_id) / (SELECT SUM(`Rake Width` * `Rake Distance`) FROM raker WHERE raker.survey_id = NEW.survey_id)), 0),
      `area raked` = IFNULL((SELECT SUM(`Rake Width` * `Rake Distance`) FROM raker WHERE raker.survey_id = NEW.survey_id), 0)
    WHERE computation.survey_id = NEW.survey_id;
END;//
delimiter ;

delimiter //
CREATE TRIGGER compute_on_raker_delete
AFTER DELETE on raker
FOR EACH ROW
BEGIN
    UPDATE computation
    SET
      `# people` = `# people` - 1,
      `# man hours` = IFNULL((SELECT HOUR(TIMEDIFF(`End Time`, `Start Time`)) + MINUTE(TIMEDIFF(`End Time`, `Start Time`)) / 60 FROM raker WHERE raker.survey_id = OLD.survey_id), 0),
      `clams/man hr` = IFNULL((SELECT COUNT(*) from clam WHERE clam.survey_id = OLD.survey_id) / (SELECT SUM(HOUR(TIMEDIFF(`End Time`, `Start Time`)) + MINUTE(TIMEDIFF(`End Time`, `Start Time`)) / 60) FROM raker WHERE raker.survey_id = OLD.survey_id), 0),
      `clam density` = IFNULL(((SELECT COUNT(*) from clam WHERE clam.survey_id = OLD.survey_id) / (SELECT SUM(`Rake Width` * `Rake Distance`) FROM raker WHERE raker.survey_id = OLD.survey_id)), 0),
      `area raked` = IFNULL((SELECT SUM(`Rake Width` * `Rake Distance`) FROM raker WHERE raker.survey_id = OLD.survey_id), 0)
    WHERE computation.survey_id = OLD.survey_id;
END;//
delimiter ;

delimiter //
CREATE TRIGGER compute_on_clam_insert
AFTER INSERT on clam
FOR EACH ROW
BEGIN
    UPDATE computation
    SET
        `# clams found` = `# clams found` + 1,
        `clams/man hr` = IFNULL((SELECT COUNT(*) from clam WHERE clam.survey_id = NEW.survey_id) / (SELECT SUM(HOUR(TIMEDIFF(`End Time`, `Start Time`)) + MINUTE(TIMEDIFF(`End Time`, `Start Time`)) / 60) FROM raker WHERE raker.survey_id = NEW.survey_id), 0),
        `clam density` = IFNULL(((SELECT COUNT(*) from clam WHERE clam.survey_id = NEW.survey_id) / (SELECT SUM(`Rake Width` * `Rake Distance`) FROM raker WHERE raker.survey_id = NEW.survey_id)), 0),
        `avg weight` = IFNULL((SELECT AVG(Weight) FROM clam WHERE clam.survey_id = NEW.survey_id), 0),
        `avg width` = IFNULL((SELECT AVG(Width) FROM clam WHERE clam.survey_id = NEW.survey_id), 0),
        `avg length` = IFNULL((SELECT AVG(Length) FROM clam WHERE clam.survey_id = NEW.survey_id), 0)
    WHERE computation.survey_id = NEW.survey_id;
END;//
delimiter ;

delimiter //
CREATE TRIGGER compute_on_clam_update
AFTER UPDATE on clam
FOR EACH ROW
BEGIN
    UPDATE computation
    SET
        `clams/man hr` = IFNULL((SELECT COUNT(*) from clam WHERE clam.survey_id = NEW.survey_id) / (SELECT SUM(HOUR(TIMEDIFF(`End Time`, `Start Time`)) + MINUTE(TIMEDIFF(`End Time`, `Start Time`)) / 60) FROM raker WHERE raker.survey_id = NEW.survey_id), 0),
        `clam density` = IFNULL(((SELECT COUNT(*) from clam WHERE clam.survey_id = NEW.survey_id) / (SELECT SUM(`Rake Width` * `Rake Distance`) FROM raker WHERE raker.survey_id = NEW.survey_id)), 0),
        `avg weight` = IFNULL((SELECT AVG(Weight) FROM clam WHERE clam.survey_id = NEW.survey_id), 0),
        `avg width` = IFNULL((SELECT AVG(Width) FROM clam WHERE clam.survey_id = NEW.survey_id), 0),
        `avg length` = IFNULL((SELECT AVG(Length) FROM clam WHERE clam.survey_id = NEW.survey_id), 0)
    WHERE computation.survey_id = NEW.survey_id;
END;//
delimiter ;

delimiter //
CREATE TRIGGER compute_on_clam_delete
AFTER DELETE on clam
FOR EACH ROW
BEGIN
    UPDATE computation
    SET
        `# clams found` = `# clams found` - 1,
        `clams/man hr` = IFNULL((SELECT COUNT(*) from clam WHERE clam.survey_id = OLD.survey_id) / (SELECT SUM(HOUR(TIMEDIFF(`End Time`, `Start Time`)) + MINUTE(TIMEDIFF(`End Time`, `Start Time`)) / 60) FROM raker WHERE raker.survey_id = OLD.survey_id), 0),
        `clam density` = IFNULL(((SELECT COUNT(*) from clam WHERE clam.survey_id = OLD.survey_id) / (SELECT SUM(`Rake Width` * `Rake Distance`) FROM raker WHERE raker.survey_id = OLD.survey_id)), 0),
        `avg weight` = IFNULL((SELECT AVG(Weight) FROM clam WHERE clam.survey_id = OLD.survey_id), 0),
        `avg width` = IFNULL((SELECT AVG(Width) FROM clam WHERE clam.survey_id = OLD.survey_id), 0),
        `avg length` = IFNULL((SELECT AVG(Length) FROM clam WHERE clam.survey_id = OLD.survey_id), 0)
    WHERE computation.survey_id = OLD.survey_id;
END;//
delimiter ;
