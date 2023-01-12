CREATE TABLE raker{
    FOREIGN KEY(rakerId) references Clams(raker_id) on DELETE CASCADE,
    surveyId INTEGER,
    rakerName VARCHAR,
    startLat DECIMAL,
    startLong DECIMAL,
    startTime DATETIME,
    endTime DATETIME,
    endLat DECIMAL,
    endLong DECIMAL,
    startDepth DECIMAL,
    endDepth DECIMAL,
    startSlope DECIMAL,
    endSlope DECIMAL,
    rakeArea VARCHAR,
};

