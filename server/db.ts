import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'cluckfeed.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    -- Ingredients / Matrix Bahan Baku
    CREATE TABLE IF NOT EXISTS ingredients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subname TEXT DEFAULT '',
      category TEXT NOT NULL CHECK(category IN ('energi','protein','mineral','aditif')),
      default_price INTEGER NOT NULL DEFAULT 0,
      current_price INTEGER NOT NULL DEFAULT 0,
      protein REAL NOT NULL DEFAULT 0,
      energy REAL NOT NULL DEFAULT 0,
      calcium REAL NOT NULL DEFAULT 0,
      phosphorus REAL NOT NULL DEFAULT 0,
      fiber REAL DEFAULT 0,
      fat REAL DEFAULT 0,
      pati REAL DEFAULT 0,
      moisture REAL DEFAULT 0,
      dry_matter REAL DEFAULT 0,
      ash REAL DEFAULT 0,
      phos_available REAL DEFAULT 0,
      sodium REAL DEFAULT 0,
      chloride REAL DEFAULT 0,
      lysine REAL DEFAULT 0,
      methionine REAL DEFAULT 0,
      met_cys REAL DEFAULT 0,
      threonine REAL DEFAULT 0,
      tryptophan REAL DEFAULT 0,
      arginine REAL DEFAULT 0,
      isoleucine REAL DEFAULT 0,
      valine REAL DEFAULT 0,
      choline REAL DEFAULT 0,
      min_constraint REAL DEFAULT 0,
      max_constraint REAL DEFAULT 100,
      has_constraint INTEGER NOT NULL DEFAULT 0,
      is_fixed INTEGER NOT NULL DEFAULT 0,
      fixed_percent REAL DEFAULT NULL,
      icon TEXT NOT NULL DEFAULT 'grass',
      selected INTEGER NOT NULL DEFAULT 1,
      in_stock_kg REAL NOT NULL DEFAULT 0,
      tag1 TEXT DEFAULT NULL,
      tag2 TEXT DEFAULT NULL
    );

    -- Nutrisi Preset
    CREATE TABLE IF NOT EXISTS presets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      phase TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('broiler','layer','custom')),
      standard_badge TEXT NOT NULL DEFAULT 'Standar SNI',
      pk TEXT NOT NULL,
      em TEXT NOT NULL,
      ca TEXT NOT NULL,
      note TEXT DEFAULT '',
      icon TEXT NOT NULL DEFAULT 'nutrition',
      is_custom INTEGER NOT NULL DEFAULT 0,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    -- Riwayat Formula
    CREATE TABLE IF NOT EXISTS formula_history (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      batch_info TEXT NOT NULL,
      time_str TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('layak','koreksi')),
      status_label TEXT NOT NULL,
      pills TEXT NOT NULL DEFAULT '[]',
      total_weight REAL NOT NULL DEFAULT 0,
      cost_per_kg INTEGER NOT NULL DEFAULT 0,
      total_cost INTEGER NOT NULL DEFAULT 0,
      icon TEXT NOT NULL DEFAULT 'grain',
      category TEXT NOT NULL CHECK(category IN ('layak','koreksi')),
      correction_alert TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    -- Hoppers / Dispense
    CREATE TABLE IF NOT EXISTS hoppers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      ingredient_name TEXT NOT NULL,
      target_kg REAL NOT NULL DEFAULT 0,
      current_kg REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('selesai','menimbang','antrean')),
      icon TEXT NOT NULL DEFAULT 'grass'
    );

    -- Kandang & Populasi
    CREATE TABLE IF NOT EXISTS kandang (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      fase TEXT NOT NULL,
      populasi INTEGER NOT NULL DEFAULT 0,
      umur_hari INTEGER NOT NULL DEFAULT 0,
      bobot_rata_kg REAL NOT NULL DEFAULT 0
    );

    -- Data Sensor IoT
    CREATE TABLE IF NOT EXISTS sensor_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kandang_id TEXT DEFAULT 'all',
      suhu REAL NOT NULL DEFAULT 0,
      kelembaban REAL NOT NULL DEFAULT 0,
      sisa_pakan_kg REAL NOT NULL DEFAULT 0,
      target_fcr REAL NOT NULL DEFAULT 0,
      recorded_at TEXT DEFAULT (datetime('now','localtime'))
    );

    -- Jadwal Pemberian Pakan
    CREATE TABLE IF NOT EXISTS feed_schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jam TEXT NOT NULL,
      label TEXT NOT NULL,
      porsi_kg REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('selesai','standby','terjadwal')),
      notes TEXT DEFAULT ''
    );

    -- Konfigurasi Farm
    CREATE TABLE IF NOT EXISTS farm_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- Chat Messages
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL DEFAULT 'default',
      sender TEXT NOT NULL CHECK(sender IN ('user','assistant')),
      text TEXT NOT NULL,
      time_str TEXT NOT NULL,
      rich_card TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  migrateDb();
  seedIfEmpty();
}

