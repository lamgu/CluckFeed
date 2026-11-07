import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import {
  LivestockType,
  AgeUnit,
  FormulaResultData,
  PresetItem,
  HistoryFormulaItem,
  TargetNutrisi,
  Ingredient
} from '../types';
import { solveFeedFormulation } from '../utils/formulationSolver';
import type { NutrientConstraintSpec } from '../utils/lpSolver';
import { INGREDIENT_NUTRIENT_COLUMNS } from '../data/sheet1Ingredients';
import { useIngredients } from '../hooks/useIngredients';
import { usePresets } from '../hooks/usePresets';
import { useHistory } from '../hooks/useHistory';
import { useFarm } from '../hooks/useFarm';
import { useMarketPrices } from '../hooks/useMarketPrices';

export interface NutrientDiffItem {
  field: keyof Ingredient;
  label: string;
  unit: string;
  defaultVal: number;
  customVal: number;
}

interface AppContextType {
  // Master Dynamic Data (From SQLite DB / Matrix Bahan Baku)
  ingredients: Ingredient[];
  loadingIngs: boolean;
  toggleIngredient: (id: string) => void;
  updateIngredient: (id: string, patch: Partial<Ingredient>) => void;
  addIngredient: (data: Omit<Ingredient, 'id'> & { id?: string }) => Promise<Ingredient>;
  removeIngredient: (id: string) => void;
  resetDefaults: () => void;

  presets: PresetItem[];
  addPreset: (preset: Omit<PresetItem, 'id'>) => Promise<PresetItem>;
  updatePreset: (id: string, patch: Partial<PresetItem>) => Promise<PresetItem | undefined>;
  removePreset: (id: string) => void;

  history: HistoryFormulaItem[];
  addHistory: (item: Omit<HistoryFormulaItem, 'id'> & { id?: string }) => Promise<HistoryFormulaItem>;
  updateHistory: (id: string, patch: Partial<HistoryFormulaItem>) => Promise<HistoryFormulaItem | undefined>;
  removeHistory: (id: string) => void;
  clearAllHistory: () => void;

  farmConfig: ReturnType<typeof useFarm>['config'];
  kandang: ReturnType<typeof useFarm>['kandang'];
  sensor: ReturnType<typeof useFarm>['sensor'];
  schedule: ReturnType<typeof useFarm>['schedule'];

  marketPrices: ReturnType<typeof useMarketPrices>['marketPrices'];
  updateMarketPrices: ReturnType<typeof useMarketPrices>['updateMarketPrices'];

  // ---- Formulation Session State (Isolated from Master DB) ----
  formulationIngredients: Ingredient[];
  customNutrientOverrides: Record<string, Record<string, number>>;
  
  toggleFormulationIngredient: (id: string) => void;
  selectAllFormulationIngredients: (select: boolean) => void;
  updateFormulationIngredientPrice: (id: string, price: number) => void;
  toggleFormulationConstraint: (id: string) => void;
  updateFormulationIngredientConstraint: (id: string, min?: number, max?: number) => void;
  updateFormulationNutrient: (ingredientId: string, field: keyof Ingredient, value: number) => void;
  resetIngredientNutrientsToDefault: (ingredientId: string) => void;
  resetAllNutrientsToDefault: () => void;
  isIngredientCustom: (ingredientId: string) => boolean;
  getIngredientDiffs: (ingredientId: string) => NutrientDiffItem[];
  getEffectiveIngredients: () => Ingredient[];

  // Formulation Parameters
  livestock: LivestockType;
  setLivestock: (l: LivestockType) => void;
  ageValue: number;
  setAgeValue: (a: number) => void;
  ageUnit: AgeUnit;
  setAgeUnit: (u: AgeUnit) => void;
  batchKg: number;
  setBatchKg: (b: number) => void;
  currentResult: FormulaResultData | null;
  setCurrentResult: (res: FormulaResultData | null) => void;
  resultSource: 'beranda' | 'riwayat' | 'workflow-step3';
  setResultSource: (source: 'beranda' | 'riwayat' | 'workflow-step3') => void;

