/**
 * Farmer Trades — Core Agricultural Dataset
 * Includes Crop Encyclopedia, Verified Produce Listings, Farmers Directory,
 * and APMC Market Price Series for line charts and comparisons.
 */

export interface CropInfo {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  season: string;
  durationDays?: string;
  sowingPeriod: string;
  soilType: string;
  climate: string;
  waterRequirement?: string;
  averageYieldPerAcre?: string;
  yieldPerAcre: string;
  benchmarkMsp?: number; // ₹/quintal
  benchmarkPricePerQuintal: number; // ₹/quintal
  currentMandiAvg: number; // ₹/quintal
  varieties: string[];
  description: string;
  imageUrl: string;
}

export interface ProduceListingItem {
  id: string;
  title: string;
  cropName: string;
  category: string;
  variety: string;
  quantityQuintals?: number;
  quantityKg?: number;
  quantityAvailableQuintals: number;
  minOrderQuintals: number;
  pricePerQuintal: number;
  pricePerKg?: number;
  qualityGrade?: 'Grade A (Export)' | 'Grade A' | 'Grade B' | 'Fair Average Quality';
  grade: 'A' | 'B' | 'Premium';
  organicStatus?: 'Certified Organic' | 'Natural Farming' | 'Conventional';
  organic: boolean;
  state: string;
  district: string;
  village?: string;
  talukOrVillage?: string;
  mandiName: string;
  harvestDate: string;
  farmerId?: string;
  farmerName: string;
  farmerPhone: string;
  farmerVerified?: boolean;
  verifiedFarmer: boolean;
  rating: number;
  deliveryAvailable: boolean;
  description: string;
  imageUrl: string;
  featured?: boolean;
  createdAt: string;
}

export interface FarmerProfileItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  village: string;
  landAcres?: number;
  landAcreage: number;
  primaryCrops?: string[];
  specialties: string[];
  farmingMethod?: 'Organic & Natural' | 'Integrated Farming' | 'Precision Farming';
  fid: string;
  verified: boolean;
  rating: number;
  totalDealsCompleted: number;
  activeListingsCount: number;
  avatarUrl: string;
  bio: string;
}

export interface MarketPricePoint {
  date: string;
  paddy: number;
  ragi: number;
  wheat: number;
  cotton: number;
  maize: number;
  chilli: number;
  turDal: number;
}

export const CROP_CATEGORIES = [
  'Cereals & Millets',
  'Pulses & Legumes',
  'Oilseeds',
  'Commercial & Plantation Crops',
  'Spices & Condiments',
];

export const KARNATAKA_DISTRICTS = [
  'Bagalkote',
  'Ballari',
  'Belagavi',
  'Bengaluru Rural',
  'Bengaluru Urban',
  'Bidar',
  'Chamarajanagara',
  'Chikkaballapura',
  'Chikkamagaluru',
  'Chitradurga',
  'Dakshina Kannada',
  'Davanagere',
  'Dharwad',
  'Gadag',
  'Hassan',
  'Haveri',
  'Kalaburagi',
  'Kodagu',
  'Kolar',
  'Koppal',
  'Mandya',
  'Mysuru',
  'Raichur',
  'Ramanagara',
  'Shivamogga',
  'Tumakuru',
  'Udupi',
  'Uttara Kannada',
  'Vijayapura',
  'Yadgir',
];

export const COMMODITY_CONFIGS = [
  { key: 'ragi', label: 'Ragi (Finger Millet)', color: '#15803d', msp: 4290 },
  { key: 'paddy', label: 'Paddy (Sona Masoori)', color: '#0284c7', msp: 2320 },
  { key: 'wheat', label: 'Sharbati Wheat', color: '#f59e0b', msp: 2425 },
  { key: 'cotton', label: 'Bt Cotton (Medium)', color: '#8b5cf6', msp: 7121 },
  { key: 'maize', label: 'Feed Maize', color: '#eab308', msp: 2090 },
  { key: 'chilli', label: 'Byadgi Red Chilli', color: '#dc2626', msp: 16500 },
  { key: 'turDal', label: 'Tur Dal (Red Gram)', color: '#ea580c', msp: 7550 },
];

