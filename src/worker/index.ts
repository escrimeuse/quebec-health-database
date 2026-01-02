const ALLOWED_ORIGINS = ['https://*.cathryn-griffiths.workers.dev/']
const ALLOWED_METHODS = ['GET', 'OPTIONS']

const HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.join(', '),
  'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
}

export default {
  async fetch(request, env) {
    console.log("request", request)
    if (!env.IS_LOCAL && !ALLOWED_ORIGINS.includes(request.headers.origin)) {
      return new Response(undefined, {status: 403})
    }

    if (!ALLOWED_METHODS.includes(request.method)) {
      return new Response(undefined, {status: 405})
    }

    const url = new URL(request.url);
    const {pathname, searchParams} = url;
    console.log("searchParams", searchParams.get('region'))
    /** Returns the region information (id and name) */
    if (pathname === "/api/regions") {
      const { results } = await env.health_db
        .prepare("SELECT * FROM regions")
        .run();

      return Response.json(results, {headers: HEADERS})
    }

    /** Returns the surgical specialty information (id and name) */
    if (pathname === '/api/specialties') {
      const {results} = await env.health_db.prepare("SELECT * FROM specialties").run();
      return Response.json(results, {headers: HEADERS});
    }

    /** Returns waitlist information */
    if (pathname === '/api/waitlist') {
      const {results} = await env.health_db.prepare("SELECT * FROM waitlist WHERE region = ? LIMIT 10").bind(searchParams.get('region') ?? '*').run();
      return Response.json(results, {headers: HEADERS});
    }

    return new Response(
      "See https://github.com/escrimeuse/quebec-health-database",
      { headers: HEADERS }
    );
  },
};