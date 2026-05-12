export type Order = {
  id: string;
  name: string;
  customer: string;
  city: string;
  totalTry: number;
  paymentStatus: "Odendi" | "Beklemede" | "Iade";
  fulfillmentStatus: "Hazirlaniyor" | "Kargoda" | "Teslim" | "Gecikme";
  itemCount: number;
  channel: "Web" | "WhatsApp" | "Fiziksel";
  product: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  customer: string;
  channel: "WhatsApp" | "Email" | "Live Chat";
  topic: "Siparis" | "Iade" | "Stok" | "Kargo" | "Teknik";
  lastMessage: string;
  status: "AI Taslagi Hazir" | "Temsilci Bekliyor" | "Cozuldu";
  unread: number;
  sentiment: "Olumlu" | "Notr" | "Olumsuz";
  orderRef: string | null;
  aiDraft: string;
  updatedAt: string;
};

export type Shipment = {
  orderId: string;
  customer: string;
  provider: string;
  trackingNo: string;
  destination: string;
  status: string;
  lastEvent: string;
  risk: "Dusuk" | "Orta" | "Yuksek";
  slaHoursLeft: number;
  estimatedDelivery: string;
  product: string;
};

export type InventoryItem = {
  sku: string;
  product: string;
  category: string;
  stock: number;
  reorderPoint: number;
  weeklyVelocity: number;
  depletionDays: number;
  recommendation: string;
  supplierLeadDays: number;
  unitPrice: number;
};

export type KnowledgeEntry = {
  id: string;
  title: string;
  content: string;
  category: string;
  addedAt: string;
  addedBy: string;
};

export const kpis = {
  todayOrders: 63,
  revenueTry: 284_750,
  riskyShipments: 4,
  lowStockSkus: 5,
  autoResolvedTickets: 51,
  avgFirstResponseMin: 3.8
};

export const aiInsight =
  "Son 24 saatte Meta Quest 3 ve Apple Vision Pro siparişlerinde teslimat riski yüksek; " +
  "#128, #145 ve #151 acil müdahale gerektiriyor. Samsung Galaxy Ring stoğu 3 günde tükenecek.";

export const recentOrders: Order[] = [
  {
    id: "ord-1842",
    name: "#1842",
    customer: "Elif Yılmaz",
    city: "İzmir",
    totalTry: 18_990,
    paymentStatus: "Odendi",
    fulfillmentStatus: "Kargoda",
    itemCount: 1,
    channel: "Web",
    product: "Meta Quest 3 128GB",
    createdAt: "2026-05-11T08:12:00"
  },
  {
    id: "ord-1841",
    name: "#1841",
    customer: "Mert Kaya",
    city: "Ankara",
    totalTry: 8_490,
    paymentStatus: "Odendi",
    fulfillmentStatus: "Hazirlaniyor",
    itemCount: 2,
    channel: "WhatsApp",
    product: "Samsung Galaxy Ring + Kılıf",
    createdAt: "2026-05-11T07:55:00"
  },
  {
    id: "ord-1840",
    name: "#1840",
    customer: "Deniz Arslan",
    city: "İstanbul",
    totalTry: 52_900,
    paymentStatus: "Odendi",
    fulfillmentStatus: "Gecikme",
    itemCount: 1,
    channel: "Web",
    product: "Apple Vision Pro",
    createdAt: "2026-05-10T21:40:00"
  },
  {
    id: "ord-1839",
    name: "#1839",
    customer: "Burak Çelik",
    city: "Bursa",
    totalTry: 4_290,
    paymentStatus: "Beklemede",
    fulfillmentStatus: "Hazirlaniyor",
    itemCount: 1,
    channel: "Fiziksel",
    product: "Garmin Fenix 8",
    createdAt: "2026-05-10T18:05:00"
  }
];

