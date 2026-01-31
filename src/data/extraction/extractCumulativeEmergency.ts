import { CumulativeEmergency, RESOURCE_ID } from './classes/CumulativeEmergency.ts';

const emergencyData = new CumulativeEmergency('emergency', RESOURCE_ID);
await emergencyData.run();
