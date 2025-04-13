import { azureEndpoints } from "@/config/azure-endpoints";

const analyzeImage = async (imageUrl: string) => {
    const response = await fetch(
      azureEndpoints.Endpoint,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': azureEndpoints.Key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: imageUrl }),
      }
    );
  
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Azure error: ${response.status} - ${errText}`);
    }
  
    return response.json();
  };
  
  const compareTags = (tags1: string[], tags2: string[]) => {
    const common = tags1.filter(tag => tags2.includes(tag));
    const score = (common.length / Math.max(tags1.length, tags2.length)) * 100;
    return { score: score.toFixed(2), common };
  };
  
  export const compareImagesAzure = async (image1: string, image2: string) => {
    var results;
            if (!image1 || !image2) return;
            try {
          console.log('Comparing images:', image1, image2);
              
              const [data1, data2] = await Promise.all([
                analyzeImage(image1),
                analyzeImage(image2),
              ]);
            console.log('Image 1 tags:', data1.tags);
            console.log('Image 2 tags:', data2.tags);
          
              const tags1 = data1.tags.map((tag: any) => tag.name);
              const tags2 = data2.tags.map((tag: any) => tag.name);
          
              const { score, common } = compareTags(tags1, tags2);
          
              results = ({ score, common });
            } catch (err) {
              console.error('Error comparing images:', err);
            } finally {
                return results;
            }
}