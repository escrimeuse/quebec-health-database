import shp from 'shpjs';
import fs from 'fs';
import { Writable } from 'stream';
import { DonneesQuebecDataExtractor } from './DonneesQuebecDataExtractor.ts';

const FILE_URL = 'https://publications.msss.gouv.qc.ca/msss/fichiers/statistiques/cartes/territoires_rss_2025.zip';

type RegionRecordData = {
	type: 'FeatureCollection';
	features: Array<{
		type: 'Feature';
		geometry: JSON;
		properties: {
			RSS_code: string;
			RSS_nom: string;
			Etiquette: string;
			Version: Date;
			Shape_Leng: number;
			Shapre_Area: number;
		};
	}>;
};

type TransformedRegionData = {
	code: string;
	name: string;
	validAsOf: Date;
};

export class Regions extends DonneesQuebecDataExtractor<RegionRecordData, Array<TransformedRegionData>> {
	// Overriding this function because we're not actually fetching the data from the API,
	// it's coming from a ZIP file
	async getDataFromApi() {
		const response = await fetch(FILE_URL);

		if (!response || !response.ok) {
			console.error('Failed to load shapefile :', response);
		}

		try {
			fs.mkdirSync('./temp/', { recursive: true });
			const writer = Writable.toWeb(fs.createWriteStream('./temp/shapeFile.zip'));

			await response.body?.pipeTo(writer);
		} catch (error) {
			console.error('Error writing data to temporary file: ', error);
			fs.rmSync('./temp', { recursive: true });
		}

		const data = fs.readFileSync('./temp/shapeFile.zip');
		fs.rmSync('./temp', { recursive: true });
		const geoJson = await shp(data);

		return [geoJson];
	}

	transformData(data: Array<RegionRecordData>) {
		return data[0].features.map((region) => {
			return {
				code: `RSS${region.properties.RSS_code}`,
				name: region.properties.RSS_nom,
				validAsOf: region.properties.Version,
			};
		});
	}

	async writeRegionShapeFiles(data: Array<RegionRecordData>) {
		try {
			fs.mkdirSync('./src/data/extracted/shapeFiles/', { recursive: true });

			data[0].features.forEach((feature) => {
				fs.writeFileSync(`./src/data/extracted/shapeFiles/${feature.properties.RSS_code}.json`, JSON.stringify(feature));
			});
		} catch (error) {
			console.error('There was an error writing the region shape file: ', error);
		}
	}

	generateSql(data: TransformedRegionData[]) {
		return `
DROP TABLE IF EXISTS regions;
CREATE TABLE IF NOT EXISTS regions (code TEXT PRIMARY KEY, name TEXT);
INSERT INTO regions (code, name) VALUES ("RSS99", "All Regions");
${data
	.map((data) => {
		return `INSERT INTO regions (code, name) VALUES ("${data.code}", "${data.name}");`;
	})
	.join('\n')}
    `;
	}

	async run() {
		const data = await super.run();

		await this.writeRegionShapeFiles(data);

		return data;
	}
}
