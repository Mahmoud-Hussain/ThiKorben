import {
  addToCart,
  getCartCount,
  getCartSubtotal,
  getDetailedCartItems,
  getProductById,
  removeFromCart,
  SHOP_PRODUCTS,
  ShopProduct,
  updateCartQuantity,
} from '@/constants/shop-data';

export type DemoRole = 'customer' | 'worker';

export type RecommendationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'alternative_requested'
  | 'added_to_cart';

export interface ProductRecommendation {
  id: string;
  conversationId: string;
  triggeringMessageId: string;
  requestedTerm: string;
  productId: string;
  product: ShopProduct;
  quantity: number;
  status: RecommendationStatus;
  matchedReason: string;
  decisionTime?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other' | 'customer' | 'worker' | 'system';
  senderRole?: 'customer' | 'worker' | 'system';
  senderName?: string;
  text: string;
  time: string;
  type?: 'text' | 'location' | 'image' | 'system' | 'recommendation';
  status?: 'sent' | 'delivered' | 'read';
  recommendationIds?: string[];
}

export interface ChatConversation {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientRole: string;
  jobTitle: string;
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
  avatarColor: string;
  messages: ChatMessage[];
  recommendations: ProductRecommendation[];
}

export const STORAGE_KEY = 'thikorben_floating_chat_conversations_v2';
export const DEMO_ROLE_KEY = 'thikorben_chat_demo_role_v1';
export const SYNC_EVENT_NAME = 'thikorben_chat_sync';

export const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-rahim',
    recipientId: 'worker-demo-1',
    recipientName: 'Rahim Uddin',
    recipientRole: 'Verified Plumber • 4.9 ★',
    jobTitle: 'Plumbing Leak Fix (Dhanmondi 27)',
    unreadCount: 1,
    lastMessage: 'ঠিক আছে, আমি আর কয়েক মিনিটের মধ্যে পৌঁছাব ইনশাল্লাহ।',
    lastTime: '11:44 AM',
    avatarColor: '#10b981',
    recommendations: [],
    messages: [
      {
        id: 'msg-1',
        sender: 'worker',
        senderRole: 'worker',
        senderName: 'Rahim Uddin',
        text: 'আসসালামু আলাইকুম! আমি আপনার রিকোয়েস্ট পেয়েছি, ধানমন্ডি ২৭ নম্বর রোডের দিকে আসছি।',
        time: '11:42 AM',
        type: 'text',
        status: 'read',
      },
      {
        id: 'msg-2',
        sender: 'customer',
        senderRole: 'customer',
        senderName: 'You (Customer)',
        text: 'ওয়ালাইকুম আসসালাম ভাই। মেইন গেইট খোলা আছে, ৩ তলায় উঠুন।',
        time: '11:43 AM',
        type: 'text',
        status: 'read',
      },
      {
        id: 'msg-3',
        sender: 'worker',
        senderRole: 'worker',
        senderName: 'Rahim Uddin',
        text: 'ঠিক আছে, আমি আর কয়েক মিনিটের মধ্যে পৌঁছাব ইনশাল্লাহ। কোনো নির্দিষ্ট টুল লাগবে কি?',
        time: '11:44 AM',
        type: 'text',
        status: 'read',
      },
    ],
  },
  {
    id: 'conv-kamal',
    recipientId: 'worker-demo-2',
    recipientName: 'Kamal Hossain',
    recipientRole: 'Electrician • 4.8 ★',
    jobTitle: 'Main Breaker Tripping (Mirpur 10)',
    unreadCount: 0,
    lastMessage: 'সার্কিট ব্রেকারের ছবি দেখতে পেয়েছি, স্পেয়ার পার্টস নিয়ে আসছি।',
    lastTime: 'Yesterday',
    avatarColor: '#f59e0b',
    recommendations: [],
    messages: [
      {
        id: 'msg-k1',
        sender: 'worker',
        senderRole: 'worker',
        senderName: 'Kamal Hossain',
        text: 'আসসালামু আলাইকুম, মেইন সুইচের তারে কোনো পোড়া গন্ধ পেয়েছেন?',
        time: '3:15 PM',
        type: 'text',
        status: 'read',
      },
      {
        id: 'msg-k2',
        sender: 'customer',
        senderRole: 'customer',
        senderName: 'You (Customer)',
        text: 'জী হালকা গন্ধ আছে, মাইক্রোওয়েভ চালালেই ট্রিপ করছে।',
        time: '3:18 PM',
        type: 'text',
        status: 'read',
      },
      {
        id: 'msg-k3',
        sender: 'worker',
        senderRole: 'worker',
        senderName: 'Kamal Hossain',
        text: 'সার্কিট ব্রেকারের ছবি দেখতে পেয়েছি, স্পেয়ার পার্টস নিয়ে আসছি।',
        time: '3:20 PM',
        type: 'text',
        status: 'read',
      },
    ],
  },
  {
    id: 'conv-support',
    recipientId: 'support-1',
    recipientName: 'ThiKorben Support',
    recipientRole: 'Customer Help Desk',
    jobTitle: 'Order & Safety Inquiries',
    unreadCount: 0,
    lastMessage: 'আমাদের হেল্পলাইনে যোগাযোগ করার জন্য ধন্যবাদ। যেকোনো সমস্যায় আমরা আছি।',
    lastTime: 'Oct 10',
    avatarColor: '#15157d',
    recommendations: [],
    messages: [
      {
        id: 'msg-s1',
        sender: 'worker',
        senderRole: 'worker',
        senderName: 'ThiKorben Support',
        text: 'ঠিককরবেনে স্বাগতম! আপনার সেবায় কোনো সমস্যা হলে জানান।',
        time: '10:00 AM',
        type: 'text',
        status: 'read',
      },
    ],
  },
];

