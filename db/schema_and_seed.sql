-- ============================================================
-- TechOps AI — PostgreSQL Şema ve Seed
-- pgAdmin'de yeni bir DB oluşturun (ör: techops_db) ve
-- bu dosyayı Query Tool'da çalıştırın.
-- ============================================================

-- Uzantılar
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- KULLANICILAR
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL DEFAULT 'Destek',
  department  TEXT NOT NULL DEFAULT '',
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SİPARİŞLER
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  customer            TEXT NOT NULL,
  city                TEXT NOT NULL DEFAULT '',
  total_try           NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_status      TEXT NOT NULL DEFAULT 'Beklemede',
  fulfillment_status  TEXT NOT NULL DEFAULT 'Hazirlaniyor',
  item_count          INT NOT NULL DEFAULT 1,
  channel             TEXT NOT NULL DEFAULT 'Web',
  product             TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- KARGO
-- ============================================================
CREATE TABLE IF NOT EXISTS shipments (
  id                  SERIAL PRIMARY KEY,
  order_id            TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer            TEXT NOT NULL,
  provider            TEXT NOT NULL,
  tracking_no         TEXT NOT NULL,
  destination         TEXT NOT NULL,
  status              TEXT NOT NULL,
  last_event          TEXT NOT NULL DEFAULT '',
  risk                TEXT NOT NULL DEFAULT 'Dusuk',
  sla_hours_left      INT NOT NULL DEFAULT 0,
  estimated_delivery  DATE,
  product             TEXT NOT NULL DEFAULT '',
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- STOK (ENVANTER)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
  sku                 TEXT PRIMARY KEY,
  product             TEXT NOT NULL,
  category            TEXT NOT NULL DEFAULT '',
  stock               INT NOT NULL DEFAULT 0,
  reorder_point       INT NOT NULL DEFAULT 0,
  weekly_velocity     INT NOT NULL DEFAULT 0,
  depletion_days      INT NOT NULL DEFAULT 0,
  recommendation      TEXT NOT NULL DEFAULT '',
  supplier_lead_days  INT NOT NULL DEFAULT 0,
  unit_price          NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- KONUŞMALAR (AI Yardım Masası)
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer    TEXT NOT NULL,
  channel     TEXT NOT NULL DEFAULT 'Email',
  topic       TEXT NOT NULL DEFAULT 'Genel',
  last_message TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'AI Taslagi Hazir',
  unread      INT NOT NULL DEFAULT 0,
  order_ref   TEXT,
  ai_draft    TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- BİLGİ TABANI
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_base (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'Genel',
  added_by    TEXT NOT NULL DEFAULT 'Sistem',
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- GÖREVLER
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title       TEXT NOT NULL,
  owner       TEXT NOT NULL DEFAULT '',
  due         TEXT NOT NULL DEFAULT '',
  reason      TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'Acik',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AKTİVİTE LOGU
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id          SERIAL PRIMARY KEY,
  event_time  TIMESTAMPTZ NOT NULL DEFAULT now(),
  text        TEXT NOT NULL
);

-- ============================================================
-- SEED — Mock veriler
-- ============================================================

-- Kullanıcılar
INSERT INTO users (id, name, email, role, department, active) VALUES
  ('u1', 'Ahmet Demir',  'ahmet@techops.com', 'Admin',      'Yonetim',           true),
  ('u2', 'Selin Kaya',   'selin@techops.com', 'Operasyon',  'Kargo & Lojistik',  true),
  ('u3', 'Baris Arslan', 'baris@techops.com', 'Destek',     'Musteri Hizmetleri',true),
  ('u4', 'Nil Polat',    'nil@techops.com',   'Satin Alma', 'Tedarik Zinciri',   false)
ON CONFLICT (id) DO NOTHING;

-- Siparişler
INSERT INTO orders (id, name, customer, city, total_try, payment_status, fulfillment_status, item_count, channel, product, created_at) VALUES
  ('ord-1842','#1842','Elif Yilmaz','Izmir',   18990,'Odendi','Kargoda',    1,'Web',      'Meta Quest 3 128GB',  '2026-05-11T08:12:00Z'),
  ('ord-1841','#1841','Mert Kaya',  'Ankara',   8490,'Odendi','Hazirlaniyor',2,'Web',      'Samsung Galaxy Ring', '2026-05-11T07:45:00Z'),
  ('ord-1840','#1840','Zeynep Ak',  'Istanbul',52900,'Odendi','Gecikme',     1,'WhatsApp', 'Apple Vision Pro',    '2026-05-10T22:30:00Z'),
  ('ord-1839','#1839','Kemal Oz',   'Bursa',    6290,'Odendi','Teslim',      1,'Web',      'Oura Ring Gen 3',     '2026-05-10T19:00:00Z'),
  ('ord-1838','#1838','Aysun Tas',  'Izmir',   22990,'Beklemede','Hazirlaniyor',1,'Fiziksel','Garmin Fenix 8',    '2026-05-10T16:20:00Z')
ON CONFLICT (id) DO NOTHING;

-- Kargo
INSERT INTO shipments (order_id, customer, provider, tracking_no, destination, status, last_event, risk, sla_hours_left, estimated_delivery, product) VALUES
  ('ord-1842','Merve Aydin','Yurtici','YT7845123399TR','Kadikoy / Istanbul','Transfer merkezinde bekliyor','14:05 - Kartal aktarma','Yuksek',-6,'2026-05-12','Meta Quest 3 128GB'),
  ('ord-1841','Can Erdem',  'Aras',   'AR9981204455',  'Cankaya / Ankara',  'Dagitim bolgesine ulasti',   '13:40 - Dagitim aracina yuklendi','Orta',8,'2026-05-11','Garmin Fenix 8'),
  ('ord-1840','Selin Polat','MNG',    'MN5512098871',  'Nilufer / Bursa',   'Gumruk/bolge gecikmesi',     '09:12 - Bolge merkezinde bekliyor','Yuksek',-14,'2026-05-10','Apple Vision Pro'),
  ('ord-1839','Emre Tas',   'PTT',    'PT8844002211',  'Karsiyaka / Izmir', 'Teslim edildi',              '16:02 - Teslim alindi','Dusuk',24,'2026-05-11','Samsung Galaxy Watch 7'),
  ('ord-1838','Ayse Nur',   'Surat',  'SR2209981100',  'Besiktas / Istanbul','Dagitima cikti',            '15:30 - Kurye yolda','Dusuk',3,'2026-05-11','Oura Ring Gen 3');

-- Stok
INSERT INTO inventory (sku, product, category, stock, reorder_point, weekly_velocity, depletion_days, recommendation, supplier_lead_days, unit_price) VALUES
  ('SKU-MQ3-01','Meta Quest 3 128GB',  'VR/AR Gozluk', 7, 15,18,3, 'Acil 20 adet tedarik; kampanya oncesi kritik.',  7, 18990),
  ('SKU-AVP-01','Apple Vision Pro',    'VR/AR Gozluk', 3,  8, 5,4, '5 adet on siparis; temin suresi 14 gun.',       14,52900),
  ('SKU-SGR-01','Samsung Galaxy Ring', 'Giyilebilir',  12,20,28,3, 'Kampanya oncesi acil 40 adet tedarik.',          5, 8490),
  ('SKU-GF8-01','Garmin Fenix 8',      'Akilli Saat',  24,15,12,14,'Stok saglikli; indirim kampanyasi icin hazir.',  10,22990),
  ('SKU-OUR-01','Oura Ring Gen 3',     'Giyilebilir',   9,12,10,6, '10 adet siparis; temin suresi 8 gun.',           8, 6290)
ON CONFLICT (sku) DO NOTHING;

-- Bilgi Tabanı
INSERT INTO knowledge_base (id, title, content, category, added_by, added_at) VALUES
  ('kb-1','Meta Quest 3 Eslestirme Sorunu - Cozum Adimlari','1. Gozlugu fabrika ayarlarina dondurun. 2. Meta Quest uygulamasini guncelleyin. 3. Bluetooth''u kapatip acin. 4. Hala sorun yasiyorsaniz teknik destek alin.','Teknik Destek','Destek Ekibi','2026-05-10T10:00:00Z'),
  ('kb-2','Apple Vision Pro Iade Politikasi','14 gun iade hakki mevcuttur. Kutusunu acmamis urunler icin tam iade yapilir. Acilmis urunler icin %15 yeniden stoklama ucreti alinir.','Iade','Musteri Hizmetleri','2026-05-09T14:30:00Z'),
  ('kb-3','Samsung Galaxy Ring Batarya Optimizasyonu','Halka pilin omrunu uzatmak icin Samsung Health uygulamasinda gece modu aktif edilmeli. Ortalama sarj suresi 80 dakikadir.','Kullanim Kilavuzu','Teknik Ekip','2026-05-08T09:15:00Z')
ON CONFLICT (id) DO NOTHING;

-- Görevler
INSERT INTO tasks (id, title, owner, due, reason, status) VALUES
  ('task-1','#128 musterisine proaktif gecikme mesaji','Destek','Bugun 17:00','SLA -6 saat, risk Yuksek.','Acik'),
  ('task-2','Samsung Galaxy Ring acil tedarik siparisi','Satin Alma','Yarin 10:00','3 gunde kritik stok.','Acik'),
  ('task-3','#145 kargo eskalasyon takibi','Operasyon','Bugun 18:30','Musteri olumsuz sentiment.','Acik')
ON CONFLICT (id) DO NOTHING;

-- Aktivite logu
INSERT INTO activity_log (event_time, text) VALUES
  ('2026-05-11T14:22:00Z','AI #128 Meta Quest kargosi icin WhatsApp taslagi uretti.'),
  ('2026-05-11T13:58:00Z','Stok alarmi: Samsung Galaxy Ring 3 gunluk esige indi.'),
  ('2026-05-11T13:12:00Z','Kargo webhook: #151 Apple Vision Pro gumruk gecikmesinde.'),
  ('2026-05-11T12:40:00Z','Slack #kargo kanalina 2 yeni risk ozeti gonderildi.');

-- ============================================================
-- Doğrulama
-- ============================================================
SELECT 'users' AS tablo, COUNT(*) FROM users
UNION ALL SELECT 'orders',       COUNT(*) FROM orders
UNION ALL SELECT 'shipments',    COUNT(*) FROM shipments
UNION ALL SELECT 'inventory',    COUNT(*) FROM inventory
UNION ALL SELECT 'knowledge_base',COUNT(*) FROM knowledge_base
UNION ALL SELECT 'tasks',        COUNT(*) FROM tasks
UNION ALL SELECT 'activity_log', COUNT(*) FROM activity_log;
