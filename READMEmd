# Quebec Health Database

## Description

This database uses Cloudflare D1 for storage and a Cloudflare worker for the API. 

Data is pulled from the DonneesQuebec API for the Surgical Waitlist (https://www.donneesquebec.ca/recherche/dataset/chirurgies-portrait-de-la-liste-d-attente). In the future, this DB will also include other health data.

## Local Dev

First you'll want to grab the data from DonneesQuebec: 

```shell
npm run fetch-data
```

This command will grab the data and write it to a local file `healthData.json`.

Next, you'll need to general the DB schema file:

```shell
npm run autogen-schema
```

Next, you'll want to populate your local DB:

```shell
npm run create-db:local
```

To query the local DB, you can do:

```shell
npx wrangler execute health-db --local --command="<your SQLite command>"
```

ex: `npx wrangler d1 execute health-db --local --command="SELECT * FROM Waitlist WHERE region_id=6 AND delay='12_plus' LIMIT 10"`

## Deployment

To populate the remote DB:

```shell
npm run create-db:remote
```

To deploy the Worker:

```shell
npm run deploy
```