// Run ALTER TABLE migrations for new columns on existing DB
function migrateDb() {
  const newCols = [
    'pati REAL DEFAULT 0',
    'moisture REAL DEFAULT 0',
    'dry_matter REAL DEFAULT 0',
    'ash REAL DEFAULT 0',
    'phos_available REAL DEFAULT 0',
    'sodium REAL DEFAULT 0',
    'chloride REAL DEFAULT 0',
    'met_cys REAL DEFAULT 0',
    'threonine REAL DEFAULT 0',
    'tryptophan REAL DEFAULT 0',
    'arginine REAL DEFAULT 0',
    'isoleucine REAL DEFAULT 0',
    'valine REAL DEFAULT 0',
    'choline REAL DEFAULT 0',
  ];
  for (const col of newCols) {
    try {
      db.exec(`ALTER TABLE ingredients ADD COLUMN ${col}`);
    } catch (_) { /* already exists, skip */ }
  }
  // Also fix existing nullable columns to have default 0
  try { db.exec('UPDATE ingredients SET fat = 0 WHERE fat IS NULL'); } catch (_) {}
  try { db.exec('UPDATE ingredients SET fiber = 0 WHERE fiber IS NULL'); } catch (_) {}
  try { db.exec('UPDATE ingredients SET lysine = 0 WHERE lysine IS NULL'); } catch (_) {}
  try { db.exec('UPDATE ingredients SET methionine = 0 WHERE methionine IS NULL'); } catch (_) {}
}