let seqCounter = 500;
export function generateSeqId(prefix: string): string {
  seqCounter += 1;
  return `${prefix}-${Date.now().toString().slice(-4)}-${seqCounter}`;
}

export function getCurrentFormattedTime(): string {
  const d = new Date();
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
  return `${h}:${m} ${ampm}`;
}

export function loadConversationsFromStorage(): ChatConversation[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize recommendations array
          return parsed.map((conv: any) => ({
            ...conv,
            recommendations: Array.isArray(conv.recommendations) ? conv.recommendations : [],
            messages: Array.isArray(conv.messages) ? conv.messages : [],
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to parse chat storage', e);
    }
  }
  return INITIAL_CONVERSATIONS;
}

export function saveConversationsToStorage(conversations: ChatConversation[]): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
      window.dispatchEvent(
        new CustomEvent(SYNC_EVENT_NAME, {
          detail: { type: 'conversations_updated', conversations },
        })
      );
    } catch (e) {
      console.warn('Failed to save chat storage', e);
    }
  }
}

export function getDemoRole(): DemoRole {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(DEMO_ROLE_KEY);
      if (saved === 'worker' || saved === 'customer') return saved;
    } catch {}
  }
  return 'customer';
}

export function setDemoRole(role: DemoRole): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(DEMO_ROLE_KEY, role);
      window.dispatchEvent(
        new CustomEvent(SYNC_EVENT_NAME, {
          detail: { type: 'demo_role_changed', role },
        })
      );
    } catch {}
  }
}

/**
 * Deterministic extraction matching keywords & specifications from a message.
 * Supports multiple components mentioned in a single message.
 */
