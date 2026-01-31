# Quebec Health Database

## Description

This database uses Cloudflare D1 for storage and a Cloudflare worker for the API.

Data is pulled from the DonneesQuebec API:

- Surgical Waitlist (https://www.donneesquebec.ca/recherche/dataset/chirurgies-portrait-de-la-liste-d-attente)
- Territorial Limits for the regions sociosanitaire (RSS) (https://www.donneesquebec.ca/recherche/dataset/limites-territoriales/resource/9b27d4d3-0a10-491e-ad19-bfcf27179be3)

Future data will include:

- Births (https://www.donneesquebec.ca/recherche/dataset/med-echo-rapport-s15-distribution-accouch-cesar-naiss-vivantes-mortinaiss-par-region-traitement)
- Spending (https://www.donneesquebec.ca/recherche/dataset/contour-financier-depenses-par-programme-et-par-region)
- ... and probably pretty much anything else from https://www.donneesquebec.ca/recherche/organization/msss

Currently, when deployed the only accepted origin is my personal CF worker domain. If you pull this locally, you can make local requests to the local DB. If you want to deploy it to your own CF account, be sure to update the allowed origins in the worker file.

## Local Dev

First you'll want to grab the data from DonneesQuebec. You can do this by running the various `extract-*` scripts.

```shell
npm run extract-waitlist
npm run extract-births
npm run extract-regions
```

These scripts will save the extracted data into `./src/data/extracted` _and_ write a schema file to `./src/schema`

Next, you'll want to populate your local DB:

```shell
npm run create-local-db -- --file=./src/schema/<schema_file>
```

To query the local DB, you can do:

```shell
npm run query-local-db -- --command="<your SQLite command>"
```

ex: `npm run query-local-db -- --command="SELECT * FROM waitlist WHERE region='RSS06' LIMIT 10"`

## Deployment

To populate the remote DB (make sure you've fetched the DonneesQuebec data first and have generated the schema file):

```shell
npm run create-local-db -- --file=./src/schema/<schema_file>
```

To deploy the Worker:

```shell
npm run deploy
```
