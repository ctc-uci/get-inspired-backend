CREATE TABLE clams IF NOT EXISTS{
    clamId SERIAL PRIMARY KEY,
    rakerId INTEGER NOT NULL,
    lat DECIMAL NOT NULL,
    long DECIMAL NOT NULL,
    length INTEGER NOT NULL,
    width INTEGER NOT NULL,
    weight INTEGER NOT NULL,
    comments TEXT NULL,
    image TEXT NULL,
};
