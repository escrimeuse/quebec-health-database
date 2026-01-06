const ALLOWED_ORIGINS = ['https://*.cathryn-griffiths.workers.dev/']
const ALLOWED_METHODS = ['GET', 'OPTIONS']

function getHeaders(isLocal: boolean) {
  if (isLocal) {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
    }
  } 

  return {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.join(', '),
  'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
}
}

export default {
  async fetch(request, env) {
    console.log("env", env)
    if (!env.IS_LOCAL && !ALLOWED_ORIGINS.includes(request.headers.origin)) {
      return new Response(undefined, {status: 403})
    }

    if (!ALLOWED_METHODS.includes(request.method)) {
      return new Response(undefined, {status: 405})
    }

    const url = new URL(request.url);
    const {pathname, searchParams} = url;
    const headers = getHeaders(env.IS_LOCAL)

    /** Returns the region information (id and name) */
    if (pathname === "/api/regions") {
      const { results } = await env.health_db
        .prepare("SELECT * FROM regions")
        .run();

      return Response.json(results, {headers})
    }

    /** Returns the surgical specialty information (id and name) */
    if (pathname === '/api/specialties') {
      const {results} = await env.health_db.prepare("SELECT * FROM specialties").run();
      return Response.json(results, {headers});
    }

    /** Returns waitlist information */
    if (pathname === '/api/waitlist') {
      const fieldDefaults = {
        delay: '0_6',
        region: 'RSS06'
      }

      const {results} = await env.health_db.prepare("SELECT * FROM waitlist WHERE delay = ? AND REGION = ?").bind(searchParams.get('delay') ?? fieldDefaults.delay, searchParams.get('region') ?? fieldDefaults.region).run();
      return Response.json(results, {headers});
    }

    return new Response(
      "See https://github.com/escrimeuse/quebec-health-database",
      { headers }
    );
  },
};