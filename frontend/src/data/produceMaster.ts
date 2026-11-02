/**
 * Karnataka Agricultural Produce Master Data System
 * ─────────────────────────────────────────────────────────────────────────────
 * Central source of truth for the 8 top-level Karnataka agricultural produce
 * categories, produces, and their approved regional varieties/hybrids.
 */

export type ProduceCategoryId =
  | 'CEREALS_MILLETS'
  | 'PULSES'
  | 'OILSEEDS'
  | 'COMMERCIAL_CROPS'
  | 'PLANTATION_CROPS'
  | 'SPICES'
  | 'VEGETABLES'
  | 'FRUITS';

export interface ProduceVariety {
  id: string;
  name: string;
  isPopular?: boolean;
}

export interface Produce {
  id: string;
  categoryId: ProduceCategoryId;
  name: string; // English display name
  nameKn: string; // Kannada name
  varieties: string[];
  isActive: boolean;
  commonUnits?: string[]; // e.g. ["kg", "Quintal", "Bag (50kg)"]
  typicalPricePerKg?: number;
}

export interface ProduceCategory {
  id: ProduceCategoryId;
  label: string; // English
  labelKn: string; // Kannada
  iconName: string; // Lucide / visual reference
  color: string;
  bg: string;
  accent: string;
  border: string;
  description: string;
  items: Produce[];
}

