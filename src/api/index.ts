import { fromIttyRouter } from 'chanfana';
import { cors, Router, json } from 'itty-router';
import { RegionsEndpoint } from './endpoints/regions';
import { WaitlistEndpoint } from './endpoints/waitlist';
import { SpecialtiesEndpoint } from './endpoints/specialties';
import type { Environment } from './types';

const ALLOWED_ORIGINS = ['https://*.cathryn-griffiths.workers.dev/'];
const ALLOWED_METHODS = ['GET', 'OPTIONS'];

const { preflight, corsify } = cors({
	origin: ALLOWED_ORIGINS.join(','),
	allowMethods: ALLOWED_METHODS.join(','),
});

const router = Router({
	before: [
		preflight,
		(request: Request, env: Environment, ctx: ExecutionContext) => {
			if (!env.IS_LOCAL && !ALLOWED_ORIGINS.includes(request.headers.get('origin') || '')) {
				return new Response(undefined, { status: 403 });
			}

			if (!ALLOWED_METHODS.includes(request.method)) {
				return new Response(undefined, { status: 405 });
			}
		},
	],
	finally: [json, corsify],
});

const openapi = fromIttyRouter(router);

openapi.get('/api/regions', RegionsEndpoint);
openapi.get('/api/waitlist', WaitlistEndpoint);
openapi.get('/api/specialties', SpecialtiesEndpoint);

router.all('*', () => new Response('Not Found.', { status: 404 }));

export default {
	fetch: (req: Request, env: Env, ctx: ExecutionContext) => {
		return router.fetch(req, env, ctx);
	},
};
