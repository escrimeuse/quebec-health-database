import fs from 'fs';
import type { DonneesQuebecResponse } from './types.ts';

export abstract class DonneesQuebec<TRecordData, TransformedData> {
	apiUrl: string = 'https://www.donneesquebec.ca/recherche/api/3/action/datastore_search_sql';
	writeFolder: string = './src/data/donneesQuebec/';

	name: string | undefined;
	resourceId: string | undefined;

	constructor(name: string, resourceId: string) {
		this.name = name;
		this.resourceId = resourceId;
	}

	abstract getDataFromApi(): Promise<DonneesQuebecResponse<TRecordData>>;
	abstract transformData(data: DonneesQuebecResponse<TRecordData>): TransformedData;
	//abstract writeFile(data: TransformedData | undefined, fileName: string): void;

	async run() {
		let data;
		try {
			data = await this.getDataFromApi();
		} catch (error) {
			console.error('There was an error getting the data from the API: ', error);
		}

		const transformedData = data ? this.transformData(data) : undefined;

		try {
			fs.mkdirSync(this.writeFolder, { recursive: true });
			await this.writeFile(transformedData);
		} catch (error) {
			console.error('There was an error writing data to file: ', error);
		}
	}

	async writeFile(data: TransformedData | undefined) {
		try {
			fs.mkdirSync(`${this.writeFolder}`, { recursive: true });
			fs.writeFileSync(`${this.writeFolder}/${this.name}-${this.resourceId}.json`, JSON.stringify(data));
		} catch (error) {
			console.error('There was an error writing to file: ', error);
		}
	}
}