function upsertSheet1Ingredients() {
  const upsert = db.prepare(`
    INSERT OR REPLACE INTO ingredients
      (id,name,subname,category,default_price,current_price,
       energy,protein,fat,fiber,pati,moisture,dry_matter,ash,
       calcium,phosphorus,phos_available,sodium,chloride,
       lysine,methionine,met_cys,threonine,tryptophan,arginine,isoleucine,valine,choline,
       min_constraint,max_constraint,has_constraint,is_fixed,fixed_percent,
       icon,selected,in_stock_kg,tag1,tag2)
    VALUES
      (@id,@name,@subname,@category,@default_price,@current_price,
       @energy,@protein,@fat,@fiber,@pati,@moisture,@dry_matter,@ash,
       @calcium,@phosphorus,@phos_available,@sodium,@chloride,
       @lysine,@methionine,@met_cys,@threonine,@tryptophan,@arginine,@isoleucine,@valine,@choline,
       @min_constraint,@max_constraint,@has_constraint,@is_fixed,@fixed_percent,
       @icon,@selected,@in_stock_kg,@tag1,@tag2)
  `);

  const sheet1Ingredients = [
    { id:'jagung', name:'JAGUNG', subname:'Jagung Kuning Pipil Giling', category:'energi', default_price:5800, current_price:5800,
      energy:3350.00, protein:7.70, fat:3.70, fiber:2.30, pati:63.89, moisture:14.00, dry_matter:86.00, ash:1.30,
      calcium:0.02, phosphorus:0.24, phos_available:0.08, sodium:0.01, chloride:0.06,
      lysine:0.174, methionine:0.141, met_cys:0.282, threonine:0.206, tryptophan:0.043, arginine:0.315, isoleucine:0.217, valine:0.290, choline:505.40,
      min_constraint:40, max_constraint:65, has_constraint:1, is_fixed:0, fixed_percent:null,
      icon:'grain', selected:1, in_stock_kg:2400, tag1:'Protein 7.7%', tag2:'EM 3350 kkal' },
    { id:'dedak', name:'DEDAK PADI', subname:'Bekatul / Dedak Padi Halus', category:'energi', default_price:4100, current_price:4100,
      energy:2650.00, protein:11.20, fat:12.30, fiber:10.00, pati:29.41, moisture:11.20, dry_matter:88.80, ash:10.80,
      calcium:0.46, phosphorus:1.36, phos_available:0.13, sodium:0.01, chloride:0.05,
      lysine:0.332, methionine:0.166, met_cys:0.324, threonine:0.257, tryptophan:0.091, arginine:0.713, isoleucine:0.282, valine:0.410, choline:1073.50,
      min_constraint:0, max_constraint:20, has_constraint:0, is_fixed:0, fixed_percent:null,
      icon:'grass', selected:1, in_stock_kg:1100, tag1:'Protein 11.2%', tag2:'EM 2650 kkal' },
    { id:'sbm', name:'SBM/BK Kedelai', subname:'Bungkil Kedelai / Soybean Meal', category:'protein', default_price:9200, current_price:9200,
      energy:2235.00, protein:45.90, fat:1.10, fiber:3.90, pati:0.87, moisture:12.30, dry_matter:87.70, ash:6.90,
      calcium:0.27, phosphorus:0.64, phos_available:0.23, sodium:0.02, chloride:0.03,
      lysine:2.435, methionine:0.551, met_cys:1.102, threonine:1.503, tryptophan:0.521, arginine:3.027, isoleucine:1.834, valine:1.870, choline:2423.45,
      min_constraint:15, max_constraint:30, has_constraint:1, is_fixed:0, fixed_percent:null,
      icon:'spa', selected:1, in_stock_kg:850, tag1:'Protein 45.9%', tag2:'EM 2235 kkal' },
    { id:'mbm', name:'MBM/Tep Daging Tulang', subname:'Meat Bone Meal / Tepung Daging Tulang', category:'protein', default_price:11500, current_price:11500,
      energy:2450.00, protein:49.10, fat:7.60, fiber:0.73, pati:0.00, moisture:5.90, dry_matter:94.10, ash:32.00,
      calcium:9.82, phosphorus:4.96, phos_available:4.96, sodium:0.60, chloride:0.35,
      lysine:1.724, methionine:0.447, met_cys:0.666, threonine:1.015, tryptophan:0.185, arginine:2.979, isoleucine:0.971, valine:1.350, choline:1900.00,
      min_constraint:0, max_constraint:6, has_constraint:0, is_fixed:0, fixed_percent:null,
      icon:'pets', selected:1, in_stock_kg:280, tag1:'Protein 49.1%', tag2:'Ca 9.82%' },
    { id:'cpo', name:'Crude Palm Oil', subname:'Minyak Sawit Kasar / CPO', category:'energi', default_price:13000, current_price:13000,
      energy:8600.00, protein:0.00, fat:99.00, fiber:0.00, pati:0.00, moisture:0.50, dry_matter:99.50, ash:0.50,
      calcium:0.00, phosphorus:0.00, phos_available:0.00, sodium:0.00, chloride:0.00,
      lysine:0.00, methionine:0.00, met_cys:0.00, threonine:0.00, tryptophan:0.00, arginine:0.00, isoleucine:0.00, valine:0.00, choline:0.00,
      min_constraint:0, max_constraint:4, has_constraint:0, is_fixed:0, fixed_percent:null,
      icon:'water_drop', selected:1, in_stock_kg:400, tag1:'Lemak 99%', tag2:'EM 8600 kkal' },
    { id:'limestone', name:'LIMESTONE/Batu Kapur', subname:'Batu Kapur / Kalsium Karbonat', category:'mineral', default_price:400, current_price:400,
      energy:0.00, protein:0.00, fat:0.00, fiber:0.00, pati:0.00, moisture:1.00, dry_matter:99.00, ash:99.00,
      calcium:38.00, phosphorus:0.00, phos_available:0.00, sodium:0.10, chloride:0.00,
      lysine:0.00, methionine:0.00, met_cys:0.00, threonine:0.00, tryptophan:0.00, arginine:0.00, isoleucine:0.00, valine:0.00, choline:0.00,
      min_constraint:0, max_constraint:10, has_constraint:0, is_fixed:0, fixed_percent:null,
      icon:'diamond', selected:1, in_stock_kg:500, tag1:'Ca 38%', tag2:'Mineral' },
    { id:'dcp', name:'DCP', subname:'Dicalcium Phosphate / Fosfor Tersedia', category:'mineral', default_price:18000, current_price:18000,
      energy:0.00, protein:0.00, fat:0.00, fiber:0.00, pati:0.00, moisture:1.00, dry_matter:99.00, ash:99.00,
      calcium:24.00, phosphorus:18.00, phos_available:18.00, sodium:0.00, chloride:0.00,
      lysine:0.00, methionine:0.00, met_cys:0.00, threonine:0.00, tryptophan:0.00, arginine:0.00, isoleucine:0.00, valine:0.00, choline:0.00,
      min_constraint:0, max_constraint:3, has_constraint:0, is_fixed:0, fixed_percent:null,
      icon:'diamond', selected:1, in_stock_kg:200, tag1:'P Av 18%', tag2:'Ca 24%' },
    { id:'l-lysine', name:'L-LYSINE', subname:'L-Lisina Sintetis (78.95% Lys)', category:'aditif', default_price:23000, current_price:23000,
      energy:3728.00, protein:94.50, fat:0.00, fiber:0.00, pati:0.00, moisture:1.00, dry_matter:99.00, ash:20.00,
      calcium:0.00, phosphorus:0.00, phos_available:0.00, sodium:0.00, chloride:19.00,
      lysine:78.95, methionine:0.00, met_cys:0.00, threonine:0.00, tryptophan:0.00, arginine:0.00, isoleucine:0.00, valine:0.00, choline:0.00,
      min_constraint:0, max_constraint:1, has_constraint:0, is_fixed:0, fixed_percent:null,
      icon:'medication', selected:1, in_stock_kg:50, tag1:'Lysine 78.95%', tag2:'Aditif Murni' },
    { id:'dl-methionine', name:'DL-METHIONINE', subname:'DL-Metionina Sintetis (98.98% Met)', category:'aditif', default_price:90000, current_price:90000,
      energy:3652.00, protein:58.00, fat:0.00, fiber:0.00, pati:0.00, moisture:1.00, dry_matter:99.00, ash:0.00,
      calcium:0.00, phosphorus:0.00, phos_available:0.00, sodium:0.00, chloride:0.00,
      lysine:0.00, methionine:98.98, met_cys:98.98, threonine:0.00, tryptophan:0.00, arginine:0.00, isoleucine:0.00, valine:0.00, choline:0.00,
      min_constraint:0, max_constraint:1, has_constraint:0, is_fixed:0, fixed_percent:null,
      icon:'medication', selected:1, in_stock_kg:30, tag1:'Met 98.98%', tag2:'Aditif Murni' },
    { id:'l-threonine', name:'L-THREONINE', subname:'L-Treonina Sintetis (97.99% Thr)', category:'aditif', default_price:28000, current_price:28000,
      energy:3375.00, protein:72.50, fat:0.00, fiber:0.00, pati:0.00, moisture:1.00, dry_matter:99.00, ash:0.00,
      calcium:0.00, phosphorus:0.00, phos_available:0.00, sodium:0.00, chloride:0.00,
      lysine:0.00, methionine:0.00, met_cys:0.00, threonine:97.99, tryptophan:0.00, arginine:0.00, isoleucine:0.00, valine:0.00, choline:0.00,
      min_constraint:0, max_constraint:1, has_constraint:0, is_fixed:0, fixed_percent:null,
      icon:'medication', selected:1, in_stock_kg:20, tag1:'Thr 97.99%', tag2:'Aditif Murni' },
    { id:'l-tryptophan', name:'L-TRYPTOPHAN', subname:'L-Triptofan Sintetis (97.9% Trp)', category:'aditif', default_price:115000, current_price:115000,
      energy:4027.00, protein:84.00, fat:0.00, fiber:0.00, pati:0.00, moisture:1.00, dry_matter:99.00, ash:0.00,
      calcium:0.00, phosphorus:0.00, phos_available:0.00, sodium:0.00, chloride:0.00,
      lysine:0.00, methionine:0.00, met_cys:0.00, threonine:0.00, tryptophan:97.90, arginine:0.00, isoleucine:0.00, valine:0.00, choline:0.00,
      min_constraint:0, max_constraint:0.5, has_constraint:0, is_fixed:0, fixed_percent:null,
      icon:'medication', selected:1, in_stock_kg:5, tag1:'Trp 97.9%', tag2:'Aditif Murni' },
    { id:'l-arginine', name:'L-ARGININE', subname:'L-Arginin Sintetis (99% Arg)', category:'aditif', default_price:95000, current_price:95000,
      energy:3074.00, protein:201.00, fat:0.00, fiber:0.00, pati:0.00, moisture:1.00, dry_matter:99.00, ash:0.00,
      calcium:0.00, phosphorus:0.00, phos_available:0.00, sodium:0.00, chloride:0.00,
      lysine:0.00, methionine:0.00, met_cys:0.00, threonine:0.00, tryptophan:0.00, arginine:99.00, isoleucine:0.00, valine:0.00, choline:0.00,
      min_constraint:0, max_constraint:0.5, has_constraint:0, is_fixed:0, fixed_percent:null,
      icon:'medication', selected:1, in_stock_kg:10, tag1:'Arg 99%', tag2:'Aditif Murni' },
    { id:'l-isoleucine', name:'L-ISOLEUCINE', subname:'L-Isoleusin Sintetis (99% Ile)', category:'aditif', default_price:65000, current_price:65000,
      energy:5772.00, protein:66.00, fat:0.00, fiber:0.00, pati:0.00, moisture:1.00, dry_matter:99.00, ash:0.00,
      calcium:0.00, phosphorus:0.00, phos_available:0.00, sodium:0.00, chloride:0.00,
      lysine:0.00, methionine:0.00, met_cys:0.00, threonine:0.00, tryptophan:0.00, arginine:0.00, isoleucine:99.00, valine:0.00, choline:0.00,
      min_constraint:0, max_constraint:0.5, has_constraint:0, is_fixed:0, fixed_percent:null,
      icon:'medication', selected:1, in_stock_kg:5, tag1:'Ile 99%', tag2:'Aditif Murni' },
    { id:'l-valine', name:'L-VALINE', subname:'L-Valin Sintetis (99% Val)', category:'aditif', default_price:45000, current_price:45000,
      energy:5045.00, protein:74.00, fat:0.00, fiber:0.00, pati:0.00, moisture:1.00, dry_matter:99.00, ash:0.00,
      calcium:0.00, phosphorus:0.00, phos_available:0.00, sodium:0.00, chloride:0.00,
      lysine:0.00, methionine:0.00, met_cys:0.00, threonine:0.00, tryptophan:0.00, arginine:0.00, isoleucine:0.00, valine:99.00, choline:0.00,
      min_constraint:0, max_constraint:0.5, has_constraint:0, is_fixed:0, fixed_percent:null,
      icon:'medication', selected:1, in_stock_kg:10, tag1:'Val 99%', tag2:'Aditif Murni' },
    { id:'choline-60', name:'CHOLINE 60%', subname:'Kolin Klorida 60% (Choline 517.241 mg/kg)', category:'aditif', default_price:19000, current_price:19000,
      energy:0.00, protein:0.00, fat:0.00, fiber:0.00, pati:0.00, moisture:1.00, dry_matter:99.00, ash:0.00,
      calcium:0.00, phosphorus:0.00, phos_available:0.00, sodium:0.00, chloride:0.00,
      lysine:0.00, methionine:0.00, met_cys:0.00, threonine:0.00, tryptophan:0.00, arginine:0.00, isoleucine:0.00, valine:0.00, choline:517241.38,
      min_constraint:0, max_constraint:0.5, has_constraint:0, is_fixed:0, fixed_percent:null,
      icon:'science', selected:1, in_stock_kg:50, tag1:'Kolin 60%', tag2:'Aditif' },
    { id:'garam', name:'GARAM', subname:'Sodium Klorida / NaCl Pakan (Na 38.9%, Cl 60.1%)', category:'mineral', default_price:3000, current_price:3000,
      energy:0.00, protein:0.00, fat:0.00, fiber:0.00, pati:0.00, moisture:1.00, dry_matter:99.00, ash:99.00,
      calcium:0.00, phosphorus:0.00, phos_available:0.00, sodium:38.90, chloride:60.10,
      lysine:0.00, methionine:0.00, met_cys:0.00, threonine:0.00, tryptophan:0.00, arginine:0.00, isoleucine:0.00, valine:0.00, choline:0.00,
      min_constraint:0, max_constraint:1, has_constraint:0, is_fixed:0, fixed_percent:null,
      icon:'diamond', selected:1, in_stock_kg:100, tag1:'Na 38.9%', tag2:'Cl 60.1%' },
    { id:'sodium-bicarb', name:'SODIUM-BICARB', subname:'Natrium Bikarbonat / Soda Kue Pakan (Na 26.8%)', category:'mineral', default_price:5000, current_price:5000,
      energy:0.00, protein:0.00, fat:0.00, fiber:0.00, pati:0.00, moisture:0.50, dry_matter:99.50, ash:27.30,
      calcium:0.00, phosphorus:0.00, phos_available:0.00, sodium:26.80, chloride:0.00,
      lysine:0.00, methionine:0.00, met_cys:0.00, threonine:0.00, tryptophan:0.00, arginine:0.00, isoleucine:0.00, valine:0.00, choline:0.00,
      min_constraint:0, max_constraint:1, has_constraint:0, is_fixed:0, fixed_percent:null,
      icon:'diamond', selected:1, in_stock_kg:50, tag1:'Na 26.8%', tag2:'Alkali' },
    { id:'premix', name:'VIT MIN PREMIX', subname:'Vitamin Mineral Premix Broiler/Layer', category:'aditif', default_price:50000, current_price:50000,
      energy:0.00, protein:0.00, fat:0.00, fiber:0.00, pati:0.00, moisture:0.00, dry_matter:0.00, ash:0.00,
      calcium:0.00, phosphorus:0.00, phos_available:0.00, sodium:0.00, chloride:0.00,
      lysine:0.00, methionine:0.00, met_cys:0.00, threonine:0.00, tryptophan:0.00, arginine:0.00, isoleucine:0.00, valine:0.00, choline:0.00,
      min_constraint:0, max_constraint:2.5, has_constraint:0, is_fixed:0, fixed_percent:null,
      icon:'science', selected:1, in_stock_kg:150, tag1:'Vitamix Komplet', tag2:'Dosis 2.5%' },
  ];

  const doUpsert = db.transaction(() => sheet1Ingredients.forEach(i => upsert.run(i)));
  doUpsert();
  console.log(`[DB] Upserted ${sheet1Ingredients.length} Sheet1 ingredients.`);
}