  // Actions
  handleCalculate: (customNutrients?: Partial<TargetNutrisi>, customConstraints?: NutrientConstraintSpec[]) => FormulaResultData;
  handleSelectPreset: (preset: PresetItem) => void;
  handleRepeatFormula: (item: HistoryFormulaItem) => void;
  handleViewFormulaDetails: (item?: HistoryFormulaItem, source?: 'beranda' | 'riwayat') => void;
  handleApplyAISubstitution: (onSuccess?: () => void) => void;
  handleUpdateStock: (id: string, newStockKg: number, newPrice: number) => void;

  // Global Modals State
  showNotificationModal: boolean;
  setShowNotificationModal: (show: boolean) => void;
  showStockModal: boolean;
  setShowStockModal: (show: boolean) => void;
  showCalibrationModal: boolean;
  setShowCalibrationModal: (show: boolean) => void;
  showMarketPriceModal: boolean;
  setShowMarketPriceModal: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ---- Master Database Hooks ----
  const {
    ingredients: masterIngredients,
    loading: loadingIngs,
    toggleIngredient: toggleMasterIngredient,
    updateIngredient: updateMasterIngredient,
    addIngredient: addMasterIngredient,
    removeIngredient: removeMasterIngredient,
    resetDefaults: resetMasterDefaults
  } = useIngredients();

  const { presets, addPreset, updatePreset, removePreset } = usePresets();
  const { history, addHistory, updateHistory, removeHistory, clearAllHistory } = useHistory();
  const { config: farmConfig, kandang, sensor, schedule } = useFarm();
  const { marketPrices, updateMarketPrices } = useMarketPrices();

  // ---- Formulation Session State (Separated from Master DB) ----
  // Session copy of ingredients for current formulation
  const [sessionIngredients, setSessionIngredients] = useState<Ingredient[]>([]);

  // Overrides structure: [ingredientId][nutrientField] = customValue
  const [customNutrientOverrides, setCustomNutrientOverrides] = useState<Record<string, Record<string, number>>>({});

  // Sync session ingredients when master ingredients load or change
  useEffect(() => {
    if (masterIngredients && masterIngredients.length > 0) {
      setSessionIngredients(prev => {
        if (prev.length === 0) {
          // Initialize deep copy
          return masterIngredients.map(ing => ({ ...ing }));
        }
        // Merge updates from master DB while preserving in-session selection, price & constraints
        return masterIngredients.map(master => {
          const existing = prev.find(p => p.id === master.id);
          if (!existing) return { ...master };
          return {
            ...master,
            selected: existing.selected,
            currentPrice: existing.currentPrice,
            minConstraint: existing.minConstraint,
            maxConstraint: existing.maxConstraint,
            hasConstraint: existing.hasConstraint
          };
        });
      });
    }
  }, [masterIngredients]);

  // Formulation Parameters
  const [livestock, setLivestock] = useState<LivestockType>('broiler');
  const [ageValue, setAgeValue] = useState<number>(21);
  const [ageUnit, setAgeUnit] = useState<AgeUnit>('hari');
  const [batchKg, setBatchKg] = useState<number>(500);
  const [currentResult, setCurrentResult] = useState<FormulaResultData | null>(null);
  const [resultSource, setResultSource] = useState<'beranda' | 'riwayat' | 'workflow-step3'>('beranda');

