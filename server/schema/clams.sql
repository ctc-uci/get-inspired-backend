CREATE TABLE clam IF NOT EXISTS{
    clam_id INTEGER PRIMARY KEY,
    raker_id INTEGER NOT NULL,
    lat DOUBLE NOT NULL,
    lon DOUBLE NOT NULL,
    length DOUBLE NOT NULL,
    width DOUBLE NOT NULL,
    weight DOUBLE NOT NULL,
    comments TEXT NULL,
    image TEXT NULL,
};
