import { contentJson, OpenAPIRoute } from 'chanfana';
import { z } from 'zod';

export class SpecialtiesEndpoint extends OpenAPIRoute {
	schema = {
		responses: {
			200: {
				description: 'Specialties data',
				...contentJson(
					z.object({
						id: z.enum(['general', 'orthopedic', 'plastic', 'vascular', 'neuro', 'obgyn', 'entf', 'urology', 'other']),
						name: z.string(),
					})
				),
			},
		},
	};

	async handle(request: Request, env, ctx) {
		const { results } = await env.health_db.prepare('SELECT * FROM specialties').run();
		return results;
	}
}