export const conversations: Conversation[] = [
  {
    id: "conv-1",
    customer: "Merve Aydın",
    channel: "WhatsApp",
    topic: "Kargo",
    lastMessage: "128 no'lu siparişim yarın elime ulaşır mı?",
    status: "AI Taslagi Hazir",
    unread: 2,
    sentiment: "Notr",
    orderRef: "#128",
    aiDraft:
      "Merhaba Merve Hanım, Meta Quest 3 128GB siparişiniz (#128) şu an Yurtiçi Kargo transfer merkezinde. " +
      "Tahmini teslim yarın 17:00-20:00 aralığında. Gecikme yaşanırsa hemen bilgilendireceğiz.",
    updatedAt: "2026-05-11T14:22:00"
  },
  {
    id: "conv-2",
    customer: "Ali Korkmaz",
    channel: "Email",
    topic: "Teknik",
    lastMessage: "Galaxy Ring uygulama ile eşleşmedi, ne yapabilirim?",
    status: "Temsilci Bekliyor",
    unread: 0,
    sentiment: "Olumlu",
    orderRef: "#119",
    aiDraft:
      "Ali Bey, Samsung Health uygulamasını güncelleyip telefonu yeniden başlatmanızı öneririm. " +
      "Sorun devam ederse fabrika ayarlarına dönmeden önce bizi arayın, uzaktan destek verebiliriz.",
    updatedAt: "2026-05-11T13:05:00"
  },
  {
    id: "conv-3",
    customer: "Zeynep Demir",
    channel: "Live Chat",
    topic: "Stok",
    lastMessage: "Apple Vision Pro sipariş versem ne zaman gelir?",
    status: "AI Taslagi Hazir",
    unread: 1,
    sentiment: "Notr",
    orderRef: null,
    aiDraft:
      "Zeynep Hanım, Apple Vision Pro şu an stokta mevcut. Bugün saat 14:00'e kadar verilen siparişler " +
      "aynı gün kargoya verilmekte olup 2-3 iş gününde teslim edilmektedir.",
    updatedAt: "2026-05-11T12:48:00"
  },
  {
    id: "conv-4",
    customer: "Can Erdem",
    channel: "WhatsApp",
    topic: "Kargo",
    lastMessage: "Kurye yanlış adrese gitmiş diyor, ne yapacağım?",
    status: "Temsilci Bekliyor",
    unread: 3,
    sentiment: "Olumsuz",
    orderRef: "#145",
    aiDraft:
      "Can Bey, Garmin Fenix 8 (#145) teslimatınız için kargo firması ile acil eskalasyon açtık. " +
      "30 dk içinde sizi arayacaklar. Alternatif teslimat noktası da belirleyebiliriz.",
    updatedAt: "2026-05-11T11:20:00"
  }
];

export const shipments: Shipment[] = [
  {
    orderId: "#128",
    customer: "Merve Aydın",
    provider: "Yurtiçi",
    trackingNo: "YT7845123399TR",
    destination: "Kadıköy / İstanbul",
    status: "Transfer merkezinde bekliyor",
    lastEvent: "14:05 - Kartal aktarma",
    risk: "Yuksek",
    slaHoursLeft: -6,
    estimatedDelivery: "2026-05-12",
    product: "Meta Quest 3 128GB"
  },
  {
    orderId: "#145",
    customer: "Can Erdem",
    provider: "Aras",
    trackingNo: "AR9981204455",
    destination: "Cankaya / Ankara",
    status: "Dağıtım bölgesine ulaştı",
    lastEvent: "13:40 - Dağıtım aracına yüklendi",
    risk: "Orta",
    slaHoursLeft: 8,
    estimatedDelivery: "2026-05-11",
    product: "Garmin Fenix 8"
  },
  {
    orderId: "#151",
    customer: "Selin Polat",
    provider: "MNG",
    trackingNo: "MN5512098871",
    destination: "Nilüfer / Bursa",
    status: "Gümrük/bölge gecikmesi",
    lastEvent: "09:12 - Bölge merkezinde bekliyor",
    risk: "Yuksek",
    slaHoursLeft: -14,
    estimatedDelivery: "2026-05-10",
    product: "Apple Vision Pro"
  },
  {
    orderId: "#160",
    customer: "Emre Taş",
    provider: "PTT",
    trackingNo: "PT8844002211",
    destination: "Karşıyaka / İzmir",
    status: "Teslim edildi",
    lastEvent: "16:02 - Teslim alındı",
    risk: "Dusuk",
    slaHoursLeft: 24,
    estimatedDelivery: "2026-05-11",
    product: "Samsung Galaxy Watch 7"
  },
  {
    orderId: "#162",
    customer: "Ayşe Nur",
    provider: "Sürat",
    trackingNo: "SR2209981100",
    destination: "Beşiktaş / İstanbul",
    status: "Dağıtıma çıktı",
    lastEvent: "15:30 - Kurye yolda",
    risk: "Dusuk",
    slaHoursLeft: 3,
    estimatedDelivery: "2026-05-11",
    product: "Oura Ring Gen 3"
  }
];

