import { DonneesQuebecDataExtractor, type DonneesQuebecResponse } from './DonneesQuebecDataExtractor.ts';
import fs from 'fs';

const DELAY_MAP = {
	'0 à 6 mois': '0_6',
	'6 à 12 mois': '6_12',
	"Plus d'1 an": '12_plus',
};

type WaitlistRecordData = {
	PeriodeAttente: string;
	Region: string;
	year: string;
	delay: string;
	Total: number | null;
	Autres: number | null;
	Chirurgie_generale: number | null;
	Chirurgie_orthopedique: number | null;
	Chirurgie_plastique: number | null;
	Chirurgie_vasculaire: number | null;
	Neurochirurgie: number | null;
	ORL_chirurgie_cervico_faciale: number | null;
	Obstetrique_et_gynecologie: number | null;
	Ophtalmologie: number | null;
	Urologie: number | null;
	[`Delais_d'attente`]: '0 à 6 mois' | '6 à 12 mois' | "Plus d'1 an";
};

type TransformedWaitlistData = {
	region: string;
	year: string;
	delay: string;
	period: string;
	total: number | null;
	other: number | null;
	general: number | null;
	orthopedic: number | null;
	plastic: number | null;
	vascular: number | null;
	neuro: number | null;
	entf: number | null;
	obgyn: number | null;
	opthamology: number | null;
	urology: number | null;
};

class Waitlist extends DonneesQuebecDataExtractor<WaitlistRecordData, Array<TransformedWaitlistData>> {
	transformData(data: Array<WaitlistRecordData>) {
		const d = data.map((d) => {
			const [years, period] = d.PeriodeAttente.split('-');

			return {
				region: d.Region,
				year: `20${years.substring(0, 2)}`,
				delay: DELAY_MAP[d["Delais_d'attente"]],
				period,
				total: d.Total === null ? null : Number(d.Total),
				other: d.Autres === null ? null : Number(d.Autres),
				general: d.Chirurgie_generale === null ? null : Number(d.Chirurgie_generale),
				orthopedic: d.Chirurgie_orthopedique === null ? null : Number(d.Chirurgie_orthopedique),
				plastic: d.Chirurgie_plastique === null ? null : Number(d.Chirurgie_plastique),
				vascular: d.Chirurgie_vasculaire === null ? null : Number(d.Chirurgie_vasculaire),
				neuro: d.Neurochirurgie === null ? null : Number(d.Neurochirurgie),
				entf: d.ORL_chirurgie_cervico_faciale === null ? null : Number(d.ORL_chirurgie_cervico_faciale),
				obgyn: d.Obstetrique_et_gynecologie === null ? null : Number(d.Obstetrique_et_gynecologie),
				opthamology: d.Ophtalmologie === null ? null : Number(d.Ophtalmologie),
				urology: d.Urologie === null ? null : Number(d.Urologie),
			};
		});

		return d;
	}

	generateSql(data: Array<TransformedWaitlistData>) {
		return `
DROP TABLE IF EXISTS waitlist;
CREATE TABLE IF NOT EXISTS waitlist (id INTEGER PRIMARY KEY, region TEXT, year TEXT, period TEXT, delay TEXT, total INTEGER, other INTEGER, general INTEGER, orthopedic INTEGER, plastic INTEGER, vascular INTEGER, neuro INTEGER, entf INTEGER, obgyn INTEGER, opthamology INTEGER, urology INTEGER, FOREIGN KEY (region) REFERENCES regions(code));
${data
	.map((data, index) => {
		return `INSERT INTO waitlist (id, region, year, period, delay, total, other, general, orthopedic, plastic, vascular, neuro, entf, obgyn, opthamology, urology) VALUES (${index}, "${data.region}", "${data.year}", "${data.period}", "${data.delay}", ${data.total}, ${data.other}, ${data.general}, ${data.orthopedic}, ${data.plastic}, ${data.vascular}, ${data.neuro}, ${data.entf}, ${data.obgyn}, ${data.opthamology}, ${data.urology});`;
	})
	.join('\n')}
    `;
	}
}

const waitlist = new Waitlist('waitlist', '7c83f4be-bc3a-4756-86db-115e8ead93f1');
await waitlist.run();