export const HISTORICAL_MANDI_RECORDS = [
  { id: 'rec-1', date: '2026-09-15', commodity: 'Ragi (Finger Millet)', mandi: 'Mandya APMC Yard', minPrice: 4200, modalPrice: 4380, maxPrice: 4500, trend: 'up' },
  { id: 'rec-2', date: '2026-09-14', commodity: 'Sona Masoori Paddy', mandi: 'Mysuru Bandipalya', minPrice: 2850, modalPrice: 2950, maxPrice: 3100, trend: 'up' },
  { id: 'rec-3', date: '2026-09-13', commodity: 'Sharbati Wheat', mandi: 'Bengaluru APMC', minPrice: 2550, modalPrice: 2650, maxPrice: 2780, trend: 'up' },
  { id: 'rec-4', date: '2026-09-12', commodity: 'Byadgi Red Chilli', mandi: 'Haveri (Byadgi) APMC', minPrice: 17500, modalPrice: 18400, maxPrice: 19800, trend: 'up' },
  { id: 'rec-5', date: '2026-09-11', commodity: 'Bt Cotton', mandi: 'Hubli APMC Yard', minPrice: 7300, modalPrice: 7480, maxPrice: 7650, trend: 'down' },
  { id: 'rec-6', date: '2026-09-10', commodity: 'Yellow Maize', mandi: 'Davangere APMC', minPrice: 2250, modalPrice: 2340, maxPrice: 2420, trend: 'up' },
  { id: 'rec-7', date: '2026-09-09', commodity: 'Tur Dal (Red Gram)', mandi: 'Kalaburagi APMC', minPrice: 8500, modalPrice: 8900, maxPrice: 9200, trend: 'up' },
];

