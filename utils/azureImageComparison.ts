import { azureEndpoints } from "../config/azure-endpoints";

/**
 * Analyzes a single image using Azure Computer Vision API
 * 
 * HOW AI WORKS:
 * This function sends an image URL to Azure's Computer Vision API, which uses
 * deep learning models to analyze the image content. The AI model:
 * 1. Processes the image through convolutional neural networks (CNNs)
 * 2. Extracts visual features and patterns
 * 3. Generates descriptive tags that represent the image content
 * 4. Returns structured data with confidence scores
 * 
 * The AI has been trained on millions of images to recognize:
 * - Objects (buildings, vehicles, animals, etc.)
 * - Scenes (outdoor, indoor, landscape, etc.)
 * - Activities and concepts
 * - Visual characteristics (colors, textures, etc.)
 * 
 * @param imageUrl - The URL of the image to analyze (must be publicly accessible)
 * @returns Promise resolving to Azure Vision API response containing tags and descriptions
 * @throws Error if API request fails (network error, invalid key, etc.)
 * 
 * Example response structure:
 * {
 *   tags: [
 *     { name: "building", confidence: 0.99 },
 *     { name: "outdoor", confidence: 0.95 },
 *     { name: "architecture", confidence: 0.92 }
 *   ],
 *   description: { tags: ["building", "outdoor", ...], captions: [...] }
 * }
 */
