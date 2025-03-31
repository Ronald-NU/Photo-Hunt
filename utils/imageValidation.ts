import * as FileSystem from 'expo-file-system';
import * as rs from 'jsrsasign';

// 导入服务账号凭据
const serviceAccountCredentials = require('../config/service-account.json');

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

    // 使用服务账号凭据构建认证头
    const authHeader = await generateAuthHeader(serviceAccountCredentials);
    
    const apiUrl = 'https://vision.googleapis.com/v1/images:annotate';
    console.log('Calling Vision API...');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authHeader}`,
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

// 生成 Google Cloud 认证头
async function generateAuthHeader(credentials: any) {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600; // 1 hour from now

  const jwtHeader = {
    alg: 'RS256',
    typ: 'JWT',
    kid: credentials.private_key_id
  };

  const jwtClaimSet = {
    iss: credentials.client_email,
    sub: credentials.client_email,
    aud: 'https://vision.googleapis.com/',
    iat: now,
    exp: expiry
  };

  // Base64Url encode header and claim set
  const encodedHeader = btoa(JSON.stringify(jwtHeader))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
    
  const encodedClaimSet = btoa(JSON.stringify(jwtClaimSet))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Create signature input
  const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

  // Sign using RS256
  const signature = await signWithPrivateKey(credentials.private_key, signatureInput);

  // Combine to form JWT
  return `${signatureInput}.${signature}`;
}

// 使用私钥签名
async function signWithPrivateKey(privateKey: string, input: string): Promise<string> {
  try {
    // 创建签名对象
    const sig = new rs.KJUR.crypto.Signature({ "alg": "SHA256withRSA" });
    
    // 初始化私钥
    sig.init(privateKey);
    
    // 更新要签名的数据
    sig.updateString(input);
    
    // 生成签名
    const signatureBytes = sig.sign();
    
    // 转换为 Base64URL 格式
    return rs.hextob64u(signatureBytes);
  } catch (error) {
    console.error('Error signing with private key:', error);
    throw error;
  }
} 