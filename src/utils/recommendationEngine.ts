
/**
 * TF-IDF Vectorization and Cosine Similarity Implementation
 * for tender recommendations
 */
import { Tender } from '@/context/TenderContext';

// Term Frequency (TF)
const calculateTF = (term: string, document: string): number => {
  const words = document.toLowerCase().split(/\s+/);
  const termCount = words.filter(word => word === term.toLowerCase()).length;
  return termCount / words.length;
};

// Inverse Document Frequency (IDF)
const calculateIDF = (term: string, documents: string[]): number => {
  const documentCount = documents.length;
  const documentsWithTerm = documents.filter(doc => 
    doc.toLowerCase().includes(term.toLowerCase())
  ).length;
  
  // Add smoothing to avoid division by zero
  return Math.log(documentCount / (1 + documentsWithTerm));
};

// Calculate TF-IDF for a document
const calculateTFIDF = (document: string, allDocuments: string[]): Map<string, number> => {
  const tfidfVector = new Map<string, number>();
  const uniqueTerms = new Set<string>();
  
  allDocuments.forEach(doc => {
    doc.toLowerCase().split(/\s+/).forEach(term => {
      if (term.length > 2) { // Filter out very short terms
        uniqueTerms.add(term);
      }
    });
  });
  
  uniqueTerms.forEach(term => {
    const tf = calculateTF(term, document);
    const idf = calculateIDF(term, allDocuments);
    const tfidf = tf * idf;
    tfidfVector.set(term, tfidf);
  });
  
  return tfidfVector;
};

// Cosine Similarity between two vectors
const cosineSimilarity = (vector1: Map<string, number>, vector2: Map<string, number>): number => {
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  // Calculate dot product
  vector1.forEach((value, key) => {
    if (vector2.has(key)) {
      dotProduct += value * (vector2.get(key) || 0);
    }
    magnitude1 += value * value;
  });
  
  vector2.forEach((value) => {
    magnitude2 += value * value;
  });
  
  // Calculate magnitudes
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  // Calculate cosine similarity
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (magnitude1 * magnitude2);
};

/**
 * Get tender recommendations based on TF-IDF and cosine similarity
 * @param userPreferredTenders List of tenders the user has engaged with
 * @param availableTenders List of all active tenders
 * @param maxResults Maximum number of recommendations to return
 * @returns List of recommended tenders
 */
export const getRecommendations = (
  userPreferredTenders: Tender[],
  availableTenders: Tender[],
  maxResults: number = 3
): Tender[] => {
  if (!userPreferredTenders.length || !availableTenders.length) {
    return [];
  }

  // Create document corpus for all tenders
  const allTenderDocuments = availableTenders.map(tender => 
    `${tender.title} ${tender.description} ${tender.category} ${tender.requirements.join(' ')}`
  );

  // Create user preference profile by combining all preferred tenders
  const userProfile = userPreferredTenders.map(tender => 
    `${tender.title} ${tender.description} ${tender.category} ${tender.requirements.join(' ')}`
  ).join(' ');

  // Calculate TF-IDF vectors
  const userProfileVector = calculateTFIDF(userProfile, allTenderDocuments);
  
  // Calculate similarities and sort tenders
  const tenderSimilarities = availableTenders.map((tender, index) => {
    // Skip tenders the user has already engaged with
    const alreadyPreferred = userPreferredTenders.some(p => p.id === tender.id);
    if (alreadyPreferred) {
      return { tender, similarity: -1 };
    }

    const tenderVector = calculateTFIDF(allTenderDocuments[index], allTenderDocuments);
    const similarity = cosineSimilarity(userProfileVector, tenderVector);
    
    return { tender, similarity };
  });

  // Sort by similarity (descending) and filter out negative similarities
  return tenderSimilarities
    .filter(item => item.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxResults)
    .map(item => item.tender);
};
