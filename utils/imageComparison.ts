import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImageManipulator from 'expo-image-manipulator';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

interface ImageFeatures {
  averageColor: string;
  aspectRatio: number;
  brightness: number;
}

interface ComparisonResult {
  isSimilar: boolean;
  similarity: number;
  reason?: string;
}

/**
 * 提取图片的基本特征
 */
async function extractImageFeatures(uri: string): Promise<ImageFeatures | null> {
  try {
    // 检查是否是 Firebase Storage URL
    let finalUri = uri;
    if (uri.startsWith('gs://') || uri.includes('firebasestorage.googleapis.com')) {
      try {
        const storage = getStorage();
        const storageRef = ref(storage, uri);
        finalUri = await getDownloadURL(storageRef);
      } catch (error) {
        console.error('Error getting download URL:', error);
        return null;
      }
    }

    // 首先将图片调整到统一大小以加快处理速度
    const resizedImage = await manipulateAsync(
      finalUri,
      [{ resize: { width: 300 } }],
      { format: SaveFormat.JPEG }
    );

    // 使用 ImageManipulator 获取图片信息
    const imageInfo = await ImageManipulator.manipulateAsync(
      resizedImage.uri,
      [],
      { format: SaveFormat.JPEG, base64: true }
    );

    if (!imageInfo.base64) return null;

    // 使用 base64 字符串计算平均颜色和亮度
    const base64Data = imageInfo.base64;
    let r = 0, g = 0, b = 0;
    let pixelCount = 0;

    // 每4个字符代表3个字节 (base64编码)
    for (let i = 0; i < base64Data.length; i += 4) {
      // 解码base64字符
      const char1 = base64Data.charCodeAt(i);
      const char2 = base64Data.charCodeAt(i + 1);
      const char3 = base64Data.charCodeAt(i + 2);
      const char4 = base64Data.charCodeAt(i + 3);

      // 将base64字符转换为原始字节
      const byte1 = ((char1 & 0xFF) << 2) | ((char2 & 0x30) >> 4);
      const byte2 = ((char2 & 0x0F) << 4) | ((char3 & 0x3C) >> 2);
      const byte3 = ((char3 & 0x03) << 6) | (char4 & 0x3F);

      r += byte1;
      g += byte2;
      b += byte3;
      pixelCount++;
    }

    if (pixelCount === 0) return null;

    r = Math.round(r / pixelCount);
    g = Math.round(g / pixelCount);
    b = Math.round(b / pixelCount);

    // 计算亮度
    const brightness = (r + g + b) / (3 * 255);

    return {
      averageColor: `rgb(${r},${g},${b})`,
      aspectRatio: imageInfo.width / imageInfo.height,
      brightness: brightness
    };

  } catch (error) {
    console.error('Error extracting image features:', error);
    return null;
  }
}

/**
 * 计算两个颜色值之间的差异
 */
function getColorDifference(color1: string, color2: string): number {
  const rgb1 = color1.match(/\d+/g)?.map(Number) || [0, 0, 0];
  const rgb2 = color2.match(/\d+/g)?.map(Number) || [0, 0, 0];

  const rDiff = Math.abs(rgb1[0] - rgb2[0]);
  const gDiff = Math.abs(rgb1[1] - rgb2[1]);
  const bDiff = Math.abs(rgb1[2] - rgb2[2]);

  return (rDiff + gDiff + bDiff) / (3 * 255);
}

/**
 * 计算两张图片的相似度
 */
function calculateSimilarity(features1: ImageFeatures, features2: ImageFeatures): number {
  // 颜色差异权重：0.4
  const colorDiff = getColorDifference(features1.averageColor, features2.averageColor);
  const colorScore = 1 - colorDiff;

  // 宽高比差异权重：0.3
  const aspectRatioDiff = Math.abs(features1.aspectRatio - features2.aspectRatio);
  const aspectRatioScore = 1 - Math.min(aspectRatioDiff, 1);

  // 亮度差异权重：0.3
  const brightnessDiff = Math.abs(features1.brightness - features2.brightness);
  const brightnessScore = 1 - brightnessDiff;

  // 计算加权平均
  return colorScore * 0.4 + aspectRatioScore * 0.3 + brightnessScore * 0.3;
}

/**
 * 比较两张图片的相似度
 */
export async function compareImages(originalUri: string, capturedUri: string): Promise<ComparisonResult> {
  try {
    // 提取两张图片的特征
    const originalFeatures = await extractImageFeatures(originalUri);
    const capturedFeatures = await extractImageFeatures(capturedUri);

    if (!originalFeatures || !capturedFeatures) {
      return {
        isSimilar: false,
        similarity: 0,
        reason: 'Failed to extract image features'
      };
    }

    // 计算相似度
    const similarity = calculateSimilarity(originalFeatures, capturedFeatures);

    // 设定相似度阈值
    const SIMILARITY_THRESHOLD = 0.7;

    return {
      isSimilar: similarity >= SIMILARITY_THRESHOLD,
      similarity,
      reason: similarity >= SIMILARITY_THRESHOLD 
        ? undefined 
        : 'The captured image appears to be different from the original puzzle image'
    };

  } catch (error) {
    console.error('Error comparing images:', error);
    return {
      isSimilar: false,
      similarity: 0,
      reason: 'Error occurred while comparing images'
    };
  }
} 