function seedIfEmpty() {
  const count = (db.prepare('SELECT COUNT(*) as c FROM ingredients').get() as any).c;
  if (count > 0) {
    // Data exists; run upsert to bring new nutrient values in
    upsertSheet1Ingredients();
    return;
  }

  console.log('[DB] Seeding initial data...');
  upsertSheet1Ingredients();

  // Seed presets
  const insertPreset = db.prepare(`
    INSERT OR REPLACE INTO presets (id,title,phase,category,standard_badge,pk,em,ca,note,icon,is_custom,is_favorite)
    VALUES (@id,@title,@phase,@category,@standard_badge,@pk,@em,@ca,@note,@icon,@is_custom,@is_favorite)
  `);
  const presets = [
    // Broiler (Ayam Pedaging) - Sesuai Spek CSV
    { id:'p-broiler-starter', title:'Broiler Starter', phase:'0–12 hari', category:'broiler', standard_badge:'Spek Resmi CSV', pk:'21.0%', em:'2.900 kkal', ca:'0.96 - 1.00%', note:'Fase brooding awal pembentukan organ & tulang', icon:'grain', is_custom:0, is_favorite:0 },
    { id:'p-broiler-grower', title:'Broiler Grower', phase:'13–28 hari', category:'broiler', standard_badge:'Spek Resmi CSV', pk:'19.0%', em:'2.950 kkal', ca:'0.80 - 1.00%', note:'Fase pembesaran pesat & perkembangan daging', icon:'grain', is_custom:0, is_favorite:0 },
    { id:'p-broiler-finisher', title:'Broiler Finisher', phase:'29–panen', category:'broiler', standard_badge:'Spek Resmi CSV', pk:'18.0%', em:'3.050 kkal', ca:'0.74 - 1.00%', note:'Fase pemadatan bobot akhir menjelang panen', icon:'grain', is_custom:0, is_favorite:0 },
    // Layer (Ayam Petelur) - Sesuai Spek CSV
    { id:'p-layer-starter', title:'Layer Starter', phase:'0–5 minggu', category:'layer', standard_badge:'Spek Resmi CSV', pk:'20.5%', em:'2.950 kkal', ca:'0.80 - 1.10%', note:'Pertumbuhan kerangka dasar anak ayam petelur', icon:'egg', is_custom:0, is_favorite:0 },
    { id:'p-layer-grower', title:'Layer Grower', phase:'6–10 minggu', category:'layer', standard_badge:'Spek Resmi CSV', pk:'19.0%', em:'2.850 kkal', ca:'0.70 - 1.00%', note:'Pembentukan keseragaman bobot pullet dara', icon:'egg', is_custom:0, is_favorite:0 },
    { id:'p-layer-developer', title:'Layer Developer', phase:'11–15 minggu', category:'layer', standard_badge:'Spek Resmi CSV', pk:'16.4%', em:'2.700 kkal', ca:'0.70 - 1.00%', note:'Pematangan saluran reproduksi calon petelur', icon:'egg', is_custom:0, is_favorite:0 },
    { id:'p-layer-prelayer', title:'Pre-Layer', phase:'16–18 minggu', category:'layer', standard_badge:'Spek Resmi CSV', pk:'16.8%', em:'2.700 kkal', ca:'2.20 - 2.50%', note:'Kalsifikasi awal persiapan produksi telur', icon:'egg', is_custom:0, is_favorite:0 },
    { id:'p-layer-1', title:'Layer-1 (Peak Production)', phase:'18–45 minggu', category:'layer', standard_badge:'Spek Resmi CSV', pk:'17.5%', em:'2.700–2.800 kkal', ca:'3.80%', note:'Puncak bertelur dengan cangkang kokoh prima', icon:'egg', is_custom:0, is_favorite:0 },
    { id:'p-layer-2', title:'Layer-2', phase:'45–80 minggu', category:'layer', standard_badge:'Spek Resmi CSV', pk:'17.0%', em:'2.700–2.800 kkal', ca:'3.90%', note:'Pemeliharaan persistensi produksi telur pasca-peak', icon:'egg', is_custom:0, is_favorite:0 },
    { id:'p-layer-3', title:'Layer-3', phase:'> 80 minggu', category:'layer', standard_badge:'Spek Resmi CSV', pk:'16.0%', em:'2.700–2.800 kkal', ca:'4.00%', note:'Fase akhir produksi dengan kalsium ekstra tinggi', icon:'egg', is_custom:0, is_favorite:0 },
    // Custom Peternak
    { id:'p-custom-hemat', title:'Hemat Broiler Mandiri', phase:'13–28 hari', category:'custom', standard_badge:'Custom Peternak', pk:'19.2%', em:'2.980 kkal', ca:'0.90%', note:'Formula racik hemat biaya kandang sendiri', icon:'star', is_custom:1, is_favorite:1 },
  ];
  const seedPresets = db.transaction(() => presets.forEach(p => insertPreset.run(p)));
  seedPresets();

  // Seed formula history
  const insertHist = db.prepare(`
    INSERT INTO formula_history (id,title,batch_info,time_str,status,status_label,pills,total_weight,cost_per_kg,total_cost,icon,category,correction_alert)
    VALUES (@id,@title,@batch_info,@time_str,@status,@status_label,@pills,@total_weight,@cost_per_kg,@total_cost,@icon,@category,@correction_alert)
  `);
  const history = [
    { id:'hist-1', title:'Broiler Finisher 500 kg', batch_info:'Batch #14 • Kandang A (32 Hari)', time_str:'Hari ini, 09:30 WIB', status:'layak', status_label:'Layak SNI', pills:JSON.stringify(['Jagung 52%','SBM 20%','Dedak 20%','Premix 8%']), total_weight:500, cost_per_kg:6850, total_cost:3425000, icon:'grain', category:'layak', correction_alert:null },
    { id:'hist-2', title:'Broiler Starter Premium', batch_info:'Batch #13 • Kandang B (Fase Awal)', time_str:'12 Okt 2024, 14:15 WIB', status:'layak', status_label:'Layak SNI', pills:JSON.stringify(['Jagung 48%','SBM 28%','Minyak Ikan 4%','Asam Amino 2%']), total_weight:250, cost_per_kg:7100, total_cost:1775000, icon:'egg_alt', category:'layak', correction_alert:null },
    { id:'hist-3', title:'Layer Masa Pullet (14 Mgg)', batch_info:'Eksperimen #02 • Ras Lohmann Brown', time_str:'08 Okt 2024, 11:00 WIB', status:'koreksi', status_label:'Perlu Koreksi', pills:JSON.stringify(['Jagung 60%','Dedak 25%','SBM 15%']), total_weight:100, cost_per_kg:5950, total_cost:595000, icon:'science', category:'koreksi', correction_alert:'Defisit Kalsium 0.4% — Tambahkan tepung cangkang kerang sebelum mixing.' },
  ];
  const seedHist = db.transaction(() => history.forEach(h => insertHist.run(h)));
  seedHist();

  // Seed hoppers
  const insertHopper = db.prepare(`
    INSERT INTO hoppers (id,name,ingredient_name,target_kg,current_kg,status,icon)
    VALUES (@id,@name,@ingredient_name,@target_kg,@current_kg,@status,@icon)
  `);
  const hoppers = [
    { id:1, name:'Hopper 1: Jagung Kuning', ingredient_name:'Jagung Kuning', target_kg:260.0, current_kg:260.0, status:'selesai', icon:'grain' },
    { id:2, name:'Hopper 2: Bungkil Kedelai', ingredient_name:'Bungkil Kedelai (SBM)', target_kg:100.0, current_kg:52.5, status:'menimbang', icon:'eco' },
    { id:3, name:'Hopper 3: Dedak Padi', ingredient_name:'Dedak Padi Halus', target_kg:100.0, current_kg:0.0, status:'antrean', icon:'spa' },
    { id:4, name:'Hopper 4: Mikro & Premix', ingredient_name:'Premix & Mineral', target_kg:40.0, current_kg:0.0, status:'antrean', icon:'medication' },
  ];
  const seedHoppers = db.transaction(() => hoppers.forEach(h => insertHopper.run(h)));
  seedHoppers();

  // Seed kandang
  const insertKandang = db.prepare(`
    INSERT INTO kandang (id,nama,fase,populasi,umur_hari,bobot_rata_kg)
    VALUES (@id,@nama,@fase,@populasi,@umur_hari,@bobot_rata_kg)
  `);
  const kandangs = [
    { id:'kandang-a', nama:'Kandang A', fase:'Fase Finisher', populasi:2500, umur_hari:32, bobot_rata_kg:1.85 },
    { id:'kandang-b', nama:'Kandang B', fase:'Fase Grower', populasi:1800, umur_hari:14, bobot_rata_kg:0.52 },
  ];
  const seedKandang = db.transaction(() => kandangs.forEach(k => insertKandang.run(k)));
  seedKandang();

  // Seed sensor data
  db.prepare(`
    INSERT INTO sensor_data (kandang_id,suhu,kelembaban,sisa_pakan_kg,target_fcr)
    VALUES ('all',29.4,68,1250,1.48)
  `).run();

  // Seed feed schedule
  const insertSchedule = db.prepare(`
    INSERT INTO feed_schedule (jam,label,porsi_kg,status,notes)
    VALUES (@jam,@label,@porsi_kg,@status,@notes)
  `);
  const schedules = [
    { jam:'07:00', label:'Pemberian Pagi (Kandang A & B)', porsi_kg:150, status:'selesai', notes:'Porsi 150 kg Broiler Finisher' },
    { jam:'12:00', label:'Pemberian Siang', porsi_kg:150, status:'selesai', notes:'Porsi 150 kg + Elektrolit Air Minum' },
    { jam:'16:30', label:'Pemberian Sore', porsi_kg:200, status:'standby', notes:'Porsi 200 kg Menjelang Istirahat' },
  ];
  const seedSchedules = db.transaction(() => schedules.forEach(s => insertSchedule.run(s)));
  seedSchedules();

  // Seed farm config
  const insertConfig = db.prepare('INSERT OR REPLACE INTO farm_config (key,value) VALUES (?,?)');
  const configs = [
    ['farm_name', 'Peternakan Berkah Sejahtera'],
    ['farm_location', 'Blitar'],
    ['owner_name', 'Pak Budi'],
    ['iot_status', 'terhubung'],
    ['app_version', 'v1.4.0'],
  ];
  const seedConfigs = db.transaction(() => configs.forEach(([k,v]) => insertConfig.run(k,v)));
  seedConfigs();

  console.log('[DB] Seed complete.');
}

