import { SHOP_PRODUCTS, ShopProduct } from './shop-data';

export type ProductRecommendation = {
  product: ShopProduct;
  matchedKeywords: string[];
  reason: string;
  confidence: 'high' | 'medium';
  score: number;
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function recommendProductsFromMessage(
  message: string,
): ProductRecommendation[] {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return [];
  }

  const matches = SHOP_PRODUCTS.map(product => {
    const matchedKeywords = product.aiKeywords.filter(keyword =>
      normalizedMessage.includes(normalizeText(keyword)),
    );

    if (matchedKeywords.length === 0) {
      return null;
    }

    const longestMatch = [...matchedKeywords].sort(
      (a, b) => b.length - a.length,
    )[0];

    const hasSpecificPhrase = matchedKeywords.some(keyword =>
      keyword.trim().includes(' '),
    );

    const score =
      matchedKeywords.length * 10 +
      longestMatch.length +
      (product.recommended ? 3 : 0);

    return {
      product,
      matchedKeywords,
      reason: `Matched "${longestMatch}" from the conversation.`,
      confidence:
        hasSpecificPhrase || matchedKeywords.length >= 2
          ? ('high' as const)
          : ('medium' as const),
      score,
    };
  })
    .filter((item): item is ProductRecommendation => item !== null)
    .sort((a, b) => b.score - a.score);

  return matches.slice(0, 4);
}
