import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import api from '../../utils/api';
import {
  Wheat,
  Sprout,
  Sun,
  Factory,
  Coffee,
  Flame,
  Salad,
  Apple,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Layers,
  Sparkles,
  RefreshCw,
  Tag,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Building2,
  DollarSign,
  AlertCircle,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import {
  PRODUCE_CATEGORIES,
  ProduceCategoryId,
  getCategoryById,
  ALL_PRODUCE,
  Produce
} from '../../data/produceMaster';

export interface ProduceMarketItem {
  id: string | number;
  produceId?: string;
  name: string;
  name_kn: string;
  category: string;
  category_id: string;
  varieties: string[];
  pricePerKg: number;
  pricePerQuintal: number;
  mandiYard: string;
  trend: string; // e.g. "+2.4%" or "-1.2%" or "Stable"
  trendDirection: 'up' | 'down' | 'stable';
  msp?: number; // ₹/quintal
  dailyMinPrice?: number;
  dailyMaxPrice?: number;
  unit: string;
  is_active: boolean;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  all: <Layers size={17} />,
  CEREALS_MILLETS: <Wheat size={17} />,
  PULSES: <Sprout size={17} />,
  OILSEEDS: <Sun size={17} />,
  COMMERCIAL_CROPS: <Factory size={17} />,
  PLANTATION_CROPS: <Coffee size={17} />,
  SPICES: <Flame size={17} />,
  VEGETABLES: <Salad size={17} />,
  FRUITS: <Apple size={17} />,
};

// Karnataka Baseline Market Prices per Quintal & Primary Mandi Reference
const BASELINE_MARKET_DATA: Record<
  string,
  {
    pricePerKg: number;
    pricePerQuintal: number;
    mandiYard: string;
    trend: string;
    trendDirection: 'up' | 'down' | 'stable';
    msp?: number;
    dailyMinPrice: number;
    dailyMaxPrice: number;
  }
> = {
  // Cereals & Millets
  PADDY_RICE: { pricePerKg: 24.5, pricePerQuintal: 2450, mandiYard: 'Raichur APMC', trend: '+1.8%', trendDirection: 'up', msp: 2300, dailyMinPrice: 2300, dailyMaxPrice: 2600 },
  FINGER_MILLET_RAGI: { pricePerKg: 38.5, pricePerQuintal: 3850, mandiYard: 'Mandya APMC', trend: '+3.2%', trendDirection: 'up', msp: 4290, dailyMinPrice: 3600, dailyMaxPrice: 4100 },
  SORGHUM_JOWAR: { pricePerKg: 31.8, pricePerQuintal: 3180, mandiYard: 'Kalaburagi APMC', trend: '+0.5%', trendDirection: 'up', msp: 3371, dailyMinPrice: 3000, dailyMaxPrice: 3400 },
  MAIZE: { pricePerKg: 21.0, pricePerQuintal: 2100, mandiYard: 'Davanagere APMC', trend: '+1.2%', trendDirection: 'up', msp: 2225, dailyMinPrice: 1950, dailyMaxPrice: 2250 },
  WHEAT: { pricePerKg: 26.0, pricePerQuintal: 2600, mandiYard: 'Dharwad APMC', trend: '+0.8%', trendDirection: 'up', msp: 2425, dailyMinPrice: 2450, dailyMaxPrice: 2800 },
  PEARL_MILLET_BAJRA: { pricePerKg: 25.5, pricePerQuintal: 2550, mandiYard: 'Vijayapura APMC', trend: 'Stable', trendDirection: 'stable', msp: 2625, dailyMinPrice: 2400, dailyMaxPrice: 2700 },
  FOXTAIL_MILLET: { pricePerKg: 42.0, pricePerQuintal: 4200, mandiYard: 'Ballari APMC', trend: '+2.5%', trendDirection: 'up', msp: 3800, dailyMinPrice: 3900, dailyMaxPrice: 4500 },
  LITTLE_MILLET: { pricePerKg: 45.0, pricePerQuintal: 4500, mandiYard: 'Haveri APMC', trend: '+1.0%', trendDirection: 'up', msp: 4000, dailyMinPrice: 4200, dailyMaxPrice: 4800 },
  PROSO_MILLET: { pricePerKg: 39.0, pricePerQuintal: 3900, mandiYard: 'Koppal APMC', trend: 'Stable', trendDirection: 'stable', msp: 3600, dailyMinPrice: 3700, dailyMaxPrice: 4200 },
  BARNYARD_MILLET: { pricePerKg: 48.0, pricePerQuintal: 4800, mandiYard: 'Hassan APMC', trend: '+1.5%', trendDirection: 'up', msp: 4200, dailyMinPrice: 4400, dailyMaxPrice: 5100 },
  KODO_MILLET: { pricePerKg: 44.0, pricePerQuintal: 4400, mandiYard: 'Belagavi APMC', trend: '+2.0%', trendDirection: 'up', msp: 3900, dailyMinPrice: 4100, dailyMaxPrice: 4700 },
  BROWNTOP_MILLET: { pricePerKg: 85.0, pricePerQuintal: 8500, mandiYard: 'Tumakuru APMC', trend: '+4.0%', trendDirection: 'up', msp: 7000, dailyMinPrice: 8000, dailyMaxPrice: 9200 },

  // Pulses
  RED_GRAM_TUR: { pricePerKg: 78.5, pricePerQuintal: 7850, mandiYard: 'Kalaburagi APMC', trend: '+4.1%', trendDirection: 'up', msp: 7550, dailyMinPrice: 7400, dailyMaxPrice: 8300 },
  BENGAL_GRAM_CHANA: { pricePerKg: 54.4, pricePerQuintal: 5440, mandiYard: 'Bidar APMC', trend: '-0.8%', trendDirection: 'down', msp: 5650, dailyMinPrice: 5200, dailyMaxPrice: 5700 },
  BLACK_GRAM_URAD: { pricePerKg: 72.0, pricePerQuintal: 7200, mandiYard: 'Mysuru APMC', trend: '+1.4%', trendDirection: 'up', msp: 7400, dailyMinPrice: 6900, dailyMaxPrice: 7600 },
  GREEN_GRAM_MOONG: { pricePerKg: 82.0, pricePerQuintal: 8200, mandiYard: 'Gadag APMC', trend: '+2.2%', trendDirection: 'up', msp: 8682, dailyMinPrice: 7800, dailyMaxPrice: 8600 },
  HORSE_GRAM_HURULI: { pricePerKg: 46.0, pricePerQuintal: 4600, mandiYard: 'Ramanagara APMC', trend: 'Stable', trendDirection: 'stable', msp: 4200, dailyMinPrice: 4300, dailyMaxPrice: 4900 },
  COWPEA_ALASANDE: { pricePerKg: 52.0, pricePerQuintal: 5200, mandiYard: 'Chikkaballapur APMC', trend: '+1.1%', trendDirection: 'up', msp: 4800, dailyMinPrice: 4900, dailyMaxPrice: 5500 },

  // Oilseeds
  GROUNDNUT: { pricePerKg: 67.5, pricePerQuintal: 6750, mandiYard: 'Challakere APMC', trend: '+1.5%', trendDirection: 'up', msp: 6783, dailyMinPrice: 6400, dailyMaxPrice: 7100 },
  SUNFLOWER: { pricePerKg: 62.0, pricePerQuintal: 6200, mandiYard: 'Koppal APMC', trend: 'Stable', trendDirection: 'stable', msp: 7280, dailyMinPrice: 5900, dailyMaxPrice: 6500 },
  SOYBEAN: { pricePerKg: 47.0, pricePerQuintal: 4700, mandiYard: 'Belagavi APMC', trend: '-1.2%', trendDirection: 'down', msp: 4892, dailyMinPrice: 4500, dailyMaxPrice: 4950 },
  SESAME_TIL: { pricePerKg: 135.0, pricePerQuintal: 13500, mandiYard: 'Bagalkot APMC', trend: '+3.0%', trendDirection: 'up', msp: 9267, dailyMinPrice: 12800, dailyMaxPrice: 14200 },
  CASTOR_SEED: { pricePerKg: 58.0, pricePerQuintal: 5800, mandiYard: 'Raichur APMC', trend: '+0.6%', trendDirection: 'up', msp: 5500, dailyMinPrice: 5600, dailyMaxPrice: 6100 },
  MUSTARD: { pricePerKg: 59.0, pricePerQuintal: 5900, mandiYard: 'Vijayapura APMC', trend: 'Stable', trendDirection: 'stable', msp: 5950, dailyMinPrice: 5700, dailyMaxPrice: 6200 },

  // Commercial Crops
  SUGARCANE: { pricePerKg: 3.15, pricePerQuintal: 315, mandiYard: 'Mandya Sugar Belt', trend: 'Stable', trendDirection: 'stable', msp: 315, dailyMinPrice: 305, dailyMaxPrice: 330 },
  COTTON: { pricePerKg: 75.2, pricePerQuintal: 7520, mandiYard: 'Haveri APMC', trend: '+3.0%', trendDirection: 'up', msp: 7521, dailyMinPrice: 7200, dailyMaxPrice: 7900 },
  TOBACCO: { pricePerKg: 185.0, pricePerQuintal: 18500, mandiYard: 'Periyapatna Platform', trend: '+2.2%', trendDirection: 'up', msp: 16500, dailyMinPrice: 17500, dailyMaxPrice: 19800 },

  // Plantation Crops
  COFFEE: { pricePerKg: 185.0, pricePerQuintal: 18500, mandiYard: 'Chikmagalur APMC', trend: '+5.4%', trendDirection: 'up', msp: 15000, dailyMinPrice: 17800, dailyMaxPrice: 19500 },
  ARECANUT: { pricePerKg: 460.0, pricePerQuintal: 46000, mandiYard: 'Shivamogga APMC', trend: '+2.1%', trendDirection: 'up', msp: 38000, dailyMinPrice: 44000, dailyMaxPrice: 48500 },
  COCONUT: { pricePerKg: 32.0, pricePerQuintal: 3200, mandiYard: 'Tiptur Copra Yard', trend: '+1.8%', trendDirection: 'up', msp: 11160, dailyMinPrice: 2800, dailyMaxPrice: 3500 },
  CASHEW_NUT: { pricePerKg: 145.0, pricePerQuintal: 14500, mandiYard: 'Mangaluru APMC', trend: '+3.0%', trendDirection: 'up', msp: 12000, dailyMinPrice: 13800, dailyMaxPrice: 15200 },
  RUBBER: { pricePerKg: 192.0, pricePerQuintal: 19200, mandiYard: 'Sullia Rubber Yard', trend: '+1.2%', trendDirection: 'up', msp: 17500, dailyMinPrice: 18500, dailyMaxPrice: 19800 },

  // Spices
  CHILLI: { pricePerKg: 385.0, pricePerQuintal: 38500, mandiYard: 'Byadgi APMC Yard', trend: '+6.2%', trendDirection: 'up', msp: 28000, dailyMinPrice: 35000, dailyMaxPrice: 42000 },
  TURMERIC: { pricePerKg: 142.0, pricePerQuintal: 14200, mandiYard: 'Chamarajanagar APMC', trend: '+4.8%', trendDirection: 'up', msp: 11500, dailyMinPrice: 13500, dailyMaxPrice: 15200 },
  CARDAMOM: { pricePerKg: 1650.0, pricePerQuintal: 165000, mandiYard: 'Sakleshpur APMC', trend: '+3.5%', trendDirection: 'up', msp: 120000, dailyMinPrice: 155000, dailyMaxPrice: 178000 },
  BLACK_PEPPER: { pricePerKg: 580.0, pricePerQuintal: 58000, mandiYard: 'Sirsi APMC', trend: '+1.9%', trendDirection: 'up', msp: 48000, dailyMinPrice: 56000, dailyMaxPrice: 61000 },
  GINGER: { pricePerKg: 62.0, pricePerQuintal: 6200, mandiYard: 'Hassan APMC', trend: '-2.1%', trendDirection: 'down', msp: 5000, dailyMinPrice: 5800, dailyMaxPrice: 6800 },
  GARLIC: { pricePerKg: 160.0, pricePerQuintal: 16000, mandiYard: 'Bengaluru APMC', trend: '+5.0%', trendDirection: 'up', msp: 12000, dailyMinPrice: 15000, dailyMaxPrice: 17500 },
  CORIANDER_SEED: { pricePerKg: 88.0, pricePerQuintal: 8800, mandiYard: 'Bagalkot APMC', trend: '+1.0%', trendDirection: 'up', msp: 7500, dailyMinPrice: 8200, dailyMaxPrice: 9400 },

  // Vegetables
  TOMATO: { pricePerKg: 22.0, pricePerQuintal: 2200, mandiYard: 'Kolar APMC Market', trend: '-5.0%', trendDirection: 'down', msp: 1500, dailyMinPrice: 1800, dailyMaxPrice: 2600 },
  ONION: { pricePerKg: 28.0, pricePerQuintal: 2800, mandiYard: 'Hubli APMC Yard', trend: '+4.5%', trendDirection: 'up', msp: 2000, dailyMinPrice: 2400, dailyMaxPrice: 3200 },
  POTATO: { pricePerKg: 18.5, pricePerQuintal: 1850, mandiYard: 'Hassan APMC', trend: 'Stable', trendDirection: 'stable', msp: 1400, dailyMinPrice: 1650, dailyMaxPrice: 2100 },
  BRINJAL: { pricePerKg: 24.0, pricePerQuintal: 2400, mandiYard: 'Mysuru Bandipalya', trend: '+2.0%', trendDirection: 'up', msp: 1800, dailyMinPrice: 2000, dailyMaxPrice: 2800 },
  CABBAGE: { pricePerKg: 16.0, pricePerQuintal: 1600, mandiYard: 'Belagavi APMC', trend: '-1.0%', trendDirection: 'down', msp: 1200, dailyMinPrice: 1400, dailyMaxPrice: 1850 },
  CAULIFLOWER: { pricePerKg: 26.0, pricePerQuintal: 2600, mandiYard: 'Yeshwanthpur APMC', trend: '+1.5%', trendDirection: 'up', msp: 2000, dailyMinPrice: 2200, dailyMaxPrice: 3000 },
  CAPSICUM: { pricePerKg: 45.0, pricePerQuintal: 4500, mandiYard: 'Chikkaballapur APMC', trend: '+3.2%', trendDirection: 'up', msp: 3500, dailyMinPrice: 4000, dailyMaxPrice: 5200 },
  GREEN_CHILLI: { pricePerKg: 42.0, pricePerQuintal: 4200, mandiYard: 'Ranebennur APMC', trend: '+2.8%', trendDirection: 'up', msp: 3200, dailyMinPrice: 3800, dailyMaxPrice: 4800 },
  OKRA_BHENDI: { pricePerKg: 32.0, pricePerQuintal: 3200, mandiYard: 'Mandya APMC', trend: 'Stable', trendDirection: 'stable', msp: 2500, dailyMinPrice: 2800, dailyMaxPrice: 3600 },
  CARROT: { pricePerKg: 36.0, pricePerQuintal: 3600, mandiYard: 'Yeshwanthpur APMC', trend: '+1.8%', trendDirection: 'up', msp: 2800, dailyMinPrice: 3200, dailyMaxPrice: 4100 },

  // Fruits
  BANANA: { pricePerKg: 24.0, pricePerQuintal: 2400, mandiYard: 'Nanjangud APMC', trend: '+1.0%', trendDirection: 'up', msp: 1800, dailyMinPrice: 2100, dailyMaxPrice: 2700 },
  MANGO: { pricePerKg: 65.0, pricePerQuintal: 6500, mandiYard: 'Srinivaspur Mango Yard', trend: '+4.0%', trendDirection: 'up', msp: 4500, dailyMinPrice: 5500, dailyMaxPrice: 7800 },
  POMEGRANATE: { pricePerKg: 110.0, pricePerQuintal: 11000, mandiYard: 'Ilkal Fruit Market', trend: '+2.4%', trendDirection: 'up', msp: 8000, dailyMinPrice: 9500, dailyMaxPrice: 12500 },
  PAPAYA: { pricePerKg: 19.0, pricePerQuintal: 1900, mandiYard: 'Mandya APMC', trend: 'Stable', trendDirection: 'stable', msp: 1400, dailyMinPrice: 1650, dailyMaxPrice: 2200 },
  GUAVA: { pricePerKg: 35.0, pricePerQuintal: 3500, mandiYard: 'Ramanagara APMC', trend: '+1.2%', trendDirection: 'up', msp: 2600, dailyMinPrice: 3000, dailyMaxPrice: 4000 },
  GRAPES: { pricePerKg: 74.0, pricePerQuintal: 7400, mandiYard: 'Vijayapura APMC', trend: '+3.0%', trendDirection: 'up', msp: 5500, dailyMinPrice: 6800, dailyMaxPrice: 8200 },
  SAPOTA_CHIKU: { pricePerKg: 29.0, pricePerQuintal: 2900, mandiYard: 'Shivamogga APMC', trend: 'Stable', trendDirection: 'stable', msp: 2200, dailyMinPrice: 2500, dailyMaxPrice: 3300 },
  WATERMELON: { pricePerKg: 13.0, pricePerQuintal: 1300, mandiYard: 'Kolar APMC Market', trend: '-2.0%', trendDirection: 'down', msp: 950, dailyMinPrice: 1100, dailyMaxPrice: 1550 },
};

const STORAGE_KEY = 'farmer_trades_admin_market_prices';

export default function ProduceManager() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price_desc' | 'price_asc' | 'varieties'>('name');
  const [items, setItems] = useState<ProduceMarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Price Modal State
  const [editingItem, setEditingItem] = useState<ProduceMarketItem | null>(null);
  const [editPriceKg, setEditPriceKg] = useState<number>(0);
  const [editPriceQtl, setEditPriceQtl] = useState<number>(0);
  const [editMandiYard, setEditMandiYard] = useState<string>('');
  const [editTrend, setEditTrend] = useState<string>('');
  const [editTrendDirection, setEditTrendDirection] = useState<'up' | 'down' | 'stable'>('stable');
  const [editMinPrice, setEditMinPrice] = useState<number>(0);
  const [editMaxPrice, setEditMaxPrice] = useState<number>(0);

  // Add Produce Modal / Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatId, setNewCatId] = useState<string>('CEREALS_MILLETS');
  const [newName, setNewName] = useState('');
  const [newNameKn, setNewNameKn] = useState('');
  const [newVarieties, setNewVarieties] = useState('');
  const [newPriceKg, setNewPriceKg] = useState<string>('30');
  const [newMandiYard, setNewMandiYard] = useState('Bengaluru Yeshwanthpur APMC');

  // Inline add variety state
  const [addingVarietyToId, setAddingVarietyToId] = useState<string | number | null>(null);
  const [inlineVarietyName, setInlineVarietyName] = useState('');

  // Initial load
  useEffect(() => {
    loadProduceAndPrices();
  }, []);

  const loadProduceAndPrices = () => {
    setLoading(true);
    try {
      const savedOverrides = localStorage.getItem(STORAGE_KEY);
      const overridesMap: Record<string, Partial<ProduceMarketItem>> = savedOverrides
        ? JSON.parse(savedOverrides)
        : {};

      const combinedList: ProduceMarketItem[] = ALL_PRODUCE.map((prod, idx) => {
        const base = BASELINE_MARKET_DATA[prod.id] || {
          pricePerKg: 35.0,
          pricePerQuintal: 3500,
          mandiYard: 'State APMC Aggregate',
          trend: 'Stable',
          trendDirection: 'stable',
          msp: 3000,
          dailyMinPrice: 3200,
          dailyMaxPrice: 3800,
        };

        const itemKey = prod.id;
        const override = overridesMap[itemKey] || {};

        return {
          id: prod.id,
          produceId: prod.id,
          name: prod.name,
          name_kn: prod.nameKn,
          category: prod.categoryId,
          category_id: prod.categoryId,
          varieties: override.varieties || prod.varieties,
          pricePerKg: override.pricePerKg ?? base.pricePerKg,
          pricePerQuintal: override.pricePerQuintal ?? base.pricePerQuintal,
          mandiYard: override.mandiYard || base.mandiYard,
          trend: override.trend || base.trend,
          trendDirection: override.trendDirection || base.trendDirection,
          msp: override.msp ?? base.msp,
          dailyMinPrice: override.dailyMinPrice ?? base.dailyMinPrice,
          dailyMaxPrice: override.dailyMaxPrice ?? base.dailyMaxPrice,
          unit: 'Quintal',
          is_active: prod.isActive,
        };
      });

      // Also merge any admin-created items saved previously
      if (overridesMap['__custom_items__']) {
        const customItems = overridesMap['__custom_items__'] as unknown as ProduceMarketItem[];
        combinedList.push(...customItems);
      }

      setItems(combinedList);
    } catch (err) {
      console.error('Error loading market prices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save changes to localStorage
  const saveOverrides = (updatedList: ProduceMarketItem[]) => {
    try {
      const overridesMap: Record<string, any> = {};
      const customItems: ProduceMarketItem[] = [];

      updatedList.forEach((it) => {
        if (typeof it.id === 'string' && BASELINE_MARKET_DATA[it.id]) {
          overridesMap[it.id] = {
            pricePerKg: it.pricePerKg,
            pricePerQuintal: it.pricePerQuintal,
            mandiYard: it.mandiYard,
            trend: it.trend,
            trendDirection: it.trendDirection,
            dailyMinPrice: it.dailyMinPrice,
            dailyMaxPrice: it.dailyMaxPrice,
            varieties: it.varieties,
          };
        } else {
          customItems.push(it);
        }
      });

      overridesMap['__custom_items__'] = customItems;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overridesMap));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  };

  // Open Edit Price Modal
  const handleOpenEdit = (item: ProduceMarketItem) => {
    setEditingItem(item);
    setEditPriceKg(item.pricePerKg);
    setEditPriceQtl(item.pricePerQuintal);
    setEditMandiYard(item.mandiYard);
    setEditTrend(item.trend);
    setEditTrendDirection(item.trendDirection);
    setEditMinPrice(item.dailyMinPrice || Math.round(item.pricePerQuintal * 0.95));
    setEditMaxPrice(item.dailyMaxPrice || Math.round(item.pricePerQuintal * 1.08));
  };

  // Sync Price per kg <-> Price per quintal
  const handleKgChange = (val: number) => {
    setEditPriceKg(val);
    setEditPriceQtl(Math.round(val * 100));
    setEditMinPrice(Math.round(val * 95));
    setEditMaxPrice(Math.round(val * 108));
  };

  const handleQtlChange = (val: number) => {
    setEditPriceQtl(val);
    setEditPriceKg(parseFloat((val / 100).toFixed(2)));
    setEditMinPrice(Math.round(val * 0.95));
    setEditMaxPrice(Math.round(val * 1.08));
  };

  // Save Price Updates
  const handleSavePrice = () => {
    if (!editingItem) return;

    const updated = items.map((it) => {
      if (it.id === editingItem.id) {
        return {
          ...it,
          pricePerKg: editPriceKg,
          pricePerQuintal: editPriceQtl,
          mandiYard: editMandiYard.trim() || it.mandiYard,
          trend: editTrend.trim() || it.trend,
          trendDirection: editTrendDirection,
          dailyMinPrice: editMinPrice,
          dailyMaxPrice: editMaxPrice,
        };
      }
      return it;
    });

    setItems(updated);
    saveOverrides(updated);
    setEditingItem(null);
  };

  // Add Produce
  const handleAddProduce = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const priceKg = parseFloat(newPriceKg) || 30;
    const priceQtl = Math.round(priceKg * 100);

    const varsArray = newVarieties
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    if (varsArray.length === 0) {
      varsArray.push('Standard Regional Hybrid', 'Local Selection');
    }

    const newItem: ProduceMarketItem = {
      id: `custom_${Date.now()}`,
      produceId: `CUSTOM_${Date.now()}`,
      name: newName.trim(),
      name_kn: newNameKn.trim() || newName.trim(),
      category: newCatId,
      category_id: newCatId,
      varieties: varsArray,
      pricePerKg: priceKg,
      pricePerQuintal: priceQtl,
      mandiYard: newMandiYard.trim() || 'Karnataka State Mandi Yard',
      trend: '+1.5%',
      trendDirection: 'up',
      msp: Math.round(priceQtl * 0.9),
      dailyMinPrice: Math.round(priceQtl * 0.95),
      dailyMaxPrice: Math.round(priceQtl * 1.08),
      unit: 'Quintal',
      is_active: true,
    };

    const updated = [newItem, ...items];
    setItems(updated);
    saveOverrides(updated);

    setNewName('');
    setNewNameKn('');
    setNewVarieties('');
    setShowAddModal(false);
  };

  // Delete Produce
  const handleDelete = (id: string | number, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the active produces & market prices list?`)) return;
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    saveOverrides(updated);
  };

  // Add Variety
  const handleAddVariety = (item: ProduceMarketItem) => {
    if (!inlineVarietyName.trim()) return;
    const updatedVarieties = [...(item.varieties || []), inlineVarietyName.trim()];
    const updated = items.map((it) => (it.id === item.id ? { ...it, varieties: updatedVarieties } : it));
    setItems(updated);
    saveOverrides(updated);
    setInlineVarietyName('');
    setAddingVarietyToId(null);
  };

  // Remove Variety
  const handleRemoveVariety = (item: ProduceMarketItem, varToRemove: string) => {
    const updatedVarieties = (item.varieties || []).filter((v) => v !== varToRemove);
    const updated = items.map((it) => (it.id === item.id ? { ...it, varieties: updatedVarieties } : it));
    setItems(updated);
    saveOverrides(updated);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Produce Name',
      'Kannada Name',
      'Category',
      'Current Price (₹/kg)',
      'Market Price (₹/Quintal)',
      'Primary APMC Mandi Yard',
      'Price Trend',
      'Daily Min (₹)',
      'Daily Max (₹)',
      'MSP Benchmark (₹)',
      'Approved Varieties',
    ];

    const rows = filteredItems.map((it) => [
      `"${it.name}"`,
      `"${it.name_kn}"`,
      `"${it.category_id}"`,
      it.pricePerKg,
      it.pricePerQuintal,
      `"${it.mandiYard}"`,
      `"${it.trend}"`,
      it.dailyMinPrice || '',
      it.dailyMaxPrice || '',
      it.msp || '',
      `"${it.varieties.join('; ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Karnataka_Produces_Market_Prices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    let list = items.filter((it) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = (it.category_id || it.category || '').toUpperCase();
        if (cat !== selectedCategory.toUpperCase()) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = it.name.toLowerCase().includes(q);
        const matchesNameKn = it.name_kn?.toLowerCase().includes(q);
        const matchesMandi = it.mandiYard.toLowerCase().includes(q);
        const matchesVariety = it.varieties.some((v) => v.toLowerCase().includes(q));
        if (!matchesName && !matchesNameKn && !matchesMandi && !matchesVariety) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'price_desc') return b.pricePerQuintal - a.pricePerQuintal;
      if (sortBy === 'price_asc') return a.pricePerQuintal - b.pricePerQuintal;
      if (sortBy === 'varieties') return b.varieties.length - a.varieties.length;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [items, selectedCategory, searchQuery, sortBy]);

  // Aggregate statistics
  const totalVarietiesCount = items.reduce((acc, it) => acc + (it.varieties?.length || 0), 0);
  const avgQuintalPrice = Math.round(
    items.reduce((acc, it) => acc + (it.pricePerQuintal || 0), 0) / (items.length || 1)
  );
  const mandisCount = new Set(items.map((it) => it.mandiYard)).size;

  return (
    <div className="animate-fadeIn w-full text-slate-100 pb-16" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* ── 1. Top Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
            <Sparkles size={13} className="text-emerald-400" />
            <span>Karnataka APMC Live Market Benchmark System</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <TrendingUp size={30} className="text-emerald-400" />
            Produces, Varieties & Current Market Prices
          </h1>
          <p className="text-gray-300 text-sm mt-1 max-w-3xl">
            State administrator catalog of all 8 Karnataka agricultural categories, approved regional crop varieties,
            and live APMC mandi market price benchmarks per Quintal and Kilogram.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md px-4 py-2 rounded-lg"
          >
            <Plus size={16} /> Add Produce
          </button>

          <button
            onClick={handleExportCSV}
            className="btn btn-secondary btn-sm flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-lg"
            title="Download CSV Price Sheet"
          >
            <Download size={15} /> Export CSV
          </button>

          <button
            onClick={loadProduceAndPrices}
            className="btn btn-secondary btn-sm flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg"
            title="Refresh prices"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* ── 2. Top Summary KPI Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Produces */}
        <div
          className="rounded-xl p-4 border flex items-center gap-3.5 shadow-sm"
          style={{ background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.4) 0%, rgba(3, 20, 14, 0.8) 100%)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
        >
          <div className="w-11 h-11 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Wheat size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{items.length}</div>
            <div className="text-xs font-semibold text-emerald-300">All Monitored Produces</div>
            <div className="text-[11px] text-gray-400">Across 8 State Categories</div>
          </div>
        </div>

        {/* Total Varieties */}
        <div
          className="rounded-xl p-4 border flex items-center gap-3.5 shadow-sm"
          style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.35) 0%, rgba(3, 20, 14, 0.8) 100%)', borderColor: 'rgba(59, 130, 246, 0.3)' }}
        >
          <div className="w-11 h-11 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Tag size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalVarietiesCount}+</div>
            <div className="text-xs font-semibold text-blue-300">Regional Varieties & Hybrids</div>
            <div className="text-[11px] text-gray-400">UAS Dharwad & Bangalore catalog</div>
          </div>
        </div>

        {/* State Average Price */}
        <div
          className="rounded-xl p-4 border flex items-center gap-3.5 shadow-sm"
          style={{ background: 'linear-gradient(135deg, rgba(146, 64, 14, 0.35) 0%, rgba(3, 20, 14, 0.8) 100%)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
        >
          <div className="w-11 h-11 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">₹{avgQuintalPrice.toLocaleString('en-IN')}</div>
            <div className="text-xs font-semibold text-amber-300">State Avg / Quintal</div>
            <div className="text-[11px] text-gray-400">₹{(avgQuintalPrice / 100).toFixed(1)} / kg benchmark</div>
          </div>
        </div>

        {/* Connected Mandis */}
        <div
          className="rounded-xl p-4 border flex items-center gap-3.5 shadow-sm"
          style={{ background: 'linear-gradient(135deg, rgba(126, 34, 206, 0.35) 0%, rgba(3, 20, 14, 0.8) 100%)', borderColor: 'rgba(168, 85, 247, 0.3)' }}
        >
          <div className="w-11 h-11 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Building2 size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{mandisCount} Mandis</div>
            <div className="text-xs font-semibold text-purple-300">Karnataka APMC Yards</div>
            <div className="text-[11px] text-gray-400">Live auction daily rate link</div>
          </div>
        </div>
      </div>

      {/* ── 3. Category Selector Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50 border border-emerald-400'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Layers size={14} /> All Categories ({items.length})
        </button>

        {PRODUCE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = items.filter((it) => (it.category_id || it.category || '').toUpperCase() === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50 border border-emerald-400'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{CATEGORY_ICONS[cat.id]}</span>
              <span>{cat.label}</span>
              <span className="text-[11px] opacity-75 font-normal">({count})</span>
            </button>
          );
        })}
      </div>

      {/* ── 4. Search & Controls Bar ── */}
      <div
        className="rounded-xl p-3 mb-5 flex flex-wrap items-center justify-between gap-3 border shadow-sm"
        style={{ background: 'rgba(3, 20, 14, 0.75)', borderColor: 'rgba(16, 185, 129, 0.25)' }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input
            type="text"
            placeholder="Search produces, Kannada names (e.g. ರಾಗಿ, ಭತ್ತ), varieties, or mandis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/90 text-white text-xs pl-9 pr-8 py-2 rounded-lg border border-emerald-500/30 focus:border-emerald-400 focus:outline-none transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort & Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 text-white text-xs border border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-emerald-400 focus:outline-none"
            >
              <option value="name">Produce Name (A - Z)</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="varieties">Most Varieties</option>
            </select>
          </div>

          <div className="text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-semibold">
            Showing {filteredItems.length} of {items.length} produces
          </div>
        </div>
      </div>

      {/* ── 5. Produces & Current Market Prices Master Table ── */}
      {loading ? (
        <div className="rounded-xl border border-emerald-500/20 p-12 text-center bg-slate-950/60">
          <RefreshCw size={28} className="animate-spin text-emerald-400 mx-auto mb-3" />
          <p className="text-emerald-300 font-semibold text-sm">Loading Karnataka produces & live APMC market data…</p>
        </div>
      ) : (
        <div
          className="rounded-xl border shadow-lg overflow-hidden"
          style={{ background: 'rgba(3, 20, 14, 0.85)', borderColor: 'rgba(16, 185, 129, 0.25)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/90 text-gray-300 border-b border-emerald-500/20 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-3 w-10 text-center text-gray-400">#</th>
                  <th className="py-3 px-4 min-w-[200px]">Produce Item & Kannada</th>
                  <th className="py-3 px-3 min-w-[130px]">Category</th>
                  <th className="py-3 px-4 min-w-[280px]">Configured Regional Varieties ({totalVarietiesCount})</th>
                  <th className="py-3 px-4 min-w-[170px] text-right">Current Market Price</th>
                  <th className="py-3 px-4 min-w-[170px]">Primary Mandi Yard</th>
                  <th className="py-3 px-3 min-w-[110px] text-center">Price Trend</th>
                  <th className="py-3 px-3 w-28 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      No produces found matching your search. Try adjusting the query or select "All Categories".
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => {
                    const catMeta = getCategoryById(item.category_id || item.category);
                    const isAddingVar = addingVarietyToId === item.id;
                    const isAboveMsp = item.msp ? item.pricePerQuintal >= item.msp : true;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-emerald-950/20 transition-colors group"
                      >
                        {/* Index */}
                        <td className="py-3 px-3 text-center text-gray-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Produce & Kannada Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-emerald-400 font-semibold text-xs">
                              {item.name_kn || '—'}
                            </span>
                            {item.dailyMinPrice && item.dailyMaxPrice && (
                              <span className="text-[10px] text-gray-400">
                                (Day: ₹{item.dailyMinPrice} - ₹{item.dailyMaxPrice})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border"
                            style={{
                              backgroundColor: 'rgba(6, 78, 59, 0.4)',
                              color: '#34d399',
                              borderColor: 'rgba(52, 211, 153, 0.3)',
                            }}
                          >
                            {CATEGORY_ICONS[(item.category_id || item.category || '').toUpperCase()]}
                            <span>{catMeta?.label || item.category_id}</span>
                          </span>
                        </td>

                        {/* Varieties */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap items-center gap-1.5 max-w-xl">
                            {(item.varieties || []).map((v) => (
                              <span
                                key={v}
                                className="inline-flex items-center gap-1 bg-slate-900/90 text-slate-200 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-medium group/chip hover:border-emerald-400 transition-colors"
                              >
                                <Tag size={9} className="text-emerald-400" />
                                <span>{v}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariety(item, v)}
                                  className="text-gray-400 hover:text-rose-400 ml-0.5 text-xs font-bold leading-none cursor-pointer"
                                  title={`Remove variety ${v}`}
                                >
                                  ×
                                </button>
                              </span>
                            ))}

                            {/* Inline Add Variety Input / Button */}
                            {isAddingVar ? (
                              <div className="inline-flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-emerald-500">
                                <input
                                  type="text"
                                  placeholder="New variety..."
                                  value={inlineVarietyName}
                                  onChange={(e) => setInlineVarietyName(e.target.value)}
                                  className="bg-transparent text-white text-[11px] px-1.5 py-0.5 w-28 focus:outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddVariety(item);
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddVariety(item)}
                                  className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px]"
                                  title="Confirm variety"
                                >
                                  <Check size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAddingVarietyToId(null);
                                    setInlineVarietyName('');
                                  }}
                                  className="p-1 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded text-[10px]"
                                  title="Cancel"
                                >
                                  <X size={11} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingVarietyToId(item.id);
                                  setInlineVarietyName('');
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-dashed border-emerald-500/50 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/50 text-[10px] font-semibold cursor-pointer transition-colors"
                                title="Add variety to produce"
                              >
                                <Plus size={10} /> Variety
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Current Market Price */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-extrabold text-emerald-300 text-sm tracking-tight">
                              ₹{item.pricePerQuintal.toLocaleString('en-IN')}{' '}
                              <span className="text-[10px] font-normal text-gray-300">/ qtl</span>
                            </span>
                            <span className="text-[11px] text-gray-200 font-semibold">
                              ₹{item.pricePerKg.toFixed(2)}{' '}
                              <span className="text-[10px] font-normal text-gray-400">/ kg</span>
                            </span>
                            {item.msp && (
                              <span
                                className={`text-[10px] font-medium mt-0.5 px-1.5 py-0.2 rounded ${
                                  isAboveMsp
                                    ? 'text-emerald-400 bg-emerald-950/60'
                                    : 'text-amber-300 bg-amber-950/60'
                                }`}
                              >
                                MSP: ₹{item.msp}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Primary Mandi Yard */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-gray-200 font-medium">
                            <Building2 size={13} className="text-emerald-400 shrink-0" />
                            <span>{item.mandiYard}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">Official Karnataka APMC</span>
                        </td>

                        {/* Price Trend */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.trendDirection === 'up'
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                                : item.trendDirection === 'down'
                                ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                                : 'bg-slate-900 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {item.trendDirection === 'up' && <TrendingUp size={11} />}
                            {item.trendDirection === 'down' && <TrendingDown size={11} />}
                            {item.trendDirection === 'stable' && <span>▬</span>}
                            <span>{item.trend}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/30 rounded-md transition-colors"
                              title="Update live market price & APMC yard"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.name)}
                              className="p-1.5 bg-rose-950/50 hover:bg-rose-900/70 text-rose-400 border border-rose-500/30 rounded-md transition-colors"
                              title="Delete produce"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 6. Modal: Quick Price & APMC Editor ── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative"
            style={{
              background: 'linear-gradient(135deg, #03140e 0%, #08291c 100%)',
              borderColor: 'rgba(16, 185, 129, 0.4)',
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20 mb-5">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Admin Price Benchmark Editor
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5 flex items-center gap-2">
                  <TrendingUp size={20} className="text-emerald-400" />
                  {editingItem.name}{' '}
                  <span className="text-emerald-400 font-semibold text-base">({editingItem.name_kn})</span>
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Price per Kg & Price per Quintal sync */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1">
                    Market Price (₹ / Kilogram) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="0.1"
                      value={editPriceKg}
                      onChange={(e) => handleKgChange(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 text-white font-mono font-bold text-sm pl-7 pr-3 py-2 rounded-lg border border-emerald-500/40 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1">
                    Market Price (₹ / Quintal) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={editPriceQtl}
                      onChange={(e) => handleQtlChange(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 text-white font-mono font-bold text-sm pl-7 pr-3 py-2 rounded-lg border border-emerald-500/40 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* APMC Mandi Yard */}
              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-1">
                  Primary Karnataka APMC Mandi Yard *
                </label>
                <input
                  type="text"
                  value={editMandiYard}
                  onChange={(e) => setEditMandiYard(e.target.value)}
                  placeholder="e.g. Mandya APMC, Byadgi APMC Yard, Raichur APMC"
                  className="w-full bg-slate-950 text-white text-xs px-3 py-2 rounded-lg border border-emerald-500/40 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              {/* Price Trend & Direction */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1">Price Trend Tag</label>
                  <input
                    type="text"
                    value={editTrend}
                    onChange={(e) => setEditTrend(e.target.value)}
                    placeholder="e.g. +2.4%, -1.2%, Stable"
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2 rounded-lg border border-emerald-500/40 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1">Trend Direction</label>
                  <select
                    value={editTrendDirection}
                    onChange={(e) => setEditTrendDirection(e.target.value as any)}
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2 rounded-lg border border-emerald-500/40 focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="up">Bullish / Up (▲ Green)</option>
                    <option value="down">Bearish / Down (▼ Red)</option>
                    <option value="stable">Stable / Neutral (▬ Gray)</option>
                  </select>
                </div>
              </div>

              {/* Daily Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1">Daily Min Rate (₹/qtl)</label>
                  <input
                    type="number"
                    value={editMinPrice}
                    onChange={(e) => setEditMinPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 text-white font-mono text-xs px-3 py-2 rounded-lg border border-slate-700 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1">Daily Max Rate (₹/qtl)</label>
                  <input
                    type="number"
                    value={editMaxPrice}
                    onChange={(e) => setEditMaxPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 text-white font-mono text-xs px-3 py-2 rounded-lg border border-slate-700 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-emerald-500/20">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePrice}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50 flex items-center gap-1.5 transition-all"
              >
                <Check size={14} /> Save Price Benchmark
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Modal: Add New Produce ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleAddProduce}
            className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative"
            style={{
              background: 'linear-gradient(135deg, #03140e 0%, #08291c 100%)',
              borderColor: 'rgba(16, 185, 129, 0.4)',
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20 mb-5">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Karnataka Produce Catalog
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5 flex items-center gap-2">
                  <Plus size={20} className="text-emerald-400" /> Add New Produce Item
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-1">Category *</label>
                <select
                  value={newCatId}
                  onChange={(e) => setNewCatId(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs px-3 py-2 rounded-lg border border-emerald-500/40 focus:border-emerald-400 focus:outline-none"
                >
                  {PRODUCE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.labelKn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1">
                    Produce English Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Foxtail Millet"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2 rounded-lg border border-emerald-500/40 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1">
                    Kannada Name (ಕನ್ನಡ)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ನವಣೆ"
                    value={newNameKn}
                    onChange={(e) => setNewNameKn(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2 rounded-lg border border-emerald-500/40 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-1">
                  Approved Varieties (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. GPUF-3, SIA-326, Local Selection"
                  value={newVarieties}
                  onChange={(e) => setNewVarieties(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs px-3 py-2 rounded-lg border border-emerald-500/40 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1">
                    Initial Price (₹ / kg) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newPriceKg}
                    onChange={(e) => setNewPriceKg(e.target.value)}
                    className="w-full bg-slate-950 text-white font-mono text-xs px-3 py-2 rounded-lg border border-emerald-500/40 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1">
                    Reference APMC Yard
                  </label>
                  <input
                    type="text"
                    value={newMandiYard}
                    onChange={(e) => setNewMandiYard(e.target.value)}
                    placeholder="e.g. Mandya APMC"
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2 rounded-lg border border-emerald-500/40 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-emerald-500/20">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newName.trim()}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Plus size={14} /> Add Produce to Catalog
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
