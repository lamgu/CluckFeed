import { PresetItem } from '../types';

export interface SpekColumn {
  id: string;
  name: string;
  ageRange: string;
  category: 'broiler' | 'layer';
  em: string;
  pk: string;
  pati: string;
  ca: string;
  pTotal: string;
  pAvailable: string;
  na: string;
  cl: string;
  lysine: string;
  methionine: string;
  metCys: string;
  threonine: string;
  tryptophane: string;
  arginine: string;
  isoleucine: string;
  valine: string;
  choline: string;
}

export const BROILER_SPEK_COLUMNS: SpekColumn[] = [
  {
    id: 'broiler-starter',
    name: 'Starter',
    ageRange: '0–12 hari',
    category: 'broiler',
    em: '2.900 kkal',
    pk: '21.0%',
    pati: '37.0%',
    ca: '0.96 - 1.00%',
    pTotal: '0.60%',
    pAvailable: '0.58%',
    na: '0.18 - 0.20%',
    cl: '0.18 - 0.30%',
    lysine: '1.26%',
    methionine: '0.48%',
    metCys: '0.94%',
    threonine: '0.86%',
    tryptophane: '0.21%',
    arginine: '1.36%',
    isoleucine: '0.81%',
    valine: '0.96%',
    choline: '1.600 mg/kg'
  },
  {
    id: 'broiler-grower',
    name: 'Grower',
    ageRange: '13–28 hari',
    category: 'broiler',
    em: '2.950 kkal',
    pk: '19.0%',
    pati: '36.0%',
    ca: '0.80 - 1.00%',
    pTotal: '0.60%',
    pAvailable: '0.50%',
    na: '0.18 - 0.20%',
    cl: '0.18 - 0.30%',
    lysine: '1.16%',
    methionine: '0.47%',
    metCys: '0.88%',
    threonine: '0.78%',
    tryptophane: '0.20%',
    arginine: '1.25%',
    isoleucine: '0.75%',
    valine: '0.88%',
    choline: '1.600 mg/kg'
  },
  {
    id: 'broiler-finisher',
    name: 'Finisher',
    ageRange: '29–panen',
    category: 'broiler',
    em: '3.050 kkal',
    pk: '18.0%',
    pati: '36.0%',
    ca: '0.74 - 1.00%',
    pTotal: '0.60%',
    pAvailable: '0.37%',
    na: '0.18 - 0.20%',
    cl: '0.18 - 0.30%',
    lysine: '1.06%',
    methionine: '0.44%',
    metCys: '0.82%',
    threonine: '0.70%',
    tryptophane: '0.19%',
    arginine: '1.16%',
    isoleucine: '0.69%',
    valine: '0.82%',
    choline: '1.600 mg/kg'
  }
];