  // Modals
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [showStockModal, setShowStockModal] = useState<boolean>(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(false);
  const [showMarketPriceModal, setShowMarketPriceModal] = useState<boolean>(false);

  // ---- Session Formulation Helpers ----
  const toggleFormulationIngredient = useCallback((id: string) => {
    setSessionIngredients(prev =>
      prev.map(i => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  }, []);

  const selectAllFormulationIngredients = useCallback((select: boolean) => {
    setSessionIngredients(prev => prev.map(i => ({ ...i, selected: select })));
  }, []);

  const updateFormulationIngredientPrice = useCallback((id: string, price: number) => {
    setSessionIngredients(prev =>
      prev.map(i => (i.id === id ? { ...i, currentPrice: price } : i))
    );
  }, []);

  const toggleFormulationConstraint = useCallback((id: string) => {
    setSessionIngredients(prev =>
      prev.map(i => (i.id === id ? { ...i, hasConstraint: !i.hasConstraint } : i))
    );
  }, []);

  const updateFormulationIngredientConstraint = useCallback((id: string, min?: number, max?: number) => {
    setSessionIngredients(prev =>
      prev.map(i => {
        if (i.id !== id) return i;
        const patch: Partial<Ingredient> = {};
        if (min !== undefined) patch.minConstraint = min;
        if (max !== undefined) patch.maxConstraint = max;
        return { ...i, ...patch, hasConstraint: true };
      })
    );
  }, []);

  // Tahap 2: Edit nutrient value directly in session
  const updateFormulationNutrient = useCallback((ingredientId: string, field: keyof Ingredient, value: number) => {
    setCustomNutrientOverrides(prev => {
      const ingOverrides = { ...(prev[ingredientId] || {}) };
      // Check default value from master ingredient
      const masterIng = masterIngredients.find(m => m.id === ingredientId);
      const defaultVal = Number((masterIng as any)?.[field] ?? 0);

      // If user typed back the exact default value, remove override
      if (Math.abs(value - defaultVal) < 1e-6) {
        delete ingOverrides[field as string];
        if (Object.keys(ingOverrides).length === 0) {
          const next = { ...prev };
          delete next[ingredientId];
          return next;
        }
        return { ...prev, [ingredientId]: ingOverrides };
      }

      ingOverrides[field as string] = value;
      return { ...prev, [ingredientId]: ingOverrides };
    });
  }, [masterIngredients]);

  // Tahap 2: Reset specific ingredient to Default
  const resetIngredientNutrientsToDefault = useCallback((ingredientId: string) => {
    setCustomNutrientOverrides(prev => {
      const next = { ...prev };
      delete next[ingredientId];
      return next;
    });
  }, []);

  // Tahap 2: Reset all ingredients to Default
  const resetAllNutrientsToDefault = useCallback(() => {
    setCustomNutrientOverrides({});
  }, []);

  // Tahap 2: Check whether ingredient is Custom or Default
  const isIngredientCustom = useCallback((ingredientId: string): boolean => {
    const overrides = customNutrientOverrides[ingredientId];
    return !!overrides && Object.keys(overrides).length > 0;
  }, [customNutrientOverrides]);

  // Tahap 2: Get diff list (Default vs Custom) for an ingredient
  const getIngredientDiffs = useCallback((ingredientId: string): NutrientDiffItem[] => {
    const overrides = customNutrientOverrides[ingredientId];
    if (!overrides) return [];

    const masterIng = masterIngredients.find(m => m.id === ingredientId);
    if (!masterIng) return [];

    const diffs: NutrientDiffItem[] = [];
    for (const [fieldStr, customVal] of Object.entries(overrides)) {
      const field = fieldStr as keyof Ingredient;
      const defaultVal = Number((masterIng as any)[field] ?? 0);
      const colDef = INGREDIENT_NUTRIENT_COLUMNS.find(c => c.key === field);
      diffs.push({
        field,
        label: colDef?.label || fieldStr,
        unit: colDef?.unit || '%',
        defaultVal,
        customVal
      });
    }
    return diffs;
  }, [customNutrientOverrides, masterIngredients]);

  // Get effective ingredients with custom overrides merged in (passed to solver & results!)
  const getEffectiveIngredients = useCallback((): Ingredient[] => {
    return sessionIngredients.map(ing => {
      const overrides = customNutrientOverrides[ing.id];
      if (!overrides || Object.keys(overrides).length === 0) {
        return ing;
      }
      return {
        ...ing,
        ...overrides
      };
    });
  }, [sessionIngredients, customNutrientOverrides]);

  // Handle stock update in master DB
  const handleUpdateStock = useCallback((id: string, newStockKg: number, newPrice: number) => {
    updateMasterIngredient(id, { inStockKg: newStockKg, currentPrice: newPrice });
  }, [updateMasterIngredient]);

  // ---- Calculate Formulation ----
  const handleCalculate = useCallback((
    customNutrients?: Partial<TargetNutrisi>,
    customConstraints?: NutrientConstraintSpec[]
  ): FormulaResultData => {
    const effectiveDays = ageUnit === 'minggu' ? ageValue * 7 : ageValue;
    let phaseStr = 'Grower';
    if (livestock === 'broiler') {
      if (effectiveDays <= 12) phaseStr = 'Starter';
      else if (effectiveDays <= 28) phaseStr = 'Grower';
      else phaseStr = 'Finisher';
    } else {
      if (effectiveDays <= 35) phaseStr = 'Starter';
      else if (effectiveDays <= 70) phaseStr = 'Grower';
      else if (effectiveDays <= 105) phaseStr = 'Developer';
      else if (effectiveDays <= 126) phaseStr = 'Pre-Layer';
      else if (effectiveDays <= 315) phaseStr = 'Layer-1';
      else if (effectiveDays <= 560) phaseStr = 'Layer-2';
      else phaseStr = 'Layer-3';
    }

    const currentMarketPrice = livestock === 'broiler' ? marketPrices.broiler : marketPrices.layer;
    
    // CRITICAL: Use getEffectiveIngredients() so the LP solver strictly solves with user's customized nutrients from Tahap 2!
    const effectiveIngs = getEffectiveIngredients();

    const result = solveFeedFormulation(
      effectiveIngs,
      livestock,
      phaseStr,
      batchKg,
      customNutrients,
      currentMarketPrice,
      customConstraints
    );

    setCurrentResult(result);
    setResultSource('workflow-step3');

    // Save to history (non-blocking)
    const timeStr = 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const pills = result.ingredients.slice(0, 4).map(i => `${i.name.split(' ')[0]} ${i.percentage}%`);
    addHistory({
      id: result.id,
      title: result.batchName,
      batchInfo: `${result.batchNumber} • ${livestock === 'broiler' ? 'Broiler' : 'Layer'} ${phaseStr} (${batchKg} kg)`,
      timeStr,
      status: result.isFeasible ? 'layak' : 'koreksi',
      statusLabel: result.isFeasible ? 'Layak SNI' : 'Perlu Koreksi',
      pills,
      totalWeight: batchKg,
      costPerKg: result.costPerKg,
      totalCost: result.totalCost,
      icon: livestock === 'broiler' ? 'grain' : 'egg',
      category: result.isFeasible ? 'layak' : 'koreksi',
    }).catch(console.error);

    return result;
  }, [ageUnit, ageValue, livestock, marketPrices, getEffectiveIngredients, batchKg, addHistory]);

  // Preset Selection
  const handleSelectPreset = useCallback((preset: PresetItem) => {
    const titleLower = (preset.title || '').toLowerCase();
    const phaseLower = (preset.phase || '').toLowerCase();
    const isLayer = preset.category === 'layer' ||
      titleLower.includes('layer') ||
      titleLower.includes('petelur') ||
      phaseLower.includes('layer') ||
      phaseLower.includes('pullet');

    if (isLayer) {
      setLivestock('layer');
      setAgeValue(28);
      setAgeUnit('minggu');
    } else {
      setLivestock('broiler');
      if (titleLower.includes('starter') || phaseLower.includes('starter')) {
        setAgeValue(10);
        setAgeUnit('hari');
      } else if (titleLower.includes('finisher') || phaseLower.includes('finisher')) {
        setAgeValue(32);
        setAgeUnit('hari');
      } else {
        setAgeValue(21);
        setAgeUnit('hari');
      }
    }
  }, []);

  // Riwayat Formula handlers
  const handleRepeatFormula = useCallback((item: HistoryFormulaItem) => {
    setBatchKg(item.totalWeight);
    const isLayer = item.title.toLowerCase().includes('layer') || item.batchInfo.toLowerCase().includes('layer');
    const benchmark = isLayer ? marketPrices.layer : marketPrices.broiler;
    const effectiveIngs = getEffectiveIngredients();
    const result = solveFeedFormulation(
      effectiveIngs,
      isLayer ? 'layer' : 'broiler',
      'Finisher',
      item.totalWeight,
      undefined,
      benchmark
    );
    result.batchName = item.title;
    result.totalCost = item.totalCost;
    result.costPerKg = item.costPerKg;
    setCurrentResult(result);
    setResultSource('riwayat');
  }, [getEffectiveIngredients, marketPrices]);

  const handleViewFormulaDetails = useCallback((
    item?: HistoryFormulaItem,
    source: 'beranda' | 'riwayat' = 'riwayat'
  ) => {
    const targetWeight = item?.totalWeight || 500;
    const isLayer = item?.title.toLowerCase().includes('layer') || (item?.batchInfo || '').toLowerCase().includes('layer');
    const benchmark = isLayer ? marketPrices.layer : marketPrices.broiler;
    const effectiveIngs = getEffectiveIngredients();
    const result = solveFeedFormulation(
      effectiveIngs,
      isLayer ? 'layer' : 'broiler',
      'Finisher',
      targetWeight,
      undefined,
      benchmark
    );
    if (item) {
      result.id = item.id;
      result.batchName = item.title;
      result.costPerKg = item.costPerKg;
      result.totalCost = item.totalCost;
      result.totalBatchKg = item.totalWeight;
      result.isFeasible = item.status === 'layak';
      const parts = item.batchInfo.split(' • ');
      if (parts.length > 0 && parts[0].startsWith('#')) {
        result.batchNumber = parts[0];
      }
    }
    setCurrentResult(result);
    setResultSource(source);
  }, [getEffectiveIngredients, marketPrices]);

  // AI Substitution
  const handleApplyAISubstitution = useCallback((onSuccess?: () => void) => {
    setSessionIngredients(prev =>
      prev.map(i => {
        if (i.id === 'ikan') return { ...i, selected: true };
        if (i.id === 'sbm') return { ...i, hasConstraint: true, maxConstraint: 25 };
        return i;
      })
    );
    setTimeout(() => {
      const effectiveIngs = getEffectiveIngredients();
      const result = solveFeedFormulation(effectiveIngs, 'broiler', 'Finisher', 500);
      setCurrentResult(result);
      setResultSource('workflow-step3');
      if (onSuccess) onSuccess();
    }, 100);
  }, [getEffectiveIngredients]);

  return (
    <AppContext.Provider
      value={{
        ingredients: masterIngredients,
        loadingIngs,
        toggleIngredient: toggleMasterIngredient,
        updateIngredient: updateMasterIngredient,
        addIngredient: addMasterIngredient,
        removeIngredient: removeMasterIngredient,
        resetDefaults: resetMasterDefaults,

        presets,
        addPreset,
        updatePreset,
        removePreset,

        history,
        addHistory,
        updateHistory,
        removeHistory,
        clearAllHistory,

        farmConfig,
        kandang,
        sensor,
        schedule,
        marketPrices,
        updateMarketPrices,

        // Formulation Session
        formulationIngredients: sessionIngredients.length > 0 ? sessionIngredients : masterIngredients,
        customNutrientOverrides,
        toggleFormulationIngredient,
        selectAllFormulationIngredients,
        updateFormulationIngredientPrice,
        toggleFormulationConstraint,
        updateFormulationIngredientConstraint,
        updateFormulationNutrient,
        resetIngredientNutrientsToDefault,
        resetAllNutrientsToDefault,
        isIngredientCustom,
        getIngredientDiffs,
        getEffectiveIngredients,

        livestock,
        setLivestock,
        ageValue,
        setAgeValue,
        ageUnit,
        setAgeUnit,
        batchKg,
        setBatchKg,
        currentResult,
        setCurrentResult,
        resultSource,
        setResultSource,

        handleCalculate,
        handleSelectPreset,
        handleRepeatFormula,
        handleViewFormulaDetails,
        handleApplyAISubstitution,
        handleUpdateStock,

        showNotificationModal,
        setShowNotificationModal,
        showStockModal,
        setShowStockModal,
        showCalibrationModal,
        setShowCalibrationModal,
        showMarketPriceModal,
        setShowMarketPriceModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

