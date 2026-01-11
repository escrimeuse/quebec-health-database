import axios from 'axios';
import fs from 'fs';

type DonneesQuebecError = {
	help: string;
	success: false;
	error: {
		__type: string;
		message: string;
	};
};

type DonneesQuebecSuccess<TRecord> = {
	help: string;
	success: true;
	result: {
		sql: string;
		records: Array<TRecord>;
		// TODO: Add better types to this
		fields: Array<any>;
	};
};

export type DonneesQuebecResponse<TRecord> = DonneesQuebecError | DonneesQuebecSuccess<TRecord>;

export abstract class DonneesQuebecDataExtractor<TRecordData, TransformedData> {
	apiUrl: string = 'https://www.donneesquebec.ca/recherche/api/3/action/datastore_search_sql';
	writeFolder: string = './src/data/donneesQuebec/';
	schemaFolder: string = './src/schema';

	name;
	resourceId;

	constructor(name: string, resourceId: string) {
		this.name = name;
		this.resourceId = resourceId;
	}

	abstract transformData(data: Array<TRecordData>): TransformedData;

	abstract writeSqlSchema(data: TransformedData | undefined): Promise<void>;

	async getDataFromApi(): Promise<Array<TRecordData>> {
		const { data } = await axios.get<DonneesQuebecResponse<TRecordData>>(`${this.apiUrl}?sql=SELECT * from "${this.resourceId}"`);

		if (!data.success) {
			throw new Error('Error getting data from the API');
		}
		return data.result.records;
	}

	async writeFile(data: TransformedData | undefined) {
		try {
			fs.mkdirSync(`${this.writeFolder}`, { recursive: true });
			fs.writeFileSync(`${this.writeFolder}/${this.name}-${this.resourceId}.json`, JSON.stringify(data));
		} catch (error) {
			throw new Error('There was an error writing to file: ' + JSON.stringify(error));
		}
	}

	async run() {
		let data;
		try {
			data = await this.getDataFromApi();
		} catch (error) {
			throw new Error('There was an error getting the data from the API: ' + JSON.stringify(error));
		}

		const transformedData = data ? this.transformData(data) : undefined;

		try {
			fs.mkdirSync(this.writeFolder, { recursive: true });
			await this.writeFile(transformedData);
		} catch (error) {
			throw new Error('There was an error writing data to file: ' + JSON.stringify(error));
		}

		try {
			fs.mkdirSync(this.schemaFolder, { recursive: true });
			await this.writeSqlSchema(transformedData);
		} catch (error) {
			throw new Error('There was an error writing SQL schema to file: ' + JSON.stringify(error));
		}

		return data;
	}
}
