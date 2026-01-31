import { contentJson, OpenAPIRoute } from 'chanfana';
import { z } from 'zod';

export class WaitlistEndpoint extends OpenAPIRoute {
	schema = {
		request: {
			query: z.object({
				delay: z.enum(['0_6', '6_12', '12_plus']).default('0_6'),
				region: z
					.enum([
						'RSS01',
						'RSS02',
						'RSS03',
						'RSS04',
						'RSS05',
						'RSS06',
						'RSS07',
						'RSS08',
						'RSS09',
						'RSS10',
						'RSS11',
						'RSS12',
						'RSS13',
						'RSS14',
						'RSS15',
						'RSS16',
						'RSS17',
						'RSS18',
					])
					.default('RSS06'),
			}),
		},
		responses: {
			200: {
				description: 'Waitlist data',
				...contentJson(
					z.object({
						region: z.string(),
						year: z.string(),
						delay: z.enum(['0_6', '6_12', '12_plus']),
						period: z.string().nullable(),
						total: z.number().nullable(),
						other: z.number().nullable(),
						general: z.number().nullable(),
						orthopedic: z.number().nullable(),
						plastic: z.number().nullable(),
						vascular: z.number().nullable(),
						neuro: z.number().nullable(),
						entf: z.number().nullable(),
						obgyn: z.number().nullable(),
						opthamology: z.number().nullable(),
						urology: z.number().nullable(),
					})
				),
			},
		},
	};

	async handle(request: Request, env, ctx) {
		const req = await this.getValidatedData<typeof this.schema>();
		const { delay, region } = req.query;

		const { results } = await env.health_db.prepare('SELECT * FROM waitlist WHERE delay = ? AND REGION = ?').bind(delay, region).run();
		return results;
	}
}
