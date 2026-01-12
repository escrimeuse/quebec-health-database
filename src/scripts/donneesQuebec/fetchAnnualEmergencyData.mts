import { DonneesQuebecDataExtractor } from './DonneesQuebecDataExtractor.mts';

const RESOURCE_ID = `841b69a5-d420-42d5-b127-c2850b88f63b`;

type CumulativelEmergencyRecord = {
	annee: string | null;
	cumul_periode: string | null;
	rss: string | null;
	region: string | null;
	nom_etablissement: string | null;
	nom_installation: string | null;
	no_permis_installation: string | null;
	nb_visites_total: string | null;
	nb_usagers_75ans_et_plus_total: string | null;
	nb_usagers_sante_mentale_total: string | null;
	dms_total: string | null;
	nb_usagers_pec_total: string | null;
	delai_pec_total: string | null;
	nb_visites_ambulatoire: string | null;
	nb_usagers_75ans_et_plus_amb: string | null;
	nb_usagers_sante_mentale_amb: string | null;
	dms_ambulatoire: string | null;
	nb_usagers_pec_ambulatoire: string | null;
	delai_pec_ambulatoire: string | null;
	nb_visites_sur_civiere: string | null;
	nb_usagers_sur_civiere_plus_24h: string | null;
	nb_usagers_sur_civiere_plus_48h: string | null;
	dms_sur_civiere: string | null;
	nb_usagers_pec_sur_civiere: string | null;
	delai_pec_sur_civiere: string | null;
	nb_usagers_75ans_et_plus_civ: string | null;
	nb_usagers_sante_mentale_civ: string | null;
};

type TransformedCumulativeEmergencyData = {
	year: string;
	region: string;
	establishmentName: string;
	installationName: string;
	installationPermitNum: string;
	visitsTotal: number | null;
	visitsAmbulatoryTotal: number | null;
	visitsStretchersTotal: number | null;
	users75PlusTotal: number | null;
	users75PlusAmbulatory: number | null;
	users75PlusStretchers: number | null;
	usersMentalHealthTotal: number | null;
	usersMentalHealthAmbulatory: number | null;
	usersMentalHealthStretchers: number | null;
	averageLengthOfStayTotal: number | null;
	averageLengthOfStayAmbulatory: number | null;
	averageLengthOfStayStretchers: number | null;
	usersSeenByDoctorTotal: number | null;
	usersSeenByDoctorAmbulatory: number | null;
	usersSeenByDoctorStretchers: number | null;
	delayUntilSeenTotal: number | null;
	delayUntilSeenAmbulatory: number | null;
	delayUntilSeenStretchers: number | null;
};

class CumulativeEmergencyData extends DonneesQuebecDataExtractor<CumulativelEmergencyRecord, Array<TransformedCumulativeEmergencyData>> {
	transformData(data: CumulativelEmergencyRecord[]): TransformedCumulativeEmergencyData[] {
		console.log('data', data);

		const transformNumber = (numberAsString: string | null): number | null => {
			return numberAsString ? Number(numberAsString) : null;
		};
		return data.map((record) => {
			return {
				year: record.annee?.split('-')[0],
				region: `RSS${record.rss}`,
				establishmentName: record.nom_etablissement,
				installationName: record.nom_installation,
				installationPermitNum: record.no_permis_installation === 'null' ? null : record.no_permis_installation,
				visitsTotal: transformNumber(record.nb_visites_total),
				visitsAmbulatoryTotal: transformNumber(record.nb_visites_ambulatoire),
				visitsStretchersTotal: transformNumber(record.nb_visites_sur_civiere),

				users75PlusTotal: transformNumber(record.nb_usagers_75ans_et_plus_total),
				users75PlusAmbulatory: transformNumber(record.nb_usagers_75ans_et_plus_amb),
				users75PlusStretchers: transformNumber(record.nb_usagers_75ans_et_plus_civ),

				usersMentalHealthTotal: transformNumber(record.nb_usagers_sante_mentale_total),
				usersMentalHealthAmbulatory: transformNumber(record.nb_usagers_sante_mentale_amb),
				usersMentalHealthStretchers: transformNumber(record.nb_usagers_sante_mentale_civ),

				averageLengthOfStayTotal: transformNumber(record.dms_total),
				averageLengthOfStayAmbulatory: transformNumber(record.dms_ambulatoire),
				averageLengthOfStayStretchers: transformNumber(record.dms_sur_civiere),

				usersSeenByDoctorTotal: transformNumber(record.nb_usagers_pec_total),
				usersSeenByDoctorAmbulatory: transformNumber(record.nb_usagers_pec_ambulatoire),
				usersSeenByDoctorStretchers: transformNumber(record.nb_usagers_pec_sur_civiere),

				delayUntilSeenTotal: transformNumber(record.delai_pec_total),
				delayUntilSeenAmbulatory: transformNumber(record.delai_pec_ambulatoire),
				delayUntilSeenStretchers: transformNumber(record.delai_pec_sur_civiere),
			};
		});
	}