export const CROPS_ENCYCLOPEDIA: CropInfo[] = [
  {
    id: 'ragi',
    name: 'Ragi (Finger Millet)',
    scientificName: 'Eleusine coracana',
    category: 'Cereals & Grains',
    season: 'Kharif',
    durationDays: '105 - 120 days',
    sowingPeriod: 'June - July',
    soilType: 'Red sandy loam, clay loam with pH 5.5 - 7.5',
    climate: 'Tropical semi-arid, 26°C - 32°C',
    waterRequirement: '350 - 450 mm (Drought hardy)',
    averageYieldPerAcre: '12 - 16 Quintals',
    yieldPerAcre: '12 - 16 Quintals',
    benchmarkMsp: 4290,
    benchmarkPricePerQuintal: 4290,
    currentMandiAvg: 4380,
    varieties: ['GPU-28', 'ML-365', 'KMR-301', 'Indaf-9'],
    description: 'A nutrient-dense ancient super-cereal rich in calcium, iron, and dietary fiber. Ideal for Karnataka rainfed regions like Mandya, Hassan, and Tumakuru.',
    imageUrl: '/produce/ragi.jpg'
  },
  {
    id: 'paddy',
    name: 'Paddy (Sona Masoori)',
    scientificName: 'Oryza sativa',
    category: 'Cereals & Grains',
    season: 'Kharif',
    durationDays: '130 - 145 days',
    sowingPeriod: 'July - August',
    soilType: 'Heavy alluvial clayey loams with high water retention',
    climate: 'Warm humid, 24°C - 36°C',
    waterRequirement: '1100 - 1250 mm',
    averageYieldPerAcre: '22 - 28 Quintals',
    yieldPerAcre: '22 - 28 Quintals',
    benchmarkMsp: 2320,
    benchmarkPricePerQuintal: 2320,
    currentMandiAvg: 2950,
    varieties: ['BPT-5204 (Sona Masoori)', 'IR-64', 'Jaya', 'Tellahamsa'],
    description: 'Premium aromatic medium-grain rice variety widely cultivated along the Tungabhadra and Kaveri river basins in Karnataka and Andhra Pradesh.',
    imageUrl: '/produce/paddy.jpg'
  },
  {
    id: 'wheat',
    name: 'Sharbati Wheat',
    scientificName: 'Triticum aestivum',
    category: 'Cereals & Grains',
    season: 'Rabi',
    durationDays: '115 - 125 days',
    sowingPeriod: 'October - November',
    soilType: 'Well-drained fertile clay loams, pH 6.0 - 7.5',
    climate: 'Cool winter growing, 15°C - 25°C',
    waterRequirement: '450 - 550 mm',
    averageYieldPerAcre: '18 - 22 Quintals',
    yieldPerAcre: '18 - 22 Quintals',
    benchmarkMsp: 2425,
    benchmarkPricePerQuintal: 2425,
    currentMandiAvg: 2650,
    varieties: ['C-306 (Sharbati)', 'Lok-1', 'GW-322', 'HI-1544'],
    description: 'Golden-grain wheat celebrated for high protein content, soft chapati texture, and sweet natural taste.',
    imageUrl: '/produce/wheat.jpg'
  },
  {
    id: 'cotton',
    name: 'Bt Cotton (Medium Staple)',
    scientificName: 'Gossypium hirsutum',
    category: 'Cash Crops',
    season: 'Kharif',
    durationDays: '150 - 170 days',
    sowingPeriod: 'May - June',
    soilType: 'Deep black cotton soils (Vertisols), pH 7.0 - 8.5',
    climate: 'Warm sub-tropical, 22°C - 34°C',
    waterRequirement: '600 - 800 mm',
    averageYieldPerAcre: '10 - 14 Quintals',
    yieldPerAcre: '10 - 14 Quintals',
    benchmarkMsp: 7121,
    benchmarkPricePerQuintal: 7121,
    currentMandiAvg: 7480,
    varieties: ['Bollgard II', 'RCH-2', 'Bunny Bt', 'DHH-11'],
    description: 'High-value fiber cash crop grown extensively across Northern Karnataka (Belagavi, Dharwad, Haveri) and Maharashtra.',
    imageUrl: '/produce/cotton.jpg'
  },
  {
    id: 'chilli',
    name: 'Byadagi Red Chilli',
    scientificName: 'Capsicum annuum',
    category: 'Spices',
    season: 'Kharif',
    durationDays: '140 - 160 days',
    sowingPeriod: 'July - August',
    soilType: 'Well-drained black clay or red loamy soil',
    climate: 'Moderate warm with 20°C - 30°C',
    waterRequirement: '500 - 650 mm',
    averageYieldPerAcre: '7 - 10 Quintals (Dry)',
    yieldPerAcre: '7 - 10 Quintals (Dry)',
    benchmarkMsp: 16500,
    benchmarkPricePerQuintal: 16500,
    currentMandiAvg: 18400,
    varieties: ['Byadagi Kaddi (GI Tag)', 'Byadagi Dabbi', 'Guntur Sanam'],
    description: 'World-renowned Geographical Indication (GI) tagged chilli from Karnataka known for its intense red color and low pungency.',
    imageUrl: '/produce/chilli.jpg'
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (Co 86032)',
    scientificName: 'Saccharum officinarum',
    category: 'Cash Crops',
    season: 'Year-round',
    durationDays: '330 - 365 days',
    sowingPeriod: 'January - March / July - August',
    soilType: 'Deep fertile loam with good drainage, pH 6.5 - 8.0',
    climate: 'Tropical sunshine, 25°C - 38°C',
    waterRequirement: '1500 - 2000 mm',
    averageYieldPerAcre: '45 - 60 Tonnes',
    yieldPerAcre: '45 - 60 Tonnes',
    benchmarkMsp: 340, // ₹ per quintal FRP
    benchmarkPricePerQuintal: 340,
    currentMandiAvg: 360,
    varieties: ['Co 86032 (Nayana)', 'Co 0238', 'CoM 0265'],
    description: 'Major commercial sucrose crop fueling Mandya and Belagavi sugar mills and traditional chemical-free jaggery production.',
    imageUrl: '/produce/sugarcane.jpg'
  },
  {
    id: 'maize',
    name: 'Yellow Maize / Corn',
    scientificName: 'Zea mays',
    category: 'Cereals & Grains',
    season: 'Kharif',
    durationDays: '90 - 105 days',
    sowingPeriod: 'June - July / October',
    soilType: 'Deep alluvial and red loams rich in organic matter',
    climate: 'Warm sunny weather, 21°C - 30°C',
    waterRequirement: '500 - 600 mm',
    averageYieldPerAcre: '20 - 25 Quintals',
    yieldPerAcre: '20 - 25 Quintals',
    benchmarkMsp: 2090,
    benchmarkPricePerQuintal: 2090,
    currentMandiAvg: 2340,
    varieties: ['Pioneer 3396', 'DeKalb 9108', 'Kargil 900M'],
    description: 'High-energy cereal utilized extensively in poultry feed formulation, starch manufacturing, and silage production.',
    imageUrl: '/produce/maize.jpg'
  },
  {
    id: 'tur-dal',
    name: 'Tur Dal (Pigeon Pea)',
    scientificName: 'Cajanus cajan',
    category: 'Pulses & Legumes',
    season: 'Kharif',
    durationDays: '150 - 180 days',
    sowingPeriod: 'June - July',
    soilType: 'Deep fertile black or red loamy soil, pH 6.5 - 7.5',
    climate: 'Semi-arid warm, 20°C - 32°C',
    waterRequirement: '550 - 650 mm',
    averageYieldPerAcre: '6 - 9 Quintals',
    yieldPerAcre: '6 - 9 Quintals',
    benchmarkMsp: 7550,
    benchmarkPricePerQuintal: 7550,
    currentMandiAvg: 8900,
    varieties: ['GRG-811 (Kalaburagi Red Gram)', 'Maruti (ICP-8863)', 'Asha (ICPL-87119)'],
    description: 'GI-tagged Kalaburagi Red Gram celebrated across India for rich protein, quick-cooking characteristics, and aromatic dal broth.',
    imageUrl: '/produce/soybean.jpg'
  },
];

