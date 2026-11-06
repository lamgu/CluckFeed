/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabKey } from './components/BottomNav';
import { DeviceFrame } from './components/DeviceFrame';
import { NotificationModal } from './components/NotificationModal';
import { BerandaScreen } from './screens/BerandaScreen';
import { WorkflowStep1Ingredients } from './screens/WorkflowStep1Ingredients';
import { WorkflowStep2Prices } from './screens/WorkflowStep2Prices';
import { WorkflowStep3Targets } from './screens/WorkflowStep3Targets';
import { FormulaResultScreen } from './screens/FormulaResultScreen';
import { DispenseScreen } from './screens/DispenseScreen';
import { PresetNutrisiScreen } from './screens/PresetNutrisiScreen';
import { RiwayatScreen } from './screens/RiwayatScreen';
import { AsistenAiScreen } from './screens/AsistenAiScreen';
import { ProfilScreen } from './screens/ProfilScreen';
import { MatrixBahanBakuScreen } from './screens/MatrixBahanBakuScreen';
import { StokGudangModal } from './screens/StokGudangModal';
import { HardwareCalibrationModal } from './screens/HardwareCalibrationModal';
import { HargaPasarModal } from './screens/HargaPasarModal';

import { LivestockType, AgeUnit, FormulaResultData, PresetItem, HistoryFormulaItem, TargetNutrisi } from './types';
import { solveFeedFormulation } from './utils/formulationSolver';

// Dynamic data hooks
import { useIngredients } from './hooks/useIngredients';
import { usePresets } from './hooks/usePresets';
import { useHistory } from './hooks/useHistory';
import { useFarm } from './hooks/useFarm';
import { useMarketPrices } from './hooks/useMarketPrices';

