const ALLOWED_ORIGINS = ['https://*.cathryn-griffiths.workers.dev/']
const ALLOWED_METHODS = ['GET', 'OPTIONS']

const HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.join(', '),
  'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (!env.IS_LOCAL && !ALLOWED_ORIGINS.includes(request.headers.origin)) {
      return new Response(undefined, {status: 403})
    }

    if (!ALLOWED_METHODS.includes(request.method)) {
      return new Response(undefined, {status: 405})
    }

    if (pathname === "/api/regions") {
      const { results } = await env.health_db
        .prepare("SELECT * FROM regions")
        .run();

      return new Response(results, {headers: HEADERS});
    }

	if (pathname === '/api/surgical_specialties') {
		const {results} = await env.health_db.prepare("SELECT * FROM specialties").run();
		return new Response(results, {headers: HEADERS});
	}

    return new Response(
      "See https://github.com/escrimeuse/quebec-health-database",
      { headers: HEADERS }
    );
  },
};