import shp from 'shpjs';
import fs from 'fs';
import { Writable } from 'stream';
import { DonneesQuebecDataExtractor } from './DonneesQuebecDataExtractor.mts';

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

class Regions extends DonneesQuebecDataExtractor<RegionRecordData, Array<TransformedRegionData>> {
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
			fs.mkdirSync('./src/data/donneesQuebec/shapeFiles/', { recursive: true });

			data[0].features.forEach((feature) => {
				fs.writeFileSync(`./src/data/donneesQuebec/shapeFiles/${feature.properties.RSS_code}.json`, JSON.stringify(feature));
			});
		} catch (error) {
			console.error('There was an error writing the region shape file: ', error);
		}
	}

	async run() {
		const data = await super.run();
		if (!data) {
			return;
		}

		await this.writeRegionShapeFiles(data);

		return data;
	}
}

const regions = new Regions('regions', 'none');
await regions.run();
