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

const ENDPOINT = 'https://www.donneesquebec.ca/recherche/api/3/action/datastore_search_sql';

async function getData() {
	let data;
	try {
		const responses = await Promise.all(
			RESOURCE_IDS.map(async (id) => {
				return await fetch(`${ENDPOINT}?sql=SELECT * from "${id}"`);
			})
		);

		const responseJson = await Promise.all(responses.map(async (r) => await r.json()));

		data = responseJson.map((r) => {
			return r.result.records;
		});
	} catch (error) {
		console.error('There was an error getting the birth data: ', error);
	}
	return data;
}

async function fetchBirths() {
	const birthData = await getData();

	if (!birthData) {
		console.error('No birth data found');
		return;
	}

	const formattedData = birthData.reduce((acc, data) => {
		const d = data.map(({ TYPE_SOINS, REGION, NBR_ACCOUCH_ET_CESARIEN, NBR_CESARIENNES, NBR_NAISS_VIVANT, NBR_MORTINAISSANC, PERIODE }) => {
			const [_between, startDate, _and, endDate] = PERIODE.split(' ');

			let region;
			if (REGION === 'TOTAL PROVINCIAL') {
				region = 'ALL';
			} else {
				region = `RSS${REGION.substr(0, 2)}`;
			}

			return {
				care_type: TYPE_SOINS,
				region_code: region,
				deliveries_and_csections: Number(NBR_ACCOUCH_ET_CESARIEN),
				csections: Number(NBR_CESARIENNES),
				live_births: Number(NBR_NAISS_VIVANT),
				stillbirths: Number(NBR_MORTINAISSANC),
				startDate: new Date(startDate),
				endDate: new Date(endDate),
			};
		});
		return [...d, ...acc];
	}, []);

	console.log(formattedData);
	// TODO: write data to file
}

console.log('Starting...');
await fetchBirths();