export function extractComponentRecommendations(
  messageText: string,
  conversationId: string,
  messageId: string
): ProductRecommendation[] {
  const text = messageText.toLowerCase();
  const detected: ProductRecommendation[] = [];
  const matchedProductIds = new Set<string>();

  // Sort products so longer, more specific keywords match first
  const sortedProducts = [...SHOP_PRODUCTS].sort((a, b) => {
    const maxA = Math.max(...a.aiKeywords.map(k => k.length), 0);
    const maxB = Math.max(...b.aiKeywords.map(k => k.length), 0);
    return maxB - maxA;
  });

  for (const product of sortedProducts) {
    if (matchedProductIds.has(product.id)) continue;

    for (const keyword of product.aiKeywords) {
      const cleanKeyword = keyword.toLowerCase().trim();
      if (!cleanKeyword) continue;

      // Word boundary or substring regex to avoid accidental matches
      const escaped = cleanKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b|${escaped}`, 'i');

      if (regex.test(text)) {
        matchedProductIds.add(product.id);
        detected.push({
          id: generateSeqId('rec'),
          conversationId,
          triggeringMessageId: messageId,
          requestedTerm: keyword,
          productId: product.id,
          product,
          quantity: 1,
          status: 'pending',
          matchedReason: `Matched worker request for "${keyword}"`,
        });
        break;
      }
    }
  }

  return detected;
}

export function getOrCreateConversation(
  conversationId: string,
  jobTitle?: string,
  recipientName?: string,
  recipientRole?: string
): ChatConversation {
  const conversations = loadConversationsFromStorage();
  const existing = conversations.find(c => c.id === conversationId);
  if (existing) {
    return existing;
  }

  const newConv: ChatConversation = {
    id: conversationId,
    recipientId: 'worker-demo-1',
    recipientName: recipientName || 'Rahim Uddin',
    recipientRole: recipientRole || 'Verified Plumber • 4.9 ★',
    jobTitle: jobTitle || 'Bathroom Tap Leaking & Basin Pipe Joint Repair',
    unreadCount: 0,
    lastMessage: '',
    lastTime: getCurrentFormattedTime(),
    avatarColor: '#10b981',
    messages: [],
    recommendations: [],
  };

  saveConversationsToStorage([newConv, ...conversations]);
  return newConv;
}

/**
 * Add a new message to a specific conversation, run component detection,
 * generate system messages if recommendations exist, and broadcast sync.
 */
export function addMessageToConversation(
  conversationId: string,
  senderRole: 'customer' | 'worker',
  text: string,
  senderName?: string,
  type: 'text' | 'location' | 'image' | 'system' = 'text'
): { message: ChatMessage; newRecommendations: ProductRecommendation[] } {
  const conversations = loadConversationsFromStorage();
  let convIndex = conversations.findIndex(c => c.id === conversationId);
  let conv: ChatConversation;

  if (convIndex >= 0) {
    conv = conversations[convIndex];
  } else {
    conv = {
      id: conversationId,
      recipientId: 'worker-demo-1',
      recipientName: senderName || 'Rahim Uddin',
      recipientRole: 'Verified Plumber • 4.9 ★',
      jobTitle: 'Bathroom Tap Leaking & Basin Pipe Joint Repair',
      unreadCount: 0,
      lastMessage: text,
      lastTime: getCurrentFormattedTime(),
      avatarColor: '#10b981',
      messages: [],
      recommendations: [],
    };
    conversations.unshift(conv);
    convIndex = 0;
  }

  const msgId = generateSeqId('msg');
  const time = getCurrentFormattedTime();
  const displayName = senderName || (senderRole === 'worker' ? conv.recipientName : 'You');

  // Detect recommendations if sent by worker
  const newRecs: ProductRecommendation[] =
    senderRole === 'worker' && type === 'text'
      ? extractComponentRecommendations(text, conv.id, msgId)
      : [];

  const newMsg: ChatMessage = {
    id: msgId,
    sender: senderRole,
    senderRole,
    senderName: displayName,
    text,
    time,
    type,
    status: 'sent',
    recommendationIds: newRecs.map(r => r.id),
  };

  const updatedMessages = [...conv.messages, newMsg];
  const updatedRecs = [...(conv.recommendations || []), ...newRecs];

  // If recommendations were generated, add a helpful AI detection system message
  if (newRecs.length > 0) {
    const countText = newRecs.length === 1 ? '1 required part' : `${newRecs.length} required parts`;
    const sysMsg: ChatMessage = {
      id: generateSeqId('sys'),
      sender: 'system',
      senderRole: 'system',
      senderName: 'ThiKorben AI Assistant',
      text: `🤖 AI Assistant identified ${countText} mentioned by ${displayName}. Please review specifications and decide below.`,
      time,
      type: 'system',
      status: 'read',
    };
    updatedMessages.push(sysMsg);
  }

  const updatedConv: ChatConversation = {
    ...conv,
    messages: updatedMessages,
    recommendations: updatedRecs,
    lastMessage: text,
    lastTime: time,
  };

  const updatedConversations = conversations.map(c =>
    c.id === conv.id ? updatedConv : c
  );

  saveConversationsToStorage(updatedConversations);

  return { message: newMsg, newRecommendations: newRecs };
}

/**
 * Customer approval or rejection of a product recommendation.
 */
export function updateRecommendationDecision(
  conversationId: string,
  recommendationId: string,
  newStatus: RecommendationStatus,
  newQuantity?: number,
  replacementProductId?: string
): void {
  const conversations = loadConversationsFromStorage();
  const conv = conversations.find(c => c.id === conversationId);
  if (!conv) return;

  const rec = conv.recommendations?.find(r => r.id === recommendationId);
  if (!rec) return;

  const time = getCurrentFormattedTime();
  let updatedProduct = rec.product;

  if (replacementProductId && replacementProductId !== rec.productId) {
    const rep = getProductById(replacementProductId);
    if (rep) {
      updatedProduct = rep;
      rec.productId = rep.id;
      rec.product = rep;
      rec.requestedTerm = rep.name;
    }
  }

  const finalQty = newQuantity !== undefined && newQuantity > 0 ? newQuantity : rec.quantity;

  rec.status = newStatus;
  rec.quantity = finalQty;
  rec.decisionTime = time;

  // Add contextual system message communicating the decision
  let decisionText = '';
  if (newStatus === 'approved') {
    decisionText = `✅ Customer APPROVED ${updatedProduct.name} (Qty: ${finalQty} • ৳${(updatedProduct.price * finalQty).toLocaleString()}). Ready to add to demo cart.`;
  } else if (newStatus === 'rejected') {
    decisionText = `❌ Customer DECLINED ${updatedProduct.name}. Material will not be purchased.`;
  } else if (newStatus === 'alternative_requested') {
    decisionText = `🔄 Customer selected alternative product: ${updatedProduct.name}. Awaiting approval.`;
  } else if (newStatus === 'added_to_cart') {
    // Add to actual demo cart
    addToCart(updatedProduct.id, finalQty);
    decisionText = `🛒 Added to Demo Cart: ${updatedProduct.name} (${finalQty}x @ ৳${updatedProduct.price.toLocaleString()} = ৳${(updatedProduct.price * finalQty).toLocaleString()}).`;
  }

  if (decisionText) {
    conv.messages.push({
      id: generateSeqId('sys'),
      sender: 'system',
      senderRole: 'system',
      senderName: 'ThiKorben Marketplace',
      text: decisionText,
      time,
      type: 'system',
      status: 'read',
    });
    conv.lastMessage = decisionText;
    conv.lastTime = time;
  }

  saveConversationsToStorage(conversations);
}

/**
 * Subscribe to chat updates across any component or window event.
 */
export function subscribeToChatSync(
  callback: (conversations: ChatConversation[], eventDetail?: any) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (e: any) => {
    const convs = loadConversationsFromStorage();
    callback(convs, e.detail);
  };

  window.addEventListener(SYNC_EVENT_NAME, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(SYNC_EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

export {
  addToCart,
  getCartCount,
  getCartSubtotal,
  getDetailedCartItems,
  getProductById,
  removeFromCart,
  updateCartQuantity,
};
