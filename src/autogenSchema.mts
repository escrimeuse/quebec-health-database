import fs from "node:fs";

export function autogenSchema() {
    let healthData = [];

    console.log('Reading data from file healthData.json ...')
    try {
        const waitlistData = fs.readFileSync('./healthData.json', 'utf-8');
        healthData = JSON.parse(waitlistData);
    } catch (error) {
        console.error('Error reading healthData.json: ', error)
    }

    const valuesAsSQL = healthData.map((data, index) => {
        return `(${index}, ${data.region}, "${data.year}", "${data.period}", "${data.delay}", ${data.total}, ${data.other}, ${data.general}, ${data.orthopedic}, ${data.plastic}, ${data.vascular}, ${data.neuro}, ${data.entf}, ${data.obgyn}, ${data.opthamology}, ${data.urology})`
    });
    const numInsertStatments = Math.ceil(valuesAsSQL.length/100);
    const arr = new Array(numInsertStatments).fill(1);
    const insertStatements = arr.map((_value, index) => {
        const startingIndex = index * 100;
        return valuesAsSQL.slice(startingIndex, startingIndex + 100);
    })

    console.log("Writing SQL ...")

    try {
        fs.writeFileSync('autogenSchema.sql', `
DROP TABLE IF EXISTS Regions;
CREATE TABLE IF NOT EXISTS Regions (id INTEGER PRIMARY KEY, number TEXT, name TEXT);
INSERT INTO Regions (id, number, name) VALUES (1, 'RSS01', 'Bas-Saint-Laurent'), (2, 'RSS02', 'Saguenay - Lac-Saint-Jean'), (3, 'RSS03', 'Capitale-Nationale'), (4, 'RSS04', 'Mauricie et Centre-du-Québec '), (5, 'RSS05', 'Estrie'), (6, 'RSS06', 'Montréal'), (7, 'RSS07', 'Outaouais'), (8, 'RSS08', 'Abitibi-Témiscamingue'), (9, 'RSS09', 'Côte-Nord'), (10, 'RSS10', 'Nord-du-Québec'), (11, 'RSS11', 'Gaspésie - Îles-de-la-Madeleine'), (12, 'RSS12', 'Chaudière-Appalaches'), (13, 'RSS13', 'Laval'), (14, 'RSS14', 'Lanaudière'), (15, 'RSS15', 'Laurentides'), (16, 'RSS16', 'Montérégie' );

DROP TABLE IF EXISTS SurgicalSpecialties;
CREATE TABLE IF NOT EXISTS SurgicalSpecialties (id TEXT PRIMARY KEY, name TEXT);
INSERT INTO SurgicalSpecialties (id, name) VALUES ('GENE', 'General Surgery'), ('ORTH', 'Orthopedic Surgery'), ('PLAS', 'Plastic Surgery'), ('VASC', 'Vascular Surgery'), ('NEUR', 'Neurosurgery'), ('OBGY', 'Obstetrics/Gynecology Surgery'), ('ENTF', 'ENT/Cervico-Facial Surgery'), ('UROL', 'Urology Surgery'), ('OTHE', 'Other');

DROP TABLE IF EXISTS Waitlist;
CREATE TABLE IF NOT EXISTS Waitlist (id INTEGER PRIMARY KEY, region_id INTEGER, FOREIGN KEY (region_id) REFERENCES Regions(id), year TEXT, period TEXT, delay TEXT, total INTEGER, other INTEGER, general INTEGER, orthopedic INTEGER, plastic INTEGER, vascular INTEGER, neuro INTEGER, entf INTEGER, obgyn INTEGER, opthamology INTEGER, urology INTEGER);
${insertStatements.map((statement) => {
    return `INSERT INTO Waitlist (id, region_id, year, period, delay, total, other, general, orthopedic, plastic, vascular, neuro, entf, obgyn, opthamology, urology) VALUES ${statement.join(', ')}`;
}).join(';\n\n')}`);

    console.log("Done!")
    } catch (error) {
        console.log("Error writing SQL: ", error)
    }
    
}

autogenSchema();