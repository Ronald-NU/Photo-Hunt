import * as FileSystem from 'expo-file-system';
import { googleCloudApiKey } from '@/config/google-cloud-api-key';

interface VisionLabel {
  description: string;
  score: number;
  topicality: number;
}

interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

export async function validateImage(uri: string): Promise<ValidationResult> {
  try {
    console.log('Starting image validation for URI:', uri);

    // Check if URI exists
    if (!uri) {
      return {
        isValid: false,
        reason: 'No image provided'
      };
    }

    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      return {
        isValid: false,
        reason: 'Image file not found'
      };
    }

    console.log('Reading file as base64...');
    // Convert image to base64
    const base64Image = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (!base64Image) {
      return {
        isValid: false,
        reason: 'Failed to read image'
      };
    }

    console.log('Base64 image length:', base64Image.length);
    
    // Prepare request body
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            {
              type: "LABEL_DETECTION",
              maxResults: 10
            },
            {
              type: "FACE_DETECTION",
              maxResults: 1
            },
            {
              type: "LANDMARK_DETECTION",
              maxResults: 5
            }
          ]
        }
      ]
    };

    // 使用 API key 进行认证
    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${googleCloudApiKey}`;
    console.log('Calling Vision API...');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('API Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return {
        isValid: false,
        reason: 'Failed to validate image. Please try again.'
      };
    }

    const data = await response.json();
    
    // Check for faces
    const faces = data.responses[0]?.faceAnnotations || [];
    if (faces.length > 0) {
      return {
        isValid: false,
        reason: 'Please avoid taking photos with faces.'
      };
    }

    // Check for landmarks
    const landmarks = data.responses[0]?.landmarkAnnotations || [];
    const labels = data.responses[0]?.labelAnnotations || [];
    console.log('Detected labels:', labels);
    console.log('Detected landmarks:', landmarks);

    // Check for required elements (landmarks, buildings, or places)
    const requiredLabels = ['Building', 'Architecture', 'Landmark', 'Structure', 'Place'];
    const hasRequiredLabel = labels.some((label: { description: string }) => 
      requiredLabels.some(required => 
        label.description.toLowerCase().includes(required.toLowerCase())
      )
    );

    if (!hasRequiredLabel && landmarks.length === 0) {
      return {
        isValid: false,
        reason: 'Please take a photo of a building, landmark, or interesting place.'
      };
    }

    return { isValid: true };

  } catch (error) {
    console.error('Error validating image:', error);
    console.error('Error stack:', (error as Error).stack);
    return {
      isValid: false,
      reason: 'Error validating image. Please try again.'
    };
  }
}
