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
