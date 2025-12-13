// AI Analysis Service for UniLocate
// This service analyzes images and text to find similar lost and found items

interface ImageAnalysisResult {
  colors: string[]
  objects: string[]
  brands: string[]
  condition: string
  estimatedValue: string
  categoryConfidence: number
  textFeatures: string[]
  imageHash: string
  confidenceScore: number
  analysisTimestamp: Date
}

interface MatchAnalysis {
  matchScore: number
  confidence: number
  matchedFeatures: string[]
  reasoning: string
}

// Mock AI analysis service (in a real implementation, you would integrate with OpenAI GPT-4 Vision, Google Vision, or similar)
export class AIAnalysisService {
  
  // Analyze image and text to extract features
  static async analyzeItem(
    imageBase64: string, 
    title: string, 
    description: string, 
    category: string
  ): Promise<ImageAnalysisResult> {
    try {
      // In a real implementation, this would call an AI vision API
      // For now, we'll simulate intelligent analysis based on text and basic image properties
      
      const analysis: ImageAnalysisResult = {
        colors: this.extractColors(description + ' ' + title),
        objects: this.extractObjects(title + ' ' + description),
        brands: this.extractBrands(title + ' ' + description),
        condition: this.estimateCondition(description),
        estimatedValue: this.estimateValue(category, description),
        categoryConfidence: this.calculateCategoryConfidence(category, title, description),
        textFeatures: this.extractTextFeatures(title + ' ' + description),
        imageHash: this.generateImageHash(imageBase64),
        confidenceScore: this.calculateConfidenceScore(imageBase64, title, description),
        analysisTimestamp: new Date()
      }

      return analysis
    } catch (error) {
      console.error('AI Analysis failed:', error)
      throw new Error('Failed to analyze item with AI')
    }
  }

  // Find potential matches between lost and found items
  static async findMatches(
    lostItemAnalysis: ImageAnalysisResult,
    foundItemAnalysis: ImageAnalysisResult,
    lostItemDetails: any,
    foundItemDetails: any
  ): Promise<MatchAnalysis> {
    try {
      const features: string[] = []
      let score = 0
      
      // Color matching (30% weight)
      if (this.hasColorOverlap(lostItemAnalysis.colors, foundItemAnalysis.colors)) {
        score += 30
        features.push('Similar colors')
      }
      
      // Object type matching (25% weight)
      if (this.hasObjectOverlap(lostItemAnalysis.objects, foundItemAnalysis.objects)) {
        score += 25
        features.push('Similar objects')
      }
      
      // Brand matching (20% weight)
      if (this.hasBrandOverlap(lostItemAnalysis.brands, foundItemAnalysis.brands)) {
        score += 20
        features.push('Same brand')
      }
      
      // Category matching (15% weight)
      if (lostItemDetails.category === foundItemDetails.category) {
        score += 15
        features.push('Same category')
      }
      
      // Location proximity (10% weight)
      if (this.isLocationProximate(lostItemDetails.location, foundItemDetails.location)) {
        score += 10
        features.push('Similar location')
      }

      // Confidence calculation
      const confidence = Math.min(100, (score / 100) * (lostItemAnalysis.confidenceScore + foundItemAnalysis.confidenceScore) / 2)
      
      const reasoning = this.generateMatchReasoning(features, score, lostItemDetails, foundItemDetails)
      
      return {
        matchScore: score,
        confidence: Math.round(confidence),
        matchedFeatures: features,
        reasoning
      }
    } catch (error) {
      console.error('Match analysis failed:', error)
      throw new Error('Failed to analyze matches')
    }
  }

  // Helper methods for analysis
  private static extractColors(text: string): string[] {
    const colorKeywords = [
      'black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 
      'brown', 'gray', 'grey', 'silver', 'gold', 'metallic', 'navy', 'maroon',
      'beige', 'cream', 'tan', 'burgundy', 'teal', 'turquoise', 'coral'
    ]
    
    const foundColors: string[] = []
    const lowerText = text.toLowerCase()
    
    colorKeywords.forEach(color => {
      if (lowerText.includes(color)) {
        foundColors.push(color)
      }
    })
    
    return [...new Set(foundColors)] // Remove duplicates
  }

  private static extractObjects(text: string): string[] {
    const objectKeywords = [
      'phone', 'iphone', 'android', 'tablet', 'laptop', 'computer', 'watch',
      'wallet', 'bag', 'backpack', 'purse', 'key', 'keys', 'headphones',
      'charger', 'cable', 'book', 'notebook', 'pen', 'pencil', 'jewelry',
      'ring', 'necklace', 'earrings', 'glasses', 'sunglasses', 'hat',
      'shirt', 'jacket', 'hoodie', 'pants', 'shoes', 'sneakers'
    ]
    
    const foundObjects: string[] = []
    const lowerText = text.toLowerCase()
    
    objectKeywords.forEach(obj => {
      if (lowerText.includes(obj)) {
        foundObjects.push(obj)
      }
    })
    
    return [...new Set(foundObjects)]
  }

  private static extractBrands(text: string): string[] {
    const brandKeywords = [
      'apple', 'iphone', 'samsung', 'google', 'microsoft', 'sony', 'nike',
      'adidas', 'louis vuitton', 'gucci', 'prada', 'coach', 'samsung',
      'dell', 'hp', 'lenovo', 'asus', 'acer', 'canon', 'nikon',
      'rolex', 'casio', 'fossil', 'tissot'
    ]
    
    const foundBrands: string[] = []
    const lowerText = text.toLowerCase()
    
    brandKeywords.forEach(brand => {
      if (lowerText.includes(brand)) {
        foundBrands.push(brand)
      }
    })
    
    return [...new Set(foundBrands)]
  }