export const INITIAL_PRODUCE_LISTINGS: ProduceListingItem[] = [
  {
    id: 'prod-001',
    title: 'Organic Finger Millet (Ragi)',
    cropName: 'Organic Finger Millet (Ragi)',
    category: 'Cereals & Grains',
    variety: 'ML-365 High-Iron',
    quantityQuintals: 35,
    quantityKg: 3500,
    quantityAvailableQuintals: 35,
    minOrderQuintals: 2,
    pricePerQuintal: 4350,
    pricePerKg: 43.5,
    qualityGrade: 'Grade A (Export)',
    grade: 'A',
    organicStatus: 'Certified Organic',
    organic: true,
    state: 'Karnataka',
    district: 'Mandya',
    village: 'Pandavapura',
    talukOrVillage: 'Pandavapura, Mandya',
    mandiName: 'Mandya APMC Yard',
    harvestDate: '2026-09-01',
    farmerId: 'farmer_ramesh@agro.com',
    farmerName: 'Ramesh Gowda',
    farmerPhone: '+91 98450 12345',
    farmerVerified: true,
    verifiedFarmer: true,
    rating: 4.9,
    deliveryAvailable: true,
    description: 'Certified organic brown ragi cleaned to 99.2% purity through air aspirators. Moisture content tested at 11.8%, optimal for flour milling and long storage.',
    imageUrl: '/produce/ragi.jpg',
    featured: true,
    createdAt: '2026-09-10'
  },
  {
    id: 'prod-002',
    title: 'Single-Origin Sona Masoori Paddy',
    cropName: 'Single-Origin Sona Masoori Paddy',
    category: 'Cereals & Grains',
    variety: 'BPT-5204 (1 Year Aged)',
    quantityQuintals: 80,
    quantityKg: 8000,
    quantityAvailableQuintals: 80,
    minOrderQuintals: 5,
    pricePerQuintal: 2950,
    pricePerKg: 29.5,
    qualityGrade: 'Grade A',
    grade: 'A',
    organicStatus: 'Conventional',
    organic: false,
    state: 'Karnataka',
    district: 'Mysuru',
    village: 'T. Narasipura',
    talukOrVillage: 'T. Narasipura, Mysuru',
    mandiName: 'Mysuru Bandipalya APMC',
    harvestDate: '2026-08-20',
    farmerId: 'farmer_suresh@agro.com',
    farmerName: 'Suresh Kumar',
    farmerPhone: '+91 98450 45678',
    farmerVerified: true,
    verifiedFarmer: true,
    rating: 4.8,
    deliveryAvailable: true,
    description: 'Single-origin aged paddy harvested from the fertile Kaveri basin. Superb milling yield and aromatic cooking aroma for restaurants and wholesalers.',
    imageUrl: '/produce/paddy.jpg',
    featured: true,
    createdAt: '2026-09-05'
  },
  {
    id: 'prod-003',
    title: 'Sun-Dried Byadgi Red Chilli',
    cropName: 'Sun-Dried Byadgi Red Chilli',
    category: 'Spices',
    variety: 'Kaddi GI Tagged',
    quantityQuintals: 24,
    quantityKg: 2400,
    quantityAvailableQuintals: 24,
    minOrderQuintals: 1,
    pricePerQuintal: 18200,
    pricePerKg: 182,
    qualityGrade: 'Grade A (Export)',
    grade: 'Premium',
    organicStatus: 'Natural Farming',
    organic: true,
    state: 'Karnataka',
    district: 'Haveri',
    village: 'Byadgi',
    talukOrVillage: 'Byadgi Mandi Region',
    mandiName: 'Haveri (Byadgi) APMC',
    harvestDate: '2026-08-15',
    farmerId: 'farmer_patil@agro.com',
    farmerName: 'Basavaraj Patil',
    farmerPhone: '+91 98450 23456',
    farmerVerified: true,
    verifiedFarmer: true,
    rating: 4.9,
    deliveryAvailable: true,
    description: 'Deep red, wrinkly pods with high capsaicin color extraction value and mild heat. Ideal for export, spice extraction, and food processing.',
    imageUrl: '/produce/chilli.jpg',
    featured: true,
    createdAt: '2026-09-08'
  },
  {
    id: 'prod-006',
    title: 'Prime GI Kalaburagi Red Gram (Tur Dal)',
    cropName: 'Prime GI Kalaburagi Red Gram (Tur Dal)',
    category: 'Pulses & Legumes',
    variety: 'GRG-811 Desi Whole',
    quantityQuintals: 60,
    quantityKg: 6000,
    quantityAvailableQuintals: 60,
    minOrderQuintals: 3,
    pricePerQuintal: 8900,
    pricePerKg: 89,
    qualityGrade: 'Grade A (Export)',
    grade: 'Premium',
    organicStatus: 'Certified Organic',
    organic: true,
    state: 'Karnataka',
    district: 'Belagavi',
    village: 'Gokak',
    talukOrVillage: 'Gokak, Belagavi',
    mandiName: 'Belagavi APMC Yard',
    harvestDate: '2026-08-30',
    farmerId: 'farmer_ramesh@agro.com',
    farmerName: 'Ramesh Gowda',
    farmerPhone: '+91 98450 12345',
    farmerVerified: true,
    verifiedFarmer: true,
    rating: 4.9,
    deliveryAvailable: true,
    description: 'Whole unpolished red gram grains with natural seed coat. Zero oil polishing, high calcium content from limestone-rich soils, certified pesticide residue free.',
    imageUrl: '/produce/soybean.jpg',
    featured: false,
    createdAt: '2026-09-06'
  },
  {
    id: 'prod-008',
    title: 'Davangere Yellow Feed Maize',
    cropName: 'Davangere Yellow Feed Maize',
    category: 'Cereals & Grains',
    variety: 'Pioneer High-Starch',
    quantityQuintals: 210,
    quantityKg: 21000,
    quantityAvailableQuintals: 210,
    minOrderQuintals: 5,
    pricePerQuintal: 2320,
    pricePerKg: 23.2,
    qualityGrade: 'Grade A',
    grade: 'A',
    organicStatus: 'Conventional',
    organic: false,
    state: 'Karnataka',
    district: 'Davangere',
    village: 'Harihar',
    talukOrVillage: 'Harihar, Davangere',
    mandiName: 'Davangere APMC Yard',
    harvestDate: '2026-08-25',
    farmerId: 'farmer_mallesh@agro.com',
    farmerName: 'Malleshappa',
    farmerPhone: '+91 98450 89012',
    farmerVerified: true,
    verifiedFarmer: true,
    rating: 4.8,
    deliveryAvailable: true,
    description: 'Cleaned yellow maize kernels with 13% moisture level and high bulk density. Ready for feed production or grain storage silos.',
    imageUrl: '/produce/maize.jpg',
    featured: false,
    createdAt: '2026-09-03'
  }
];