export const LAYER_SPEK_COLUMNS: SpekColumn[] = [
  {
    id: 'layer-starter',
    name: 'Starter',
    ageRange: '0–5 minggu',
    category: 'layer',
    em: '2.950 kkal',
    pk: '20.5%',
    pati: '37.0%',
    ca: '0.80 - 1.10%',
    pTotal: '0.60%',
    pAvailable: '0.44%',
    na: '0.18%',
    cl: '0.16 - 0.21%',
    lysine: '1.03%',
    methionine: '0.56%',
    metCys: '0.89%',
    threonine: '0.71%',
    tryptophane: '0.23%',
    arginine: '1.08%',
    isoleucine: '0.77%',
    valine: '0.87%',
    choline: '1.600 mg/kg'
  },
  {
    id: 'layer-grower',
    name: 'Grower',
    ageRange: '6–10 minggu',
    category: 'layer',
    em: '2.850 kkal',
    pk: '19.0%',
    pati: '36.0%',
    ca: '0.70 - 1.00%',
    pTotal: '0.60%',
    pAvailable: '0.39%',
    na: '0.18%',
    cl: '0.16 - 0.21%',
    lysine: '0.87%',
    methionine: '0.45%',
    metCys: '0.75%',
    threonine: '0.60%',
    tryptophane: '0.19%',
    arginine: '0.91%',
    isoleucine: '0.65%',
    valine: '0.74%',
    choline: '1.600 mg/kg'
  },
  {
    id: 'layer-developer',
    name: 'Developer',
    ageRange: '11–15 minggu',
    category: 'layer',
    em: '2.700 kkal',
    pk: '16.4%',
    pati: '36.0%',
    ca: '0.70 - 1.00%',
    pTotal: '0.60%',
    pAvailable: '0.38%',
    na: '0.17%',
    cl: '0.16 - 0.21%',
    lysine: '0.67%',
    methionine: '0.36%',
    metCys: '0.59%',
    threonine: '0.46%',
    tryptophane: '0.16%',
    arginine: '0.71%',
    isoleucine: '0.52%',
    valine: '0.58%',
    choline: '1.500 mg/kg'
  },
  {
    id: 'layer-prelayer',
    name: 'Pre-Layer',
    ageRange: '16–18 minggu',
    category: 'layer',
    em: '2.700 kkal',
    pk: '16.8%',
    pati: '36.0%',
    ca: '2.20 - 2.50%',
    pTotal: '0.60%',
    pAvailable: '0.38%',
    na: '0.16%',
    cl: '0.16 - 0.21%',
    lysine: '0.73%',
    methionine: '0.39%',
    metCys: '0.62%',
    threonine: '0.50%',
    tryptophane: '0.17%',
    arginine: '0.75%',
    isoleucine: '0.57%',
    valine: '0.77%',
    choline: '1.400 mg/kg'
  },
  {
    id: 'layer-1',
    name: 'Layer-1 (Peak)',
    ageRange: '18–45 minggu',
    category: 'layer',
    em: '2.700–2.800 kkal',
    pk: '17.5%',
    pati: '35.0%',
    ca: '3.80%',
    pTotal: '0.60%',
    pAvailable: '0.35%',
    na: '0.16%',
    cl: '0.16 - 0.21%',
    lysine: '0.78%',
    methionine: '0.39%',
    metCys: '0.71%',
    threonine: '0.546%',
    tryptophane: '0.172%',
    arginine: '0.811%',
    isoleucine: '0.624%',
    valine: '0.686%',
    choline: '1.400 mg/kg'
  },
  {
    id: 'layer-2',
    name: 'Layer-2',
    ageRange: '45–80 minggu',
    category: 'layer',
    em: '2.700–2.800 kkal',
    pk: '17.0%',
    pati: '35.0%',
    ca: '3.90%',
    pTotal: '0.60%',
    pAvailable: '0.34%',
    na: '0.16%',
    cl: '0.16 - 0.21%',
    lysine: '0.76%',
    methionine: '0.38%',
    metCys: '0.692%',
    threonine: '0.532%',
    tryptophane: '0.167%',
    arginine: '0.790%',
    isoleucine: '0.608%',
    valine: '0.669%',
    choline: '1.400 mg/kg'
  },
  {
    id: 'layer-3',
    name: 'Layer-3',
    ageRange: '> 80 minggu',
    category: 'layer',
    em: '2.700–2.800 kkal',
    pk: '16.0%',
    pati: '35.0%',
    ca: '4.00%',
    pTotal: '0.60%',
    pAvailable: '0.32%',
    na: '0.16%',
    cl: '0.16 - 0.21%',
    lysine: '0.74%',
    methionine: '0.37%',
    metCys: '0.673%',
    threonine: '0.518%',
    tryptophane: '0.163%',
    arginine: '0.770%',
    isoleucine: '0.592%',
    valine: '0.651%',
    choline: '1.400 mg/kg'
  }
];

export interface NutrientRowDefinition {
  key: keyof Omit<SpekColumn, 'id' | 'name' | 'ageRange' | 'category'>;
  label: string;
  unit: string;
  description: string;
}

export const NUTRIENT_ROWS: NutrientRowDefinition[] = [
  { key: 'em', label: 'Energi Metabolis (EM)', unit: 'kkal/kg', description: 'Kebutuhan energi aktivitas & pertumbuhan' },
  { key: 'pk', label: 'Protein Kasar (min)', unit: '%', description: 'Pembentukan otot dada dan jaringan tubuh' },
  { key: 'pati', label: 'Pati', unit: '%', description: 'Karbohidrat utama pakan' },
  { key: 'ca', label: 'Calcium (min-max)', unit: '%', description: 'Struktur rangka tulang dan cangkang telur' },
  { key: 'pTotal', label: 'Phosphore Total', unit: '%', description: 'Total fosfor dalam ransum' },
  { key: 'pAvailable', label: 'Phosphore Available (aP)', unit: '%', description: 'Fosfor yang dapat diserap tubuh ternak' },
  { key: 'na', label: 'Natrium (min-max)', unit: '%', description: 'Keseimbangan elektrolit cairan' },
  { key: 'cl', label: 'Clorida (min-max)', unit: '%', description: 'Keseimbangan asam-basa' },
  { key: 'lysine', label: 'Lysine tercerna', unit: '%', description: 'Asam amino esensial utama pembentuk daging' },
  { key: 'methionine', label: 'Methionine tercerna', unit: '%', description: 'Asam amino pertumbuhan bulu & metabolisme' },
  { key: 'metCys', label: 'Met + Cys tercerna', unit: '%', description: 'Total asam amino bersulfur' },
  { key: 'threonine', label: 'Threonine tercerna', unit: '%', description: 'Kesehatan saluran cerna & imunitas' },
  { key: 'tryptophane', label: 'Tryptophane tercerna', unit: '%', description: 'Pengatur nafsu makan & saraf' },
  { key: 'arginine', label: 'Arginine tercerna', unit: '%', description: 'Dukungan vaskular & performa' },
  { key: 'isoleucine', label: 'Isoleucine tercerna', unit: '%', description: 'Pertumbuhan jaringan otot' },
  { key: 'valine', label: 'Valine tercerna', unit: '%', description: 'Daya tahan otot & koordinasi' },
  { key: 'choline', label: 'Choline', unit: 'mg/kg', description: 'Mencegah perosis & penimbunan lemak hati' },
];

