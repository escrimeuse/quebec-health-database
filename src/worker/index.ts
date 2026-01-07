import { fromIttyRouter } from 'chanfana';
import { Router } from 'itty-router';
import { RegionsEndpoint } from '../api/regions';
import { WaitlistEndpoint } from '../api/waitlist';
import { SpecialtiesEndpoint } from '../api/specialties';

const ALLOWED_ORIGINS = ['https://*.cathryn-griffiths.workers.dev/'];
const ALLOWED_METHODS = ['GET', 'OPTIONS'];

const router = Router({
	base: '/api',
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