export const FARMERS_DIRECTORY: FarmerProfileItem[] = [
  {
    id: 'farmer_ramesh@agro.com',
    name: 'Ramesh Gowda',
    email: 'farmer_ramesh@agro.com',
    phone: '+91 98450 12345',
    state: 'Karnataka',
    district: 'Mandya',
    village: 'Pandavapura',
    landAcres: 6.5,
    landAcreage: 6.5,
    primaryCrops: ['Ragi', 'Sugarcane', 'Paddy'],
    specialties: ['Ragi', 'Sugarcane', 'Paddy'],
    farmingMethod: 'Organic & Natural',
    fid: 'KA-MAN-984210',
    verified: true,
    rating: 4.9,
    totalDealsCompleted: 42,
    activeListingsCount: 3,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'Pioneering organic ragi and sugarcane farmer in Mandya using multi-tier companion planting and indigenous Jeevamrutha soil rejuvenation.'
  },
  {
    id: 'nikhilgani293@gmail.com',
    name: 'Nikhil Farmer',
    email: 'nikhilgani293@gmail.com',
    phone: '+91 86604 16257',
    state: 'Karnataka',
    district: 'Vijayapura',
    village: 'Tikota',
    landAcres: 8.0,
    landAcreage: 8.0,
    primaryCrops: ['Banana', 'Grapes', 'Pomegranate'],
    specialties: ['Banana', 'Grapes', 'Pomegranate'],
    farmingMethod: 'Precision Farming',
    fid: 'KA-VIJ-102938',
    verified: true,
    rating: 4.8,
    totalDealsCompleted: 28,
    activeListingsCount: 2,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'Horticulture specialist in North Karnataka operating solar-powered automated drip fertigation and direct B2B harvest logistics.'
  },
  {
    id: 'farmer_patil@agro.com',
    name: 'Basavaraj Patil',
    email: 'farmer_patil@agro.com',
    phone: '+91 98450 23456',
    state: 'Karnataka',
    district: 'Haveri',
    village: 'Byadgi',
    landAcres: 12.0,
    landAcreage: 12.0,
    primaryCrops: ['Byadgi Chilli', 'Cotton', 'Onion'],
    specialties: ['Byadgi Chilli', 'Cotton', 'Onion'],
    farmingMethod: 'Integrated Farming',
    fid: 'KA-HAV-541298',
    verified: true,
    rating: 4.9,
    totalDealsCompleted: 56,
    activeListingsCount: 4,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    bio: 'Third-generation Byadgi chilli cultivator supplying export-grade whole chillies directly to certified spice processing aggregators.'
  },
  {
    id: 'farmer_suresh@agro.com',
    name: 'Suresh Kumar',
    email: 'farmer_suresh@agro.com',
    phone: '+91 98450 45678',
    state: 'Karnataka',
    district: 'Mysuru',
    village: 'T. Narasipura',
    landAcres: 5.0,
    landAcreage: 5.0,
    primaryCrops: ['Sona Masoori Paddy', 'Turmeric'],
    specialties: ['Sona Masoori Paddy', 'Turmeric'],
    farmingMethod: 'Organic & Natural',
    fid: 'KA-MYS-778210',
    verified: true,
    rating: 4.7,
    totalDealsCompleted: 35,
    activeListingsCount: 2,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    bio: 'Practicing Vedic natural farming along the Kaveri river banks, preserving heirloom paddy grains with zero chemical insecticides.'
  },
  {
    id: 'farmer_ningappa@agro.com',
    name: 'Ningappa Hegde',
    email: 'farmer_ningappa@agro.com',
    phone: '+91 98450 34567',
    state: 'Karnataka',
    district: 'Shivamogga',
    village: 'Sagar',
    landAcres: 7.5,
    landAcreage: 7.5,
    primaryCrops: ['Arecanut', 'Black Pepper', 'Cardamom'],
    specialties: ['Arecanut', 'Black Pepper', 'Cardamom'],
    farmingMethod: 'Organic & Natural',
    fid: 'KA-SHI-665201',
    verified: true,
    rating: 4.8,
    totalDealsCompleted: 31,
    activeListingsCount: 3,
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    bio: 'Malnad multi-crop estate owner producing sun-cured white arecanut and pesticide-free Malabar black pepper.'
  }
];

