import { fromIttyRouter } from 'chanfana';
import { cors, Router, json } from 'itty-router';
import { RegionsEndpoint } from '../api/regions';
import { WaitlistEndpoint } from '../api/waitlist';
import { SpecialtiesEndpoint } from '../api/specialties';

const ALLOWED_ORIGINS = ['https://*.cathryn-griffiths.workers.dev/'];
const ALLOWED_METHODS = ['GET', 'OPTIONS'];

const router = Router({
	before: [
		(request, env) => {
			if (!env.IS_LOCAL && !ALLOWED_ORIGINS.includes(request.headers.origin)) {
				return new Response(undefined, { status: 403 });
			}

			if (!ALLOWED_METHODS.includes(request.method)) {
				return new Response(undefined, { status: 405 });
			}
		},
	],
	base: '/api',
	finally: [json],
});

const openapi = fromIttyRouter(router);

openapi.get('/regions', RegionsEndpoint);
openapi.get('/waitlist', WaitlistEndpoint);
openapi.get('/specialties', SpecialtiesEndpoint);

router.all('*', () => new Response('Not Found.', { status: 404 }));

export default {
	fetch: (req, env, ctx) => {
		return router.fetch(req, env, ctx);
	},
};
