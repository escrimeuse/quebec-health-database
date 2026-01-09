import { DonneesQuebec } from './DonneesQuebec.mts';
import type { DonneesQuebecResponse } from './DonneesQuebec.mts';
import axios from 'axios';

const RESOURCE_IDS = [
	'2971bc36-3b1e-4323-909e-c66c96bc9946', // 2024 to 2025
	'df36cf4a-d089-4bda-8275-34e729c8be67', // 2023 to 2024
	'6ab1cfa7-a685-412b-a639-a80516227994', // 2022 to 2023
	'f542c028-ca40-43a5-a4cd-14ba83e27a37', // 2021 to 2022
	'2af25aad-7795-47c8-ab39-88718823153b', // 2020 to 2021
	'd069c86a-b7ac-4dc7-b302-503c657976e0', // 2019 to 2020
	'40a24669-0ac2-4b58-a5fe-8cbfc88cd2c1', // 2018 to 2019
	'1f371dff-abcd-4b1c-98ce-e5557b4e90c6', // 2017 to 2018
	'465ab121-8ebd-4e91-9566-eadc95097a92', // 2016 to 2017
	'd6eeba34-46cd-4338-bbc8-c32618e12323', // 2015 to 2016
	'2ab91bc0-30ba-4328-8775-f4eb759a7a40', // 2014 to 2015
	'a9a65ad6-0693-4205-af08-775b5306151b', // 2013 to 2014
	'437dddc3-9c11-4411-866a-a4c16c27e7fe', // 2012 to 2013
	'f95d165b-6cfa-473e-9465-711c59ee76be', // 2011 to 2012
];

type BirthRecordData = {
	TYPE_SOINS: string;
	REGION: string;
	NBR_ACCOUCH_ET_CESARIEN: string | null;
	NBR_CESARIENNES: string | null;
	NBR_NAISS_VIVANT: string | null;
	NBR_MORTINAISSANC: string | null;
	PERIODE: string | null;
};

type TransformedBirthData = {
	careType: string;
	regionCode: string;
	deliveriesAndCsections: number | null;
	csections: number | null;
	livebirths: number | null;
	stillbirths: number | null;
	startDate: Date;
	endDate: Date;
};

class Births extends DonneesQuebec<BirthRecordData, Array<TransformedBirthData>> {
	async getDataFromApi() {
		const { data } = await axios.get<DonneesQuebecResponse<BirthRecordData>>(`${this.apiUrl}?sql=SELECT * from "${this.resourceId}"`);
		return data;
	}

	transformData(data: DonneesQuebecResponse<BirthRecordData>) {
		if (data.success === false) {
			return [];
		}

		return data.result.records.map((record) => {
			const [_between, startDate, _and, endDate] = record.PERIODE?.split(' ') ?? [];

			let region;
			if (record.REGION === 'TOTAL PROVINCIAL') {
				region = 'ALL';
			} else {
				region = `RSS${record.REGION.substring(0, 2)}`;
			}

			const { TYPE_SOINS, NBR_ACCOUCH_ET_CESARIEN, NBR_CESARIENNES, NBR_MORTINAISSANC, NBR_NAISS_VIVANT } = record;

			return {
				careType: TYPE_SOINS ?? null,
				regionCode: region,
				deliveriesAndCsections: NBR_ACCOUCH_ET_CESARIEN ? Number(NBR_ACCOUCH_ET_CESARIEN) : null,
				csections: NBR_CESARIENNES ? Number(NBR_CESARIENNES) : null,
				livebirths: NBR_NAISS_VIVANT ? Number(NBR_NAISS_VIVANT) : null,
				stillbirths: NBR_MORTINAISSANC ? Number(NBR_MORTINAISSANC) : null,
				startDate: new Date(startDate),
				endDate: new Date(endDate),
			};
		});
	}
}

RESOURCE_IDS.forEach(async (resource) => {
	const births = new Births('births', resource);
	await births.run();
});