export const inventoryHealth: InventoryItem[] = [
  {
    sku: "SKU-MQ3-01",
    product: "Meta Quest 3 128GB",
    category: "VR/AR Gözlük",
    stock: 7,
    reorderPoint: 15,
    weeklyVelocity: 18,
    depletionDays: 3,
    recommendation: "Acil 20 adet tedarik; kampanya öncesi kritik.",
    supplierLeadDays: 7,
    unitPrice: 18_990
  },
  {
    sku: "SKU-AVP-01",
    product: "Apple Vision Pro",
    category: "VR/AR Gözlük",
    stock: 3,
    reorderPoint: 8,
    weeklyVelocity: 5,
    depletionDays: 4,
    recommendation: "5 adet ön sipariş; temin süresi 14 gün.",
    supplierLeadDays: 14,
    unitPrice: 52_900
  },
  {
    sku: "SKU-SGR-01",
    product: "Samsung Galaxy Ring",
    category: "Giyilebilir",
    stock: 12,
    reorderPoint: 20,
    weeklyVelocity: 28,
    depletionDays: 3,
    recommendation: "Kampanya öncesi acil 40 adet tedarik.",
    supplierLeadDays: 5,
    unitPrice: 8_490
  },
  {
    sku: "SKU-GF8-01",
    product: "Garmin Fenix 8",
    category: "Akıllı Saat",
    stock: 24,
    reorderPoint: 15,
    weeklyVelocity: 12,
    depletionDays: 14,
    recommendation: "Stok sağlıklı; indirim kampanyası için hazır.",
    supplierLeadDays: 10,
    unitPrice: 22_990
  },
  {
    sku: "SKU-OUR-01",
    product: "Oura Ring Gen 3",
    category: "Giyilebilir",
    stock: 9,
    reorderPoint: 12,
    weeklyVelocity: 10,
    depletionDays: 6,
    recommendation: "10 adet sipariş; temin süresi 8 gün.",
    supplierLeadDays: 8,
    unitPrice: 6_290
  }
];

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "kb-1",
    title: "Meta Quest 3 Eşleştirme Sorunu - Çözüm Adımları",
    content: "1. Gözlüğü fabrika ayarlarına döndürün. 2. Meta Quest uygulamasını güncelleyin. 3. Bluetooth'u kapatıp açın. 4. Hala sorun yaşıyorsanız teknik destek alın.",
    category: "Teknik Destek",
    addedAt: "2026-05-10T10:00:00",
    addedBy: "Destek Ekibi"
  },
  {
    id: "kb-2",
    title: "Apple Vision Pro İade Politikası",
    content: "14 gün iade hakkı mevcuttur. Kutusunu açmamış ürünler için tam iade yapılır. Açılmış ürünler için %15 yeniden stoklama ücreti alınır.",
    category: "İade",
    addedAt: "2026-05-09T14:30:00",
    addedBy: "Müşteri Hizmetleri"
  },
  {
    id: "kb-3",
    title: "Samsung Galaxy Ring Batarya Optimizasyonu",
    content: "Halka pilinin ömrünü uzatmak için Samsung Health uygulamasında gece modu aktif edilmeli. Ortalama şarj süresi 80 dakikadır.",
    category: "Kullanım Kılavuzu",
    addedAt: "2026-05-08T09:15:00",
    addedBy: "Teknik Ekip"
  }
];

export const tasks = [
  {
    id: "task-1",
    title: "#128 müşterisine proaktif gecikme mesajı",
    owner: "Destek",
    due: "Bugün 17:00",
    reason: "SLA -6 saat, risk Yüksek.",
    status: "Acik"
  },
  {
    id: "task-2",
    title: "Samsung Galaxy Ring acil tedarik siparişi",
    owner: "Satın Alma",
    due: "Yarın 10:00",
    reason: "3 günde kritik stok.",
    status: "Acik"
  },
  {
    id: "task-3",
    title: "#145 kargo eskalasyon takibi",
    owner: "Operasyon",
    due: "Bugün 18:30",
    reason: "Müşteri olumsuz sentiment.",
    status: "Acik"
  }
];

export const activityFeed = [
  { time: "14:22", text: "AI #128 Meta Quest kargosu için WhatsApp taslağı üretti." },
  { time: "13:58", text: "Stok alarmı: Samsung Galaxy Ring 3 günlük eşiğe indi." },
  { time: "13:12", text: "Kargo webhook: #151 Apple Vision Pro gümrük gecikmesinde." },
  { time: "12:40", text: "Slack #kargo kanalına 2 yeni risk özeti gönderildi." }
];

export const users = [
  { id: "u1", name: "Ahmet Demir", email: "ahmet@opsmind.com", role: "Admin", department: "Yönetim", active: true },
  { id: "u2", name: "Selin Kaya", email: "selin@opsmind.com", role: "Operasyon", department: "Kargo & Lojistik", active: true },
  { id: "u3", name: "Barış Arslan", email: "baris@opsmind.com", role: "Destek", department: "Müşteri Hizmetleri", active: true },
  { id: "u4", name: "Nil Polat", email: "nil@opsmind.com", role: "Satın Alma", department: "Tedarik Zinciri", active: false },
];
