import shp from 'shpjs';
import fs from 'fs';
import { Writable } from 'stream';

const FILE_URL = 'https://publications.msss.gouv.qc.ca/msss/fichiers/statistiques/cartes/territoires_rss_2025.zip';

async function downloadShapeFile() {
	const response = await fetch(FILE_URL);

	if (!response || !response.ok) {
		console.error('Failed to load shapefile :', response);
	}

	try {
		fs.mkdirSync('./temp/');
		const writer = Writable.toWeb(fs.createWriteStream('./temp/shapeFile.zip'));

		await response.body?.pipeTo(writer);
	} catch (error) {
		console.error('Error writing data to temporary file: ', error);
		fs.rmSync('./temp', { recursive: true });
	}
}

async function writeRegionShapeFiles() {
	try {
		const data = fs.readFileSync('./temp/shapeFile.zip');
		const geoJson = await shp(data);

		fs.mkdirSync('./src/data/autogen/shapeFiles/', { recursive: true });

		geoJson.features.forEach((feature) => {
			fs.writeFileSync(`./src/data/autogen/shapeFiles/${feature.properties.RSS_code}.json`, JSON.stringify(feature));
		});
	} catch (error) {
		console.error('There was an error writing the region shape file: ', error);
	}
}

async function writeRegionDataFile() {
	try {
		const data = fs.readFileSync('./temp/shapeFile.zip');
		const geoJson = await shp(data);

		const regions = geoJson.features.map((region) => {
			return {
				code: `RSS${region.properties.RSS_code}`,
				name: region.properties.RSS_nom,
				valid_as_of: region.properties.Version,
			};
		});

		fs.mkdirSync('src/data/autogen', { recursive: true });
		fs.writeFileSync('./src/data/autogen/regions.json', JSON.stringify(regions));
	} catch (error) {
		console.error('There was an error writing the region data file: ', error);
	}
}

console.log('download file');
await downloadShapeFile();
await writeRegionShapeFiles();
await writeRegionDataFile();
fs.rmSync('./temp', { recursive: true });
console.log('done');