  private static estimateCondition(description: string): string {
    const lowerDesc = description.toLowerCase()
    
    if (lowerDesc.includes('new') || lowerDesc.includes('mint') || lowerDesc.includes('perfect')) {
      return 'excellent'
    } else if (lowerDesc.includes('good') || lowerDesc.includes('fine')) {
      return 'good'
    } else if (lowerDesc.includes('fair') || lowerDesc.includes('worn')) {
      return 'fair'
    } else if (lowerDesc.includes('poor') || lowerDesc.includes('damaged')) {
      return 'poor'
    }
    
    return 'unknown'
  }

  private static estimateValue(category: string, description: string): string {
    const lowerDesc = description.toLowerCase()
    
    if (category === 'Electronics') {
      if (lowerDesc.includes('iphone') || lowerDesc.includes('macbook')) {
        return 'high'
      } else if (lowerDesc.includes('phone') || lowerDesc.includes('tablet')) {
        return 'medium'
      }
    } else if (category === 'Jewelry') {
      return 'high'
    } else if (category === 'Bags') {
      if (lowerDesc.includes('luxury') || lowerDesc.includes('designer')) {
        return 'high'
      }
    }
    
    return 'unknown'
  }

  private static calculateCategoryConfidence(category: string, title: string, description: string): number {
    const combined = (title + ' ' + description).toLowerCase()
    
    // Check for category-specific keywords
    const categoryKeywords = {
      'Electronics': ['phone', 'computer', 'laptop', 'tablet', 'device', 'electronic'],
      'Accessories': ['watch', 'bag', 'wallet', 'purse', 'belt'],
      'Clothing': ['shirt', 'pants', 'jacket', 'dress', 'clothing'],
      'Books': ['book', 'notebook', 'textbook', 'magazine'],
      'Bags': ['bag', 'backpack', 'purse', 'luggage'],
      'Jewelry': ['ring', 'necklace', 'earrings', 'bracelet', 'jewelry'],
      'Documents': ['id', 'license', 'passport', 'document', 'paper'],
      'Other': []
    }
    
    const keywords = categoryKeywords[category as keyof typeof categoryKeywords] || []
    const matches = keywords.filter(keyword => combined.includes(keyword)).length
    
    return Math.min(100, (matches / Math.max(keywords.length, 1)) * 100)
  }

  private static extractTextFeatures(text: string): string[] {
    const features: string[] = []
    
    // Extract unique words longer than 3 characters
    const words = text.toLowerCase().split(/\s+/)
    const significantWords = words.filter(word => word.length > 3 && !this.isStopWord(word))
    
    return [...new Set(significantWords)].slice(0, 10) // Limit to 10 features
  }

  private static generateImageHash(imageBase64: string): string {
    // Simple hash based on base64 length and first/last characters
    // In a real implementation, you'd use proper image hashing
    return `${imageBase64.length}-${imageBase64.slice(0, 10)}-${imageBase64.slice(-10)}`
  }

  private static calculateConfidenceScore(imageBase64: string, title: string, description: string): number {
    let score = 50 // Base score
    
    // Boost score for longer descriptions
    if (description.length > 50) score += 20
    if (description.length > 100) score += 15
    
    // Boost score for specific details
    if (/\d/.test(description)) score += 10 // Contains numbers
    if (description.includes('color') || description.includes('brand')) score += 15
    
    // Penalize very short descriptions
    if (description.length < 20) score -= 20
    
    return Math.max(0, Math.min(100, score))
  }

  private static hasColorOverlap(colors1: string[], colors2: string[]): boolean {
    return colors1.some(color => colors2.includes(color))
  }

  private static hasObjectOverlap(objects1: string[], objects2: string[]): boolean {
    return objects1.some(obj => objects2.includes(obj))
  }

  private static hasBrandOverlap(brands1: string[], brands2: string[]): boolean {
    return brands1.some(brand => brands2.includes(brand))
  }

  private static isLocationProximate(location1: string, location2: string): boolean {
    if (!location1 || !location2) return false
    
    const loc1 = location1.toLowerCase()
    const loc2 = location2.toLowerCase()
    
    // Check for building names
    const buildingMatch = this.extractBuildingName(loc1) === this.extractBuildingName(loc2)
    if (buildingMatch) return true
    
    // Check for common areas
    const commonAreas = ['library', 'cafeteria', 'gym', 'parking', 'park', 'hall', 'building']
    return commonAreas.some(area => loc1.includes(area) && loc2.includes(area))
  }

  private static extractBuildingName(location: string): string {
    const buildingMatch = location.match(/building\s*([a-z]|[0-9])/i)
    return buildingMatch ? buildingMatch[0].toLowerCase() : ''
  }

  private static generateMatchReasoning(features: string[], score: number, lostItem: any, foundItem: any): string {
    if (score >= 80) {
      return `Very high confidence match. Found ${features.length} matching features including ${features.slice(0, 2).join(' and ')}.`
    } else if (score >= 60) {
      return `Good match with ${features.length} matching features. Consider reviewing this match.`
    } else if (score >= 40) {
      return `Possible match with some similar features. Manual review recommended.`
    } else {
      return `Low confidence match. ${features.length > 0 ? `Similar features: ${features.join(', ')}` : 'No obvious similarities found.'}`
    }
  }

  private static isStopWord(word: string): boolean {
    const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use']
    return stopWords.includes(word)
  }
}
