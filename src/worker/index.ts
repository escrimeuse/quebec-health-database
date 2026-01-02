export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/regions") {
      const { results } = await env.health_db
        .prepare("SELECT * FROM Regions")
        .run();
      return Response.json(results);
    }

	if (pathname === '/api/surgical_specialties') {
		const {results} = await env.health_db.prepare("SELECT * FROM SurgicalSpecialties").run();
		return Response.json(results);
	}

    return new Response(
      "See https://github.com/escrimeuse/quebec-health-database",
    );
  },
};