const analyzeImage = async (imageUrl: string) => {
    // Make HTTP POST request to Azure Computer Vision API
    // The API endpoint is configured in azure-endpoints.ts
    const response = await fetch(
      azureEndpoints.Endpoint,
      {
        method: 'POST',
        headers: {
          // Azure requires subscription key for authentication
          'Ocp-Apim-Subscription-Key': azureEndpoints.Key,
          'Content-Type': 'application/json',
        },
        // Send image URL in request body (Azure fetches the image from URL)
        // This is more efficient than sending base64 for large images
        body: JSON.stringify({ url: imageUrl }),
      }
    );
  
    // Handle API errors (network issues, invalid credentials, rate limits, etc.)
    if (!response.ok) {
      const errText = await response.text();
      
      // Parse error response to provide more specific error messages
      try {
        const errorData = JSON.parse(errText);
        const errorCode = errorData.error?.innererror?.code || errorData.error?.code;
        const errorMessage = errorData.error?.message || errorData.error?.innererror?.message;
        
        // Handle specific error cases
        if (errorCode === 'InvalidImageSize' || errorMessage?.includes('too large')) {
          throw new Error(
            `Image size exceeds Azure Vision API limit (4MB). ` +
            `Please ensure images are compressed before upload. ` +
            `Original error: ${errorMessage || 'Image too large'}`
          );
        }
        
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            `Azure Vision API authentication failed. ` +
            `Please check your API key and endpoint configuration.`
          );
        }
        
        if (response.status === 429) {
          throw new Error(
            `Azure Vision API rate limit exceeded. ` +
            `Please wait a moment and try again.`
          );
        }
        
        // Generic error with parsed message
        throw new Error(`Azure Vision API error: ${errorMessage || errText}`);
      } catch (parseError) {
        // If we can't parse the error, use the original error text
        throw new Error(`Azure error: ${response.status} - ${errText}`);
      }
    }
  
    // Parse and return JSON response containing AI analysis results
    return response.json();
  };
  
  /**
   * Calculates similarity score between two images based on their AI-generated tags
   * 
   * HOW THE SIMILARITY ALGORITHM WORKS:
   * This implements a tag-based similarity algorithm:
   * 
   * 1. Find common tags: Tags that appear in both images
   *    - Example: Image1 has ["building", "outdoor", "sky"]
   *              Image2 has ["building", "outdoor", "tree"]
   *    - Common tags: ["building", "outdoor"]
   * 
   * 2. Calculate similarity ratio:
   *    Formula: (common_tags_count / max(total_tags1, total_tags2)) × 100
   *    
   *    This formula ensures:
   *    - Score is normalized (0-100 range)
   *    - Accounts for images with different numbers of tags
   *    - Higher score = more similar images
   * 
   * 3. Why this works:
   *    - AI tags represent semantic content of images
   *    - If two images share many tags, they likely show similar content
   *    - The algorithm is robust to minor differences (lighting, angle, etc.)
   *      because it focuses on high-level concepts rather than pixel-level comparison
   * 
   * @param tags1 - Array of tag names from first image (from Azure AI analysis)
   * @param tags2 - Array of tag names from second image (from Azure AI analysis)
   * @returns Object containing:
   *   - score: Similarity percentage (0-100, formatted to 2 decimal places)
   *   - common: Array of tags that appear in both images
   * 
   * Example:
   *   tags1 = ["building", "outdoor", "sky", "architecture"]
   *   tags2 = ["building", "outdoor", "tree", "landscape"]
   *   Result: { score: "50.00", common: ["building", "outdoor"] }
   *   (2 common tags / 4 max tags = 50%)
   */
  const compareTags = (tags1: string[], tags2: string[]) => {
    // Find tags that exist in both arrays (intersection)
    const common = tags1.filter(tag => tags2.includes(tag));
    
    // Calculate similarity score as percentage
    // Using max() ensures we normalize by the image with more tags,
    // preventing bias toward images with fewer tags
    const score = (common.length / Math.max(tags1.length, tags2.length)) * 100;
    
    return { score: score.toFixed(2), common };
  };
  
  /**
   * Main function: Compares two images using Azure Computer Vision AI
   * 
   * HOW THE COMPLETE AI WORKFLOW WORKS:
   * 
   * Step 1: Parallel AI Analysis (Performance Optimization)
   *   - Both images are sent to Azure Vision API simultaneously using Promise.all
   *   - This reduces total processing time from ~4 seconds to ~2 seconds
   *   - Each API call uses Azure's AI models to analyze image content
   * 
   * Step 2: AI Tag Extraction
   *   - Azure's AI models analyze each image independently
   *   - Deep learning networks identify objects, scenes, and concepts
   *   - Returns structured tags with confidence scores
   *   - Example tags: ["building", "outdoor", "architecture", "landmark"]
   * 
   * Step 3: Tag Comparison Algorithm
   *   - Extract tag names from both AI responses
   *   - Find common tags between the two images
   *   - Calculate similarity score based on tag overlap
   * 
   * Step 4: Result Interpretation
   *   - Score range: 0-100 (percentage)
   *   - Higher score = more similar images
   *   - Typical threshold: 64% (configurable in calling code)
   *   - Returns both score and common tags for transparency
   * 
   * WHY THIS APPROACH WORKS:
   * 1. Semantic Understanding: AI understands image content, not just pixels
   * 2. Robust to Variations: Works even if images differ in:
   *    - Lighting conditions
   *    - Camera angle
   *    - Weather/time of day
   *    - Minor occlusions
   * 3. Fast Processing: Parallel API calls + efficient tag comparison
   * 4. Interpretable: Returns common tags so users understand why images match
   * 
   * @param image1 - URL of the first image (original puzzle image)
   * @param image2 - URL of the second image (user's verification photo)
   * @returns Promise resolving to comparison result object:
   *   {
   *     score: string,      // Similarity percentage "0.00" to "100.00"
   *     common: string[]      // Array of tags present in both images
   *   }
   *   Returns undefined if inputs are invalid or API call fails
   * 
   * Usage Example:
   *   const result = await compareImagesAzure(originalUrl, userPhotoUrl);
   *   if (result && parseFloat(result.score) >= 64) {
   *     console.log("Images match! Common tags:", result.common);
   *   }
   */
  export const compareImagesAzure = async (image1: string, image2: string) => {
    var results;
    
    // Input validation: Both images must be provided
    if (!image1 || !image2) return;
    
    try {
      console.log('Comparing images:', image1, image2);
      
      /**
       * PARALLEL PROCESSING - Key Performance Optimization
       * 
       * Promise.all executes both API calls simultaneously instead of sequentially.
       * This cuts total processing time in half:
       * - Sequential: analyzeImage1 (2s) + analyzeImage2 (2s) = 4s total
       * - Parallel: max(analyzeImage1, analyzeImage2) = 2s total
       * 
       * Both images are analyzed by Azure's AI models at the same time.
       */
      const [data1, data2] = await Promise.all([
        analyzeImage(image1),  // AI analyzes first image
        analyzeImage(image2),  // AI analyzes second image (simultaneously)
      ]);
      
      // Log AI-generated tags for debugging
      console.log('Image 1 tags:', data1.tags);
      console.log('Image 2 tags:', data2.tags);
    
      /**
       * Extract tag names from AI responses
       * Azure returns tags as objects with properties like:
       * { name: "building", confidence: 0.99 }
       * We only need the names for comparison
       */
      const tags1 = data1.tags.map((tag: any) => tag.name);
      const tags2 = data2.tags.map((tag: any) => tag.name);
    
      /**
       * Calculate similarity using tag-based algorithm
       * This compares the semantic content of images based on AI understanding
       */
      const { score, common } = compareTags(tags1, tags2);
    
      // Return results with similarity score and common tags
      results = ({ score, common });
      
    } catch (err) {
      // Handle errors gracefully (network issues, API failures, etc.)
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error comparing images:', errorMessage);
      
      // Log specific error types for debugging
      if (errorMessage.includes('too large') || errorMessage.includes('InvalidImageSize')) {
        console.error('⚠️ Image size issue detected. Images should be compressed to < 4MB before upload.');
        console.error('💡 Consider resizing images before uploading to Firebase Storage.');
      }
      
      // Returns undefined, allowing caller to handle error appropriately
      // Caller should check for undefined and show user-friendly error message
    } finally {
      // Always return results (or undefined if error occurred)
      return results;
    }
}