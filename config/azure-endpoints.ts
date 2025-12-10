// config/azure-endpoints.ts
import { AZURE_VISION_ENDPOINT, AZURE_VISION_KEY } from '@env';

// Ensure Endpoint contains complete API path
const endpoint = AZURE_VISION_ENDPOINT?.endsWith('/') 
  ? `${AZURE_VISION_ENDPOINT}vision/v3.2/analyze?visualFeatures=Tags,Description`
  : `${AZURE_VISION_ENDPOINT}/vision/v3.2/analyze?visualFeatures=Tags,Description`;

export const azureEndpoints = {
  Endpoint: endpoint,
  Key: AZURE_VISION_KEY
};