export const PRODUCE_CATEGORIES: ProduceCategory[] = [
  {
    id: 'CEREALS_MILLETS',
    label: 'Cereals & Millets',
    labelKn: 'ಧಾನ್ಯಗಳು ಮತ್ತು ಸಿರಿಧಾನ್ಯಗಳು',
    iconName: 'Wheat',
    color: '#ca8a04',
    bg: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
    accent: '#fef08a',
    border: '#fde047',
    description: 'Paddy, Ragi, Jowar, Maize, Bajra and Karnataka minor millets',
    items: [
      {
        id: 'PADDY_RICE',
        categoryId: 'CEREALS_MILLETS',
        name: 'Paddy / Rice',
        nameKn: 'ಭತ್ತ',
        varieties: [
          'Gangavathi Sona',
          'KMP-220',
          'MSN-99',
          'Daksha (KMP-175)',
          'KRH-2',
          'KRH-4',
          'MAS-26',
          'Sharada',
          'Thanu',
          'BR-2655',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'FINGER_MILLET_RAGI',
        categoryId: 'CEREALS_MILLETS',
        name: 'Finger Millet / Ragi',
        nameKn: 'ರಾಗಿ',
        varieties: [
          'GPU-28',
          'GPU-48',
          'GPU-66',
          'GPU-67',
          'ML-365',
          'MR-1',
          'MR-6',
          'Indaf-7',
          'Indaf-9',
          'KMR-204',
          'KMR-301',
          'KMR-316',
          'KMR-340',
          'KMR-630',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'SORGHUM_JOWAR',
        categoryId: 'CEREALS_MILLETS',
        name: 'Sorghum / Jowar',
        nameKn: 'ಜೋಳ',
        varieties: ['CSV-4', 'CSH-5', 'CSH-9', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'MAIZE',
        categoryId: 'CEREALS_MILLETS',
        name: 'Maize',
        nameKn: 'ಮೆಕ್ಕೆ ಜೋಳ',
        varieties: [
          'Hema (NAH-1137)',
          'Nithyashree (NAH-2049)',
          'MAH-14-5',
          'MAH-14-138',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'WHEAT',
        categoryId: 'CEREALS_MILLETS',
        name: 'Wheat',
        nameKn: 'ಗೋಧಿ',
        varieties: ['DWR-162', 'DWR-2006', 'MACS-2496', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'PEARL_MILLET_BAJRA',
        categoryId: 'CEREALS_MILLETS',
        name: 'Pearl Millet / Bajra',
        nameKn: 'ಸಜ್ಜೆ',
        varieties: ['ICTP-8203', 'GHB-558', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'FOXTAIL_MILLET',
        categoryId: 'CEREALS_MILLETS',
        name: 'Foxtail Millet',
        nameKn: 'ನವಣೆ',
        varieties: ['GPUF-3', 'SIA-326', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'LITTLE_MILLET',
        categoryId: 'CEREALS_MILLETS',
        name: 'Little Millet',
        nameKn: 'ಸಾಮೆ',
        varieties: ['GPUL-6', 'CO-2', 'OLM-203', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'PROSO_MILLET',
        categoryId: 'CEREALS_MILLETS',
        name: 'Proso Millet',
        nameKn: 'ಬರಗು',
        varieties: ['GPUP-8', 'GPUP-21', 'GPUP-28', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'BARNYARD_MILLET',
        categoryId: 'CEREALS_MILLETS',
        name: 'Barnyard Millet',
        nameKn: 'ಊದಲು',
        varieties: ['RBK-155', 'GPUK-3', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'KODO_MILLET',
        categoryId: 'CEREALS_MILLETS',
        name: 'Kodo Millet',
        nameKn: 'ಹಾರಕ',
        varieties: ['DHB M-93-3', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'BROWNTOP_MILLET',
        categoryId: 'CEREALS_MILLETS',
        name: 'Browntop Millet',
        nameKn: 'ಕೊರಲೆ',
        varieties: ['GPUBT-2', 'Other / Local Variety'],
        isActive: true,
      },
    ],
  },
  {
    id: 'PULSES',
    label: 'Pulses',
    labelKn: 'ಬೇಳೆಕಾಳುಗಳು',
    iconName: 'Nut',
    color: '#d97706',
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    accent: '#fde68a',
    border: '#fcd34d',
    description: 'Tur Dal, Bengal Gram, Moong, Urad, Horse Gram, Avare and Cowpea',
    items: [
      {
        id: 'PIGEON_PEA_TUR',
        categoryId: 'PULSES',
        name: 'Pigeon Pea / Red Gram / Tur',
        nameKn: 'ತೊಗರಿ',
        varieties: [
          'BRG-1',
          'BRG-2',
          'BRG-3',
          'BRG-4',
          'BRG-5',
          'BRG-10-2',
          'TTB-7',
          'ICP-7035',
          'GRG-811',
          'TS-3R',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'BENGAL_GRAM_CHICKPEA',
        categoryId: 'PULSES',
        name: 'Bengal Gram / Chickpea',
        nameKn: 'ಕಡಲೆ',
        varieties: [
          'JG-11',
          'JAKI-9218',
          'Annigeri-1',
          'BGD-103',
          'KAK-2',
          'GBM-2',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'GREEN_GRAM_MOONG',
        categoryId: 'PULSES',
        name: 'Green Gram / Moong',
        nameKn: 'ಹೆಸರು ಕಾಳು',
        varieties: [
          'KKM-3',
          'PS-16',
          'Pusa Baisakhi',
          'PDM-84-178',
          'BGS-9',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'BLACK_GRAM_URAD',
        categoryId: 'PULSES',
        name: 'Black Gram / Urad',
        nameKn: 'ಉದ್ದು',
        varieties: [
          'LBG-625 (Rashmi)',
          'LBG-791 (Suraksha)',
          'Karagaon-3',
          'T-9',
          'TAU-2',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'HORSE_GRAM',
        categoryId: 'PULSES',
        name: 'Horse Gram',
        nameKn: 'ಹುರುಳಿ',
        varieties: ['PHG-9', 'GPM-6', 'CRHG-19', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'FIELD_BEAN_AVARE',
        categoryId: 'PULSES',
        name: 'Field Bean',
        nameKn: 'ಅವರೆ',
        varieties: [
          'Hebbal Avare-3',
          'Hebbal Avare-4',
          'Hebbal Avare-5',
          'HA-4',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'COWPEA',
        categoryId: 'PULSES',
        name: 'Cowpea',
        nameKn: 'ಅಲಸಂದೆ',
        varieties: [
          'KBC-1',
          'KBC-2',
          'KBC-11',
          'PGCP-6',
          'AV-5',
          'AV-6',
          'KM-5',
          'KM-9',
          'Other / Local Variety',
        ],
        isActive: true,
      },
    ],
  },
  {
    id: 'OILSEEDS',
    label: 'Oilseeds',
    labelKn: 'ಎಣ್ಣೆಕಾಳುಗಳು',
    iconName: 'Sun',
    color: '#eab308',
    bg: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)',
    accent: '#fde047',
    border: '#eab308',
    description: 'Groundnut, Sunflower, Soybean, Sesame, Safflower, Castor and Niger',
    items: [
      {
        id: 'GROUNDNUT_PEANUT',
        categoryId: 'OILSEEDS',
        name: 'Groundnut / Peanut',
        nameKn: 'ಕಡಲೆಕಾಯಿ / ಶೇಂಗಾ',
        varieties: [
          'GKVK-5',
          'GKVK-27',
          'KCG-6',
          'GPBD-4',
          'ICGV-91114',
          'JL-24',
          'TMV-2',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'SUNFLOWER',
        categoryId: 'OILSEEDS',
        name: 'Sunflower',
        nameKn: 'ಸೂರ್ಯಕಾಂತಿ',
        varieties: [
          'KBSH-41',
          'KBSH-42',
          'KBSH-44',
          'KBSH-53',
          'KBSH-78',
          'KBSH-79',
          'RSFH-130',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'SOYBEAN',
        categoryId: 'OILSEEDS',
        name: 'Soybean',
        nameKn: 'ಸೋಯಾಬೀನ್',
        varieties: [
          'KBS-23',
          'MAUS-2 (Pooja)',
          'JS-335',
          'DSb-21',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'SESAME',
        categoryId: 'OILSEEDS',
        name: 'Sesame',
        nameKn: 'ಎಳ್ಳು',
        varieties: [
          'GT-1',
          'Navile-1 (Tunga)',
          'TMV-3',
          'T-7',
          'GKVK S-1',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'SAFFLOWER',
        categoryId: 'OILSEEDS',
        name: 'Safflower',
        nameKn: 'ಕುಸುಬೆ',
        varieties: ['A-1', 'Annigeri-2', 'NARI-6', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'NIGER',
        categoryId: 'OILSEEDS',
        name: 'Niger',
        nameKn: 'ಗುರೆಳ್ಳು / ಉಚ್ಚೆಳ್ಳು',
        varieties: ['KBN-1', 'KBN-2', 'IGP-76', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'CASTOR',
        categoryId: 'OILSEEDS',
        name: 'Castor',
        nameKn: 'ಹರಳು',
        varieties: ['DCS-9', 'DCH-177', 'DCH-519', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'LINSEED',
        categoryId: 'OILSEEDS',
        name: 'Linseed / Flaxseed',
        nameKn: 'ಅಗಸೆ',
        varieties: ['NL-97', 'T-397', 'Other / Local Variety'],
        isActive: true,
      },
    ],
  },
  {
    id: 'COMMERCIAL_CROPS',
    label: 'Commercial Crops',
    labelKn: 'ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು',
    iconName: 'Factory',
    color: '#0284c7',
    bg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    accent: '#bae6fd',
    border: '#7dd3fc',
    description: 'Sugarcane, Cotton and Tobacco for industrial processing & trade',
    items: [
      {
        id: 'SUGARCANE',
        categoryId: 'COMMERCIAL_CROPS',
        name: 'Sugarcane',
        nameKn: 'ಕಬ್ಬು',
        varieties: [
          'CoVC-18061',
          'CoVC-16061',
          'CoVC-16062',
          'VCF-0517',
          'CoVC-99463',
          'Co 86032',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'COTTON',
        categoryId: 'COMMERCIAL_CROPS',
        name: 'Cotton',
        nameKn: 'ಹತ್ತಿ',
        varieties: [
          'Bt Bollgard-II',
          'DHH-11',
          'RCH-2',
          'Bunny Bt',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'TOBACCO',
        categoryId: 'COMMERCIAL_CROPS',
        name: 'Tobacco',
        nameKn: 'ತಂಬಾಕು',
        varieties: ['FCV Virginia', 'Bidi Tobacco', 'Other / Local Variety'],
        isActive: true,
      },
    ],
  },
  {
    id: 'PLANTATION_CROPS',
    label: 'Plantation Crops',
    labelKn: 'ತೋಟದ ಬೆಳೆಗಳು',
    iconName: 'Coffee',
    color: '#854d0e',
    bg: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
    accent: '#fde68a',
    border: '#b45309',
    description: 'Coffee, Arecanut, Coconut and Cashew nut crops',
    items: [
      {
        id: 'COFFEE',
        categoryId: 'PLANTATION_CROPS',
        name: 'Coffee',
        nameKn: 'ಕಾಫಿ',
        varieties: ['Arabica', 'S.795', 'Robusta', 'Catimor', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'ARECANUT',
        categoryId: 'PLANTATION_CROPS',
        name: 'Arecanut',
        nameKn: 'ಅಡಿಕೆ',
        varieties: [
          'Shatamangala',
          'Mangala',
          'Sumangala',
          'Mohitnagar',
          'Local Tall',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'COCONUT',
        categoryId: 'PLANTATION_CROPS',
        name: 'Coconut',
        nameKn: 'ತೆಂಗು',
        varieties: [
          'Tall',
          'Dwarf',
          'Hybrid',
          'Tiptur Tall',
          'West Coast Tall',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'CASHEW',
        categoryId: 'PLANTATION_CROPS',
        name: 'Cashew',
        nameKn: 'ಗೋಡಂಬಿ',
        varieties: ['Ullal-1', 'Ullal-3', 'Ullal-4', 'Vengurla-4', 'Other / Local Variety'],
        isActive: true,
      },
    ],
  },
  {
    id: 'SPICES',
    label: 'Spices',
    labelKn: 'ಮಸಾಲೆ ಬೆಳೆಗಳು',
    iconName: 'Flame',
    color: '#dc2626',
    bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    accent: '#fecaca',
    border: '#f87171',
    description: 'Black Pepper, Cardamom, Turmeric, Ginger and Karnataka Dry Chilli',
    items: [
      {
        id: 'BLACK_PEPPER',
        categoryId: 'SPICES',
        name: 'Black Pepper',
        nameKn: 'ಕರಿಮೆಣಸು',
        varieties: [
          'Panniyur selections',
          'Panniyur-1',
          'Karimunda',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'CARDAMOM',
        categoryId: 'SPICES',
        name: 'Cardamom',
        nameKn: 'ಏಲಕ್ಕಿ',
        varieties: ['Mysore', 'Malabar', 'Vazhukka', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'TURMERIC',
        categoryId: 'SPICES',
        name: 'Turmeric',
        nameKn: 'ಅರಿಶಿನ',
        varieties: ['IISR Pratibha', 'Salem / Erode', 'Pratibha', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'GINGER',
        categoryId: 'SPICES',
        name: 'Ginger',
        nameKn: 'ಶುಂಠಿ',
        varieties: ['Maran', 'Varada', 'Himachal', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'DRY_CHILLI',
        categoryId: 'SPICES',
        name: 'Dry Chilli',
        nameKn: 'ಒಣ ಮೆಣಸಿನಕಾಯಿ',
        varieties: [
          'Byadgi Kaddi (GI Tag)',
          'Byadgi Dabbi',
          'Guntur Sannam',
          'Teja (G-4)',
          'Other / Local Variety',
        ],
        isActive: true,
      },
    ],
  },
  {
    id: 'VEGETABLES',
    label: 'Vegetables',
    labelKn: 'ತರಕಾರಿಗಳು',
    iconName: 'Salad',
    color: '#16a34a',
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    accent: '#bbf7d0',
    border: '#4ade80',
    description: 'Fresh vegetables, root crops, greens, and gourds',
    items: [
      {
        id: 'TOMATO',
        categoryId: 'VEGETABLES',
        name: 'Tomato',
        nameKn: 'ಟೊಮ್ಯಾಟೊ',
        varieties: [
          'Kashi Vishesh Hybrid',
          'Arka Rakshak',
          'Arka Samrat',
          'Arka Saurabh',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'POTATO',
        categoryId: 'VEGETABLES',
        name: 'Potato',
        nameKn: 'ಆಲೂಗಡ್ಡೆ',
        varieties: ['Kufri Jyoti', 'Kufri Pukhraj', 'Kufri Surya', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'ONION',
        categoryId: 'VEGETABLES',
        name: 'Onion',
        nameKn: 'ಈರುಳ್ಳಿ',
        varieties: ['Bellary Red Large', 'Arka Kalyan', 'Bangalore Rose (GI)', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'BRINJAL',
        categoryId: 'VEGETABLES',
        name: 'Brinjal',
        nameKn: 'ಬದನೆಕಾಯಿ',
        varieties: ['Mattu Gulla (GI)', 'Arka Kusumakar', 'Manjarigota', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'GREEN_CHILLI',
        categoryId: 'VEGETABLES',
        name: 'Green Chilli',
        nameKn: 'ಹಸಿಮೆಣಸಿನಕಾಯಿ',
        varieties: ['Arka Meghana', 'G-4 Teja', 'Pusa Jwala', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'LADIES_FINGER',
        categoryId: 'VEGETABLES',
        name: 'Ladies Finger / Bhendi',
        nameKn: 'ಬೆಂಡೆಕಾಯಿ',
        varieties: ['Arka Anamika', 'Pusa Sawani', 'Mahyco 10', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'CABBAGE',
        categoryId: 'VEGETABLES',
        name: 'Cabbage',
        nameKn: 'ಎಲೆಕೋಸು',
        varieties: ['Golden Acre', 'Pride of India', 'Green Express', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'CAULIFLOWER',
        categoryId: 'VEGETABLES',
        name: 'Cauliflower',
        nameKn: 'ಹೂಕೋಸು',
        varieties: ['Pusa Deepali', 'Snowball 16', 'Madhuri Hybrid', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'CARROT',
        categoryId: 'VEGETABLES',
        name: 'Carrot',
        nameKn: 'ಕ್ಯಾರೆಟ್',
        varieties: ['Pusa Kesar', 'Kuroda', 'Super Kuroda', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'FRENCH_BEANS',
        categoryId: 'VEGETABLES',
        name: 'French Beans',
        nameKn: 'ಹುರುಳಿಕಾಯಿ',
        varieties: ['Arka Komal', 'Contender', 'Falguni', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'CAPSICUM',
        categoryId: 'VEGETABLES',
        name: 'Capsicum / Bell Pepper',
        nameKn: 'ದಪ್ಪ ಮೆಣಸಿನಕಾಯಿ',
        varieties: ['California Wonder', 'Indra Hybrid', 'Yellow / Red Bell', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'CUCUMBER',
        categoryId: 'VEGETABLES',
        name: 'Cucumber',
        nameKn: 'ಸೌತೆಕಾಯಿ',
        varieties: ['Poinsett', 'Malini', 'Japanese Long Green', 'Other / Local Variety'],
        isActive: true,
      },
    ],
  },
  {
    id: 'FRUITS',
    label: 'Fruits',
    labelKn: 'ಹಣ್ಣುಗಳು',
    iconName: 'Apple',
    color: '#ea580c',
    bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
    accent: '#fed7aa',
    border: '#fb923c',
    description: 'Fresh orchard fruits, Karnataka mangoes, bananas, pomegranates & sapotas',
    items: [
      {
        id: 'MANGO',
        categoryId: 'FRUITS',
        name: 'Mango',
        nameKn: 'ಮಾವಿನ ಹಣ್ಣು',
        varieties: [
          'Alphonso (Badami)',
          'Totapuri',
          'Raspuri',
          'Mallika',
          'Kesar',
          'Dasheri',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'BANANA',
        categoryId: 'FRUITS',
        name: 'Banana',
        nameKn: 'ಬಾಳೆಹಣ್ಣು',
        varieties: [
          'Grand Naine (G-9)',
          'Robusta',
          'Elakki (Yellaki)',
          'Nendran',
          'Red Banana',
          'Other / Local Variety',
        ],
        isActive: true,
      },
      {
        id: 'POMEGRANATE',
        categoryId: 'FRUITS',
        name: 'Pomegranate',
        nameKn: 'ದಾಳಿಂಬೆ',
        varieties: ['Bhagwa (Sindhuri)', 'Arakta', 'Ganesh', 'Ruby', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'SAPOTA_CHIKOO',
        categoryId: 'FRUITS',
        name: 'Sapota / Chikoo',
        nameKn: 'ಸಪೋಟ / ಚಿಕ್ಕು',
        varieties: ['Kalipatti', 'Cricket Ball', 'DHS-1', 'PKM-1', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'JACKFRUIT',
        categoryId: 'FRUITS',
        name: 'Jackfruit',
        nameKn: 'ಹಲಸಿನ ಹಣ್ಣು',
        varieties: ['Tubagere Selection', 'Swarna', 'Siddu Jackfruit', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'PAPAYA',
        categoryId: 'FRUITS',
        name: 'Papaya',
        nameKn: 'ಪರಂಗಿ ಹಣ್ಣು',
        varieties: ['Red Lady 786', 'Taiwan Hybrid', 'Coorg Honey Dew', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'GUAVA',
        categoryId: 'FRUITS',
        name: 'Guava',
        nameKn: 'ಪೇರಲ / ಸೀಬೆಹಣ್ಣು',
        varieties: ['Allahabad Safeda', 'Lucknow 49 (L-49)', 'Arka Mridula', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'GRAPES',
        categoryId: 'FRUITS',
        name: 'Grapes',
        nameKn: 'ದ್ರಾಕ್ಷಿ',
        varieties: ['Bangalore Blue (GI)', 'Thompson Seedless', 'Dilkush', 'Sharad Seedless', 'Other / Local Variety'],
        isActive: true,
      },
      {
        id: 'WATERMELON',
        categoryId: 'FRUITS',
        name: 'Watermelon',
        nameKn: 'ಕಲ್ಲಂಗಡಿ',
        varieties: ['Kiran Hybrid', 'Sugar Baby', 'Namdhari Black', 'Other / Local Variety'],
        isActive: true,
      },
    ],
  },
];

/**
 * Backward compatibility alias for older code expecting PRODUCE_MASTER
 */
export const PRODUCE_MASTER = PRODUCE_CATEGORIES;

/**
 * All active produces as a flat list
 */
export const ALL_PRODUCE: Produce[] = PRODUCE_CATEGORIES.flatMap((c) => c.items);

/**
 * Flat list of all produce names (English)
 */
export const ALL_PRODUCE_NAMES: string[] = ALL_PRODUCE.map((p) => p.name);

/**
 * Quick lookup helper: Category by ID
 */
export function getCategoryById(categoryId?: string | null): ProduceCategory | undefined {
  if (!categoryId) return undefined;
  const upper = categoryId.trim().toUpperCase();
  return PRODUCE_CATEGORIES.find((c) => c.id === upper);
}

/**
 * Returns all produces belonging to a specific category
 */
export function getProducesByCategory(categoryId?: string | null): Produce[] {
  if (!categoryId) return [];
  const cat = getCategoryById(categoryId);
  return cat ? cat.items.filter((item) => item.isActive) : [];
}

/**
 * Returns a produce item by its stable ID
 */
export function getProduceById(produceId?: string | null): Produce | undefined {
  if (!produceId) return undefined;
  const upper = produceId.trim().toUpperCase();
  return ALL_PRODUCE.find((p) => p.id === upper);
}

/**
 * Finds produce by name or Kannada name (case-insensitive fuzzy match)
 */
export function findProduceByName(query?: string | null): Produce | undefined {
  if (!query) return undefined;
  const clean = query.trim().toLowerCase();
  // 1. Exact match on English name
  const exactEn = ALL_PRODUCE.find((p) => p.name.toLowerCase() === clean);
  if (exactEn) return exactEn;

  // 2. Exact match on Kannada name
  const exactKn = ALL_PRODUCE.find((p) => p.nameKn.toLowerCase() === clean);
  if (exactKn) return exactKn;

  // 3. Substring match
  return ALL_PRODUCE.find(
    (p) =>
      p.name.toLowerCase().includes(clean) ||
      clean.includes(p.name.toLowerCase()) ||
      p.nameKn.includes(clean)
  );
}

/**
 * Returns varieties for a given produce ID or name
 */
export function getVarietiesByProduce(produceIdOrName?: string | null): string[] {
  if (!produceIdOrName) return [];
  const byId = getProduceById(produceIdOrName);
  if (byId) return byId.varieties;

  const byName = findProduceByName(produceIdOrName);
  if (byName) return byName.varieties;

  return ['Other / Local Variety'];
}

/**
 * Backward-compatibility alias
 */
export function getVarietiesForProduce(produceName: string): string[] {
  return getVarietiesByProduce(produceName);
}

/**
 * Map legacy categories ('crop', 'vegetable', 'fruit', etc.) to the new stable category ID
 */
export function mapLegacyCategory(legacyCat?: string | null, produceName?: string | null): ProduceCategoryId {
  const cat = (legacyCat || '').trim().toLowerCase();

  // If produce name given, check if we can resolve exact category
  if (produceName) {
    const matched = findProduceByName(produceName);
    if (matched) return matched.categoryId;
  }

  if (cat === 'vegetable' || cat === 'vegetables') return 'VEGETABLES';
  if (cat === 'fruit' || cat === 'fruits') return 'FRUITS';
  if (cat === 'pulses') return 'PULSES';
  if (cat === 'oilseeds') return 'OILSEEDS';
  if (cat === 'spices') return 'SPICES';
  if (cat === 'commercial_crops' || cat === 'commercial') return 'COMMERCIAL_CROPS';
  if (cat === 'plantation_crops' || cat === 'plantation') return 'PLANTATION_CROPS';

  // Default legacy 'crop' or unknown -> CEREALS_MILLETS
  return 'CEREALS_MILLETS';
}

/**
 * Safe produce search across both English and Kannada names
 */
export function searchProduce(query: string, categoryId?: string | null): Produce[] {
  if (!query || !query.trim()) {
    if (categoryId && categoryId !== 'all') {
      return getProducesByCategory(categoryId);
    }
    return ALL_PRODUCE;
  }

  const q = query.trim().toLowerCase();
  const baseList = categoryId && categoryId !== 'all' ? getProducesByCategory(categoryId) : ALL_PRODUCE;

  return baseList.filter((p) => {
    const en = p.name.toLowerCase();
    const kn = p.nameKn.toLowerCase();
    const matchesVariety = p.varieties.some((v) => v.toLowerCase().includes(q));
    return en.includes(q) || kn.includes(q) || matchesVariety;
  });
}
