import { Births, RESOURCE_IDS } from './classes/Births.ts';

RESOURCE_IDS.forEach(async (resource) => {
	const births = new Births('births', resource);
	await births.run();
});