type AppView =
  | 'tab'
  | 'workflow-step1'
  | 'workflow-step2'
  | 'workflow-step3'
  | 'workflow-result'
  | 'dispense'
  | 'presets';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('beranda');
  const [currentView, setCurrentView] = useState<AppView>('tab');
  const [resultSource, setResultSource] = useState<'beranda' | 'riwayat' | 'workflow-step3'>('beranda');

  // ---- Dynamic Data ----
  const {
    ingredients, loading: loadingIngs,
    toggleIngredient, updateIngredient, addIngredient, removeIngredient, resetDefaults
  } = useIngredients();

  const { presets, addPreset, updatePreset, removePreset } = usePresets();
  const { history, addHistory, updateHistory, removeHistory, clearAllHistory } = useHistory();
  const { config: farmConfig, kandang, sensor, schedule } = useFarm();
  const { marketPrices, updateMarketPrices } = useMarketPrices();

  // ---- Formulation State ----
  const [livestock, setLivestock] = useState<LivestockType>('broiler');
  const [ageValue, setAgeValue] = useState<number>(21);
  const [ageUnit, setAgeUnit] = useState<AgeUnit>('hari');
  const [batchKg, setBatchKg] = useState<number>(500);
  const [currentResult, setCurrentResult] = useState<FormulaResultData | null>(null);

  // ---- Modals ----
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [showStockModal, setShowStockModal] = useState<boolean>(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(false);
  const [showMarketPriceModal, setShowMarketPriceModal] = useState<boolean>(false);

  // Smooth scroll to top helper
  const scrollToTop = useCallback(() => {
    document.querySelectorAll('.overflow-y-auto').forEach(el => el.scrollTo({ top: 0, behavior: 'smooth' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Central Navigation function with browser history synchronization
  const navigateTo = useCallback((newView: AppView, newTab?: TabKey) => {
    setCurrentView(newView);
    if (newTab) setActiveTab(newTab);
    try {
      window.history.pushState(
        { view: newView, tab: newTab || activeTab },
        '',
        window.location.pathname
      );
    } catch {}
    scrollToTop();
  }, [activeTab, scrollToTop]);

  // Handle Home Button from anywhere
  const handleGoHome = useCallback(() => {
    navigateTo('tab', 'beranda');
  }, [navigateTo]);

  // Browser Back / Forward buttons handler
  useEffect(() => {
    try {
      window.history.replaceState({ view: 'tab', tab: 'beranda' }, '', window.location.pathname);
    } catch {}

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
        if (event.state.tab) setActiveTab(event.state.tab);
      } else {
        setCurrentView('tab');
        setActiveTab('beranda');
      }
      scrollToTop();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [scrollToTop]);

  // ---- Ingredient handlers ----
  const handleToggleIngredient = useCallback((id: string) => {
    toggleIngredient(id);
  }, [toggleIngredient]);

  const handleResetIngredients = useCallback(() => {
    resetDefaults();
  }, [resetDefaults]);

  const handleUpdatePrice = useCallback((id: string, price: number) => {
    updateIngredient(id, { currentPrice: price });
  }, [updateIngredient]);

  const handleToggleConstraint = useCallback((id: string) => {
    const ing = ingredients.find(i => i.id === id);
    if (ing) updateIngredient(id, { hasConstraint: !ing.hasConstraint });
  }, [ingredients, updateIngredient]);

  const handleUpdateConstraint = useCallback((id: string, min?: number, max?: number) => {
    const patch: Partial<typeof ingredients[0]> = {};
    if (min !== undefined) patch.minConstraint = min;
    if (max !== undefined) patch.maxConstraint = max;
    updateIngredient(id, patch);
  }, [updateIngredient]);

  const handleUpdateStock = useCallback((id: string, newStockKg: number, newPrice: number) => {
    updateIngredient(id, { inStockKg: newStockKg, currentPrice: newPrice });
  }, [updateIngredient]);

  // ---- Calculate Formulation ----
  const handleCalculate = useCallback((customNutrients?: Partial<TargetNutrisi>) => {
    const effectiveDays = ageUnit === 'minggu' ? ageValue * 7 : ageValue;
    let phaseStr = 'Grower';
    if (livestock === 'broiler') {
      if (effectiveDays <= 14) phaseStr = 'Starter';
      else if (effectiveDays <= 28) phaseStr = 'Grower';
      else phaseStr = 'Finisher';
    } else {
      if (effectiveDays <= 56) phaseStr = 'Starter Pullet';
      else if (effectiveDays <= 112) phaseStr = 'Pullet Developer';
      else phaseStr = 'Produksi (Peak)';
    }

    const currentMarketPrice = livestock === 'broiler' ? marketPrices.broiler : marketPrices.layer;
    const result = solveFeedFormulation(ingredients, livestock, phaseStr, batchKg, customNutrients, currentMarketPrice);
    setCurrentResult(result);
    setResultSource('workflow-step3');
    navigateTo('workflow-result');

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
  }, [ingredients, livestock, ageUnit, ageValue, batchKg, addHistory, navigateTo]);

  // ---- Preset Selection ----
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
    navigateTo('workflow-step3');
  }, [navigateTo]);

  // ---- Riwayat handlers ----
  const handleRepeatFormula = useCallback((item: HistoryFormulaItem) => {
    setBatchKg(item.totalWeight);
    const isLayer = item.title.toLowerCase().includes('layer') || item.batchInfo.toLowerCase().includes('layer');
    const benchmark = isLayer ? marketPrices.layer : marketPrices.broiler;
    const result = solveFeedFormulation(ingredients, isLayer ? 'layer' : 'broiler', 'Finisher', item.totalWeight, undefined, benchmark);
    result.batchName = item.title;
    result.totalCost = item.totalCost;
    result.costPerKg = item.costPerKg;
    setCurrentResult(result);
    setResultSource('riwayat');
    navigateTo('dispense');
  }, [ingredients, marketPrices, navigateTo]);

  const handleViewFormulaDetails = useCallback((item?: HistoryFormulaItem, source: 'beranda' | 'riwayat' = 'riwayat') => {
    const targetWeight = item?.totalWeight || 500;
    const isLayer = item?.title.toLowerCase().includes('layer') || (item?.batchInfo || '').toLowerCase().includes('layer');
    const benchmark = isLayer ? marketPrices.layer : marketPrices.broiler;
    const result = solveFeedFormulation(ingredients, isLayer ? 'layer' : 'broiler', 'Finisher', targetWeight, undefined, benchmark);
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
    navigateTo('workflow-result');
  }, [ingredients, navigateTo]);

  // ---- AI Substitution ----
  const handleApplyAISubstitution = useCallback(() => {
    updateIngredient('ikan', { selected: true });
    updateIngredient('sbm', { hasConstraint: true, maxConstraint: 25 });
    setTimeout(() => {
      const result = solveFeedFormulation(ingredients, 'broiler', 'Finisher', 500);
      setCurrentResult(result);
      setResultSource('workflow-step3');
      navigateTo('workflow-result');
    }, 100);
  }, [ingredients, updateIngredient, navigateTo]);

  // ---- Header props helper ----
  const getHeaderProps = () => {
    switch (currentView) {
      case 'workflow-step1':
        return {
          title: 'Formulasi Ransum Baru (1/3)',
          subtitle: 'Pilih Bahan Baku Tersedia',
          showBack: true,
          onBack: () => navigateTo('tab', 'beranda')
        };
      case 'workflow-step2':
        return {
          title: 'Formulasi Ransum Baru (2/3)',
          subtitle: 'Update Harga & Batasan Takaran',
          showBack: true,
          onBack: () => navigateTo('workflow-step1')
        };
      case 'workflow-step3':
        return {
          title: 'Formulasi Ransum Baru (3/3)',
          subtitle: 'Target Kebutuhan Nutrisi SNI',
          showBack: true,
          onBack: () => navigateTo('workflow-step2')
        };
      case 'workflow-result':
        return {
          title: 'Detail Batch Ransum',
          subtitle: currentResult?.batchNumber || 'Hasil Optimasi',
          showBack: true,
          onBack: () => {
            if (resultSource === 'riwayat') {
              navigateTo('tab', 'riwayat');
            } else if (resultSource === 'workflow-step3') {
              navigateTo('workflow-step3');
            } else {
              navigateTo('tab', 'beranda');
            }
          }
        };
      case 'dispense':
        return {
          title: 'Kontrol Dispenser Mesin',
          subtitle: 'ESP32 Auto-Mixer IoT',
          showBack: true,
          onBack: () => {
            if (currentResult) {
              navigateTo('workflow-result');
            } else {
              navigateTo('tab', 'beranda');
            }
          }
        };
      case 'presets':
        return {
          title: 'Target & Preset Nutrisi',
          subtitle: 'Katalog Standar Pakan',
          showBack: true,
          onBack: () => navigateTo('tab', 'beranda')
        };
      default:
        if (activeTab === 'riwayat') return { title: 'Riwayat Formula', subtitle: 'Arsip Racikan Kandang' };
        if (activeTab === 'asisten-ai') return { title: 'Asisten AI', subtitle: 'Dokter Nutrisi Kandang' };
        if (activeTab === 'matrix') return { title: 'Matrix Bahan Baku', subtitle: 'Nutrisi & Harga Pasar' };
        if (activeTab === 'profil') return { title: 'Profil & Pengaturan', subtitle: farmConfig.farm_name };
        return { title: undefined, subtitle: 'Beranda' };
    }
  };

  const headerProps = getHeaderProps();

  // Show loading splash while ingredients load
  if (loadingIngs) {
    return (
      <DeviceFrame>
        <div className="w-full h-screen bg-[#f8f9ff] flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-[20px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f]">
            <span className="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
          </div>
          <p className="font-label-lg text-[14px] text-[#6d7b6c]">Memuat data CluckFeed...</p>
        </div>
      </DeviceFrame>
    );
  }

  return (
    <DeviceFrame>
      <div className="w-full h-screen bg-[#f8f9ff] flex flex-col overflow-hidden relative">
        {/* Main Header with Universal Home Button & Dynamic Back */}
        <Header
          title={headerProps.title}
          subtitle={headerProps.subtitle}
          showBack={headerProps.showBack}
          onBack={headerProps.onBack}
          onHomeClick={handleGoHome}
          onNotificationClick={() => setShowNotificationModal(true)}
          onProfileClick={() => navigateTo('tab', 'profil')}
          activeTab={activeTab}
          onTabChange={(tab) => navigateTo('tab', tab)}
          showNavTabs={currentView === 'tab'}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto overflow-hidden flex flex-col min-h-0 relative px-0 sm:px-4 lg:px-6">
          {/* Workflow Views */}
          {currentView === 'workflow-step1' && (
            <WorkflowStep1Ingredients
              ingredients={ingredients}
              onToggleIngredient={handleToggleIngredient}
              onResetDefaults={handleResetIngredients}
              onNext={() => navigateTo('workflow-step2')}
              onBack={() => navigateTo('tab', 'beranda')}
            />
          )}

          {currentView === 'workflow-step2' && (
            <WorkflowStep2Prices
              ingredients={ingredients}
              onUpdatePrice={handleUpdatePrice}
              onToggleConstraint={handleToggleConstraint}
              onUpdateConstraint={handleUpdateConstraint}
              onNext={() => navigateTo('workflow-step3')}
              onBack={() => navigateTo('workflow-step1')}
            />
          )}

          {currentView === 'workflow-step3' && (
            <WorkflowStep3Targets
              livestock={livestock}
              setLivestock={setLivestock}
              ageValue={ageValue}
              setAgeValue={setAgeValue}
              ageUnit={ageUnit}
              setAgeUnit={setAgeUnit}
              batchKg={batchKg}
              setBatchKg={setBatchKg}
              onCalculate={handleCalculate}
              onBack={() => navigateTo('workflow-step2')}
            />
          )}

          {currentView === 'workflow-result' && currentResult && (
            <FormulaResultScreen
              data={currentResult}
              onModify={() => navigateTo('workflow-step3')}
              onSendToDispense={() => navigateTo('dispense')}
              onAskAI={() => navigateTo('tab', 'asisten-ai')}
              onForceSave={() => navigateTo('dispense')}
              onOpenMarketPriceModal={() => setShowMarketPriceModal(true)}
            />
          )}

          {currentView === 'dispense' && (
            <DispenseScreen
              batchName={currentResult?.batchName || 'Broiler Grower 500 kg'}
              batchKg={currentResult?.totalBatchKg || batchKg}
              onBack={() => {
                if (currentResult) navigateTo('workflow-result');
                else navigateTo('tab', 'beranda');
              }}
            />
          )}

          {currentView === 'presets' && (
            <PresetNutrisiScreen
              presets={presets}
              onSelectPreset={handleSelectPreset}
              onAddPreset={addPreset}
              onUpdatePreset={updatePreset}
              onDeletePreset={removePreset}
              onBack={() => navigateTo('tab', 'beranda')}
            />
          )}

          {/* Tab Views */}
          {currentView === 'tab' && (
            <div className="flex-1 w-full min-h-0 flex flex-col overflow-hidden">
              {activeTab === 'beranda' && (
                <BerandaScreen
                  farmConfig={farmConfig}
                  kandang={kandang}
                  sensor={sensor}
                  schedule={schedule}
                  history={history}
                  presets={presets}
                  onSelectPreset={handleSelectPreset}
                  onRepeatFormula={handleRepeatFormula}
                  onDeleteHistory={removeHistory}
                  onStartFormulation={() => navigateTo('workflow-step1')}
                  onOpenIngredients={() => navigateTo('workflow-step1')}
                  onOpenPrices={() => setShowMarketPriceModal(true)}
                  onOpenMarketPriceModal={() => setShowMarketPriceModal(true)}
                  onOpenTargets={() => navigateTo('presets')}
                  onOpenDispense={() => navigateTo('dispense')}
                  onOpenStock={() => setShowStockModal(true)}
                  onOpenHistory={() => navigateTo('tab', 'riwayat')}
                  onOpenAssistant={() => navigateTo('tab', 'asisten-ai')}
                  onViewLastFormula={(item) => handleViewFormulaDetails(item, 'beranda')}
                />
              )}

              {activeTab === 'riwayat' && (
                <RiwayatScreen
                  history={history}
                  onViewDetails={(item) => handleViewFormulaDetails(item, 'riwayat')}
                  onRepeatFormula={handleRepeatFormula}
                  onAddHistory={addHistory}
                  onUpdateHistory={updateHistory}
                  onDeleteHistory={removeHistory}
                  onClearAllHistory={clearAllHistory}
                />
              )}

              {activeTab === 'asisten-ai' && (
                <AsistenAiScreen
                  onApplySubstitution={handleApplyAISubstitution}
                />
              )}

              {activeTab === 'matrix' && (
                <MatrixBahanBakuScreen
                  ingredients={ingredients}
                  onUpdateIngredient={updateIngredient}
                  onAddIngredient={addIngredient}
                  onRemoveIngredient={removeIngredient}
                />
              )}

              {activeTab === 'profil' && (
                <ProfilScreen
                  onOpenPresets={() => navigateTo('presets')}
                  onOpenStock={() => setShowStockModal(true)}
                  onOpenCalibration={() => setShowCalibrationModal(true)}
                  onOpenSNIGuide={() => navigateTo('presets')}
                  onContactSupport={() => alert('Menghubungkan ke Tim Teknisi WhatsApp CluckFeed: +62 811-9988-7766')}
                />
              )}
            </div>
          )}
        </main>

        {/* Global Bottom Navigation */}
        {currentView === 'tab' && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={(tab) => navigateTo('tab', tab)}
          />
        )}

        {/* Modals */}
        {showNotificationModal && (
          <NotificationModal onClose={() => setShowNotificationModal(false)} />
        )}

        {showStockModal && (
          <StokGudangModal
            ingredients={ingredients}
            onUpdateStock={handleUpdateStock}
            onClose={() => setShowStockModal(false)}
          />
        )}

        {showCalibrationModal && (
          <HardwareCalibrationModal onClose={() => setShowCalibrationModal(false)} />
        )}

        {showMarketPriceModal && (
          <HargaPasarModal
            currentPrices={marketPrices}
            onSave={updateMarketPrices}
            onClose={() => setShowMarketPriceModal(false)}
          />
        )}
      </div>
    </DeviceFrame>
  );
}
