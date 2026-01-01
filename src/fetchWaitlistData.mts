import fs from 'fs';

const DELAY_MAP = {
    '0 à 6 mois': '0_6',
    '6 à 12 mois': '6_12',
    'Plus d\'1 an': '12_plus'
};

async function getData() {
    const response = await fetch('https://www.donneesquebec.ca/recherche/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20%227c83f4be-bc3a-4756-86db-115e8ead93f1%22')

    const data = await response.json();

    return data.result.records;
}

function transformData(data: any) {
    return data.map((d) => {
        const [years, period] = d.PeriodeAttente.split('-')
        
        return {
            region: Number(d.Region.substring(3)),
            year: `20${years.substr(0, 2)}`,
            delay: DELAY_MAP[d['Delais_d\'attente']],
            period,
            total: d.Total,
            other: d.Autres,
            general: d.Chirurgie_generale,
            orthopedic: d.Chirurgie_orthopedique,
            plastic: d.Chirurgie_plastique,
            vascular: d.Chirurgie_vasculaire,
            neuro: d.Neurochirurgie,
            entf: d.ORL_chirurgie_cervico_faciale,
            obgyn: d.Obstetrique_et_gynecologie,
            opthamology: d.Ophtalmologie,
            urology: d.Urologie,
        }
    })
} 


async function fetchData() {
    console.log("Fetching data from DonneesQuebec ... ")
    const data = await getData()

    console.log("Transforming data ...")
    const transformedData = transformData(data);

    try {
        console.log("Writing to file healthData.json ...")
        fs.writeFileSync('healthData.json', JSON.stringify(transformedData))
        console.log("Success!")
    } catch (error) {
        console.log("Error: ", error)
    }
}

fetchData();