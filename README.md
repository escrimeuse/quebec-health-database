# Quebec Health Database

## Description

This database uses Cloudflare D1 for storage and a Cloudflare worker for the API.

Data is pulled from the DonneesQuebec API for the Surgical Waitlist (https://www.donneesquebec.ca/recherche/dataset/chirurgies-portrait-de-la-liste-d-attente). In the future, this DB will also include other health data.

Currently, when deployed the only accepted origin is my personal CF worker domain. If you pull this locally, you can make local requests to the local DB. If you want to deploy it to your own CF account, be sure to update the allowed origins in the worker file.

## Local Dev

First you'll want to grab the data from DonneesQuebec:

```shell
npm run fetch-data
```

This command will grab the data and write it to a local file `src/data/autogen/waitlist.json`.

Next, you'll need to generate the DB schema file:

```shell
npm run autogen-schema
```

Next, you'll want to populate your local DB:

```shell
npm run create-local-db
```

To query the local DB, you can do:

```shell
npx wrangler execute health-db --local --command="<your SQLite command>"
```

ex: `npx wrangler d1 execute health-db --local --command="SELECT * FROM Waitlist WHERE region_id=6 AND delay='12_plus' LIMIT 10"`

## Deployment

To populate the remote DB (make sure you've fetched the DonneesQuebec data first and have generated the schema file):

```shell
npm run create-remote-db
```

To deploy the Worker:

```shell
npm run deploy
```