export const MARKET_PRICE_SERIES: MarketPricePoint[] = [
  { date: 'Apr 01', paddy: 2780, ragi: 4120, wheat: 2480, cotton: 7100, maize: 2150, chilli: 16800, turDal: 7800 },
  { date: 'Apr 15', paddy: 2810, ragi: 4150, wheat: 2500, cotton: 7180, maize: 2180, chilli: 17100, turDal: 7950 },
  { date: 'May 01', paddy: 2840, ragi: 4180, wheat: 2520, cotton: 7250, maize: 2210, chilli: 17350, turDal: 8100 },
  { date: 'May 15', paddy: 2860, ragi: 4220, wheat: 2550, cotton: 7300, maize: 2240, chilli: 17600, turDal: 8250 },
  { date: 'Jun 01', paddy: 2890, ragi: 4250, wheat: 2580, cotton: 7350, maize: 2270, chilli: 17800, turDal: 8400 },
  { date: 'Jun 15', paddy: 2910, ragi: 4280, wheat: 2600, cotton: 7400, maize: 2290, chilli: 18000, turDal: 8550 },
  { date: 'Jul 01', paddy: 2930, ragi: 4310, wheat: 2610, cotton: 7440, maize: 2310, chilli: 18150, turDal: 8650 },
  { date: 'Jul 15', paddy: 2940, ragi: 4340, wheat: 2630, cotton: 7460, maize: 2320, chilli: 18250, turDal: 8700 },
  { date: 'Aug 01', paddy: 2960, ragi: 4360, wheat: 2640, cotton: 7480, maize: 2330, chilli: 18350, turDal: 8800 },
  { date: 'Aug 15', paddy: 2950, ragi: 4370, wheat: 2650, cotton: 7470, maize: 2340, chilli: 18400, turDal: 8850 },
  { date: 'Sep 01', paddy: 2955, ragi: 4380, wheat: 2655, cotton: 7490, maize: 2345, chilli: 18450, turDal: 8900 },
  { date: 'Current', paddy: 2950, ragi: 4380, wheat: 2650, cotton: 7480, maize: 2340, chilli: 18400, turDal: 8900 },
];