export const SPEK_CSV_PRESETS: PresetItem[] = [
  // Broiler
  {
    id: 'p-broiler-starter',
    title: 'Broiler Starter',
    phase: '0–12 hari',
    category: 'broiler',
    standardBadge: 'Spek Resmi CSV',
    pk: '21.0%',
    em: '2.900 kkal',
    ca: '0.96 - 1.00%',
    note: 'Fase brooding awal pembentukan organ & tulang',
    icon: 'grain'
  },
  {
    id: 'p-broiler-grower',
    title: 'Broiler Grower',
    phase: '13–28 hari',
    category: 'broiler',
    standardBadge: 'Spek Resmi CSV',
    pk: '19.0%',
    em: '2.950 kkal',
    ca: '0.80 - 1.00%',
    note: 'Fase pembesaran pesat & perkembangan daging',
    icon: 'grain'
  },
  {
    id: 'p-broiler-finisher',
    title: 'Broiler Finisher',
    phase: '29–panen',
    category: 'broiler',
    standardBadge: 'Spek Resmi CSV',
    pk: '18.0%',
    em: '3.050 kkal',
    ca: '0.74 - 1.00%',
    note: 'Fase pemadatan bobot akhir menjelang panen',
    icon: 'grain'
  },
  // Layer
  {
    id: 'p-layer-starter',
    title: 'Layer Starter',
    phase: '0–5 minggu',
    category: 'layer',
    standardBadge: 'Spek Resmi CSV',
    pk: '20.5%',
    em: '2.950 kkal',
    ca: '0.80 - 1.10%',
    note: 'Pertumbuhan kerangka dasar anak ayam petelur',
    icon: 'egg'
  },
  {
    id: 'p-layer-grower',
    title: 'Layer Grower',
    phase: '6–10 minggu',
    category: 'layer',
    standardBadge: 'Spek Resmi CSV',
    pk: '19.0%',
    em: '2.850 kkal',
    ca: '0.70 - 1.00%',
    note: 'Pembentukan keseragaman bobot pullet dara',
    icon: 'egg'
  },
  {
    id: 'p-layer-developer',
    title: 'Layer Developer',
    phase: '11–15 minggu',
    category: 'layer',
    standardBadge: 'Spek Resmi CSV',
    pk: '16.4%',
    em: '2.700 kkal',
    ca: '0.70 - 1.00%',
    note: 'Pematangan saluran reproduksi calon petelur',
    icon: 'egg'
  },
  {
    id: 'p-layer-prelayer',
    title: 'Pre-Layer',
    phase: '16–18 minggu',
    category: 'layer',
    standardBadge: 'Spek Resmi CSV',
    pk: '16.8%',
    em: '2.700 kkal',
    ca: '2.20 - 2.50%',
    note: 'Kalsifikasi awal persiapan produksi telur',
    icon: 'egg'
  },
  {
    id: 'p-layer-1',
    title: 'Layer-1 (Peak Production)',
    phase: '18–45 minggu',
    category: 'layer',
    standardBadge: 'Spek Resmi CSV',
    pk: '17.5%',
    em: '2.700–2.800 kkal',
    ca: '3.80%',
    note: 'Puncak bertelur dengan cangkang kokoh prima',
    icon: 'egg'
  },
  {
    id: 'p-layer-2',
    title: 'Layer-2',
    phase: '45–80 minggu',
    category: 'layer',
    standardBadge: 'Spek Resmi CSV',
    pk: '17.0%',
    em: '2.700–2.800 kkal',
    ca: '3.90%',
    note: 'Pemeliharaan persistensi produksi telur pasca-peak',
    icon: 'egg'
  },
  {
    id: 'p-layer-3',
    title: 'Layer-3',
    phase: '> 80 minggu',
    category: 'layer',
    standardBadge: 'Spek Resmi CSV',
    pk: '16.0%',
    em: '2.700–2.800 kkal',
    ca: '4.00%',
    note: 'Fase akhir produksi dengan kalsium ekstra tinggi',
    icon: 'egg'
  }
];

