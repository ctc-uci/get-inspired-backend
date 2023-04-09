CREATE TABLE computation (
	survey_id INTEGER UNIQUE REFERENCES survey.id,
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
