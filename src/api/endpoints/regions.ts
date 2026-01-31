import { contentJson, OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Environment } from '../types';

export class RegionsEndpoint extends OpenAPIRoute {
	schema = {
		responses: {
			200: {
				description: 'A list of the region sociosanitaire in Quebec',
				...contentJson(
					z.array(
						z.object({
							code: z.string(),
							name: z.string(),
						}),
					),
				),
			},
		},
	};

	async handle(request: Request, env: Environment, ctx: ExecutionContext) {
		const { results } = await env.health_db.prepare('SELECT * FROM regions').run();

		return results;
	}
}