	generateSql(data: TransformedCumulativeEmergencyData[]) {
		return `
DROP TABLE IF EXISTS cumulativeEmergency
CREATE TABLE IF NOT EXISTS cumulativeEmergency (id TEXT PRIMARY KEY, year TEXT, region TEXT, establishmentName TEXT, installationName TEXT, installationPermitNum TEXT, visitsTotal INTEGER, visitsAmbulatoryTotal INTEGER, visitsStretcherTotal INTEGER, users75PlusTotal INTEGER, users75PlusAmbulatory INTEGER, users75PlusStretchers INTEGER, usersMentalHealthTotal INTEGER, usersMentalHealthAmbulatory INTEGER, usersMentalHealthStretchers INTEGER, averageLengthOfStayTotal REAL, averageLengthOfStayAmbulatory REAL, averageLengthOfStayStretchers REAL, usersSeenByDoctorTotal INTEGER, usersSeenByDoctorAmbulatory INTEGER, usersSeenByDoctorStretchers INTEGER, delayUntilSeenTotal REAL, delayUntilSeenAmbulatory REAL, delayUntilSeenStretchers REAL);
${data
	.map((d, index) => {
		const permitNumber = d.installationPermitNum === null ? null : `"${d.installationPermitNum}"`;

		return `INSERT INTO cumulativeEmergency (id, year, region, establishmentName, installationName, installationPermitNum, visitsTotal, visitsAmbulatory, visitsStretchers, users75PlusTotal, users75PlusAmbulatory, users75PlusStretchers, usersMentalHealthTotal, usersMentalHealthAmbulatory, usersMentalHealthStretchers, averageLengthOfStayTotal, averageLenghtOfStayAmbulatory, averageLengthOfStayStretchers, usersSeenByDoctorTotal, usersSeenByDoctorAmbulatory, usersSeenByDoctorStretchers, delayUntilSeenTotal, delayUntilSeenAmbulatory, delayUntilSeenStretchers) VALUES (${index}, "${d.year}", "${d.region}", "${d.establishmentName}", "${d.installationName}", ${permitNumber}, ${d.visitsTotal}, ${d.visitsAmbulatoryTotal}, ${d.visitsStretchersTotal}, ${d.users75PlusTotal}, ${d.users75PlusAmbulatory}, ${d.users75PlusStretchers}, ${d.usersMentalHealthTotal}, ${d.usersMentalHealthAmbulatory}, ${d.usersMentalHealthStretchers}, ${d.averageLengthOfStayTotal}, ${d.averageLengthOfStayAmbulatory}, ${d.averageLengthOfStayStretchers}, ${d.usersSeenByDoctorTotal}, ${d.usersSeenByDoctorAmbulatory}, ${d.usersSeenByDoctorStretchers}, ${d.delayUntilSeenTotal}, ${d.delayUntilSeenAmbulatory}, ${d.delayUntilSeenStretchers});`;
	})
	.join('\n')}        
`;
	}
}
const emergencyData = new CumulativeEmergencyData('emergency', RESOURCE_ID);
await emergencyData.run();
