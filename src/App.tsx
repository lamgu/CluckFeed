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
import { WorkflowStep2Nutrients } from './screens/WorkflowStep2Nutrients';
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

import { AppProvider, useApp } from './context/AppContext';
import { PresetItem, HistoryFormulaItem } from './types';

export type AppView =
  | 'tab'
  | 'workflow-step1'
  | 'workflow-step2'
  | 'workflow-step3'
  | 'workflow-result'
  | 'dispense'
  | 'presets';

// Helper to map pathname to view & tab
function pathToViewTab(pathname: string): { view: AppView; tab: TabKey } {
  const clean = pathname.replace(/\/$/, '') || '/';
  if (clean === '/formula/step-1') return { view: 'workflow-step1', tab: 'beranda' };
  if (clean === '/formula/step-2') return { view: 'workflow-step2', tab: 'beranda' };
  if (clean === '/formula/step-3') return { view: 'workflow-step3', tab: 'beranda' };
  if (clean === '/formula/result') return { view: 'workflow-result', tab: 'beranda' };
  if (clean === '/dispense') return { view: 'dispense', tab: 'beranda' };
  if (clean === '/presets') return { view: 'presets', tab: 'beranda' };
  if (clean === '/riwayat') return { view: 'tab', tab: 'riwayat' };
  if (clean === '/asisten-ai') return { view: 'tab', tab: 'asisten-ai' };
  if (clean === '/matrix') return { view: 'tab', tab: 'matrix' };
  if (clean === '/profil') return { view: 'tab', tab: 'profil' };
  return { view: 'tab', tab: 'beranda' };
}

// Helper to map view & tab to URL pathname
function viewTabToPath(view: AppView, tab: TabKey): string {
  if (view === 'workflow-step1') return '/formula/step-1';
  if (view === 'workflow-step2') return '/formula/step-2';
  if (view === 'workflow-step3') return '/formula/step-3';
  if (view === 'workflow-result') return '/formula/result';
  if (view === 'dispense') return '/dispense';
  if (view === 'presets') return '/presets';
  if (tab === 'riwayat') return '/riwayat';
  if (tab === 'asisten-ai') return '/asisten-ai';
  if (tab === 'matrix') return '/matrix';
  if (tab === 'profil') return '/profil';
  return '/';
}

function AppContent() {
  const {
    // Master DB Ingredients (From SQLite)
    ingredients,
    loadingIngs,
    updateIngredient,
    addIngredient,
    removeIngredient,
    resetDefaults,

    // Formulation Session (Isolated from Master DB)
    formulationIngredients,
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

    // Formulation Parameters
    livestock,
    setLivestock,
    ageValue,
    setAgeValue,
    ageUnit,
    setAgeUnit,
    batchKg,
    setBatchKg,
    currentResult,
    resultSource,
    handleCalculate,
    handleSelectPreset,
    handleRepeatFormula,
    handleViewFormulaDetails,
    handleApplyAISubstitution,
    handleUpdateStock,

    // Presets & History
    presets,
    addPreset,
    updatePreset,
    removePreset,
    history,
    addHistory,
    updateHistory,
    removeHistory,
    clearAllHistory,

    // Farm & Sensors
    farmConfig,
    kandang,
    sensor,
    schedule,

    // Market Prices
    marketPrices,
    updateMarketPrices,

    // Modals
    showNotificationModal,
    setShowNotificationModal,
    showStockModal,
    setShowStockModal,
    showCalibrationModal,
    setShowCalibrationModal,
    showMarketPriceModal,
    setShowMarketPriceModal
  } = useApp();

  // Initial navigation state parsed from window.location.pathname
  const initialNav = pathToViewTab(window.location.pathname);
  const [activeTab, setActiveTab] = useState<TabKey>(initialNav.tab);
  const [currentView, setCurrentView] = useState<AppView>(initialNav.view);

  // Smooth scroll to top helper
  const scrollToTop = useCallback(() => {
    document.querySelectorAll('.overflow-y-auto').forEach(el => el.scrollTo({ top: 0, behavior: 'smooth' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Central Navigation function with browser history and URL synchronization
  const navigateTo = useCallback((newView: AppView, newTab?: TabKey) => {
    const targetTab = newTab || (newView === 'tab' ? activeTab : activeTab);
    setCurrentView(newView);
    if (newTab) setActiveTab(newTab);

    const targetPath = viewTabToPath(newView, targetTab);
    try {
      window.history.pushState(
        { view: newView, tab: targetTab, _cluckfeed: true },
        '',
        targetPath
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
    const initialPath = viewTabToPath(initialNav.view, initialNav.tab);
    try {
      window.history.replaceState(
        { view: initialNav.view, tab: initialNav.tab, _cluckfeed: true },
        '',
        initialPath
      );
    } catch {}

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state._cluckfeed && event.state.view) {
        setCurrentView(event.state.view);
        if (event.state.tab) setActiveTab(event.state.tab);
      } else {
        const fromPath = pathToViewTab(window.location.pathname);
        setCurrentView(fromPath.view);
        setActiveTab(fromPath.tab);
      }
      scrollToTop();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [initialNav.view, initialNav.tab, scrollToTop]);

  // Preset Selection with Navigation
  const onSelectPresetAndNavigate = useCallback((preset: PresetItem) => {
    handleSelectPreset(preset);
    navigateTo('workflow-step3');
  }, [handleSelectPreset, navigateTo]);

  // Repeat Formula with Navigation
  const onRepeatFormulaAndNavigate = useCallback((item: HistoryFormulaItem) => {
    handleRepeatFormula(item);
    navigateTo('dispense');
  }, [handleRepeatFormula, navigateTo]);

  // View Formula Details with Navigation
  const onViewFormulaDetailsAndNavigate = useCallback((item?: HistoryFormulaItem, source: 'beranda' | 'riwayat' = 'riwayat') => {
    handleViewFormulaDetails(item, source);
    navigateTo('workflow-result');
  }, [handleViewFormulaDetails, navigateTo]);

  // AI Substitution Callback
  const onAISubstitution = useCallback(() => {
    handleApplyAISubstitution(() => {
      navigateTo('workflow-result');
    });
  }, [handleApplyAISubstitution, navigateTo]);

  // Header Props Helper
  const getHeaderProps = () => {
    switch (currentView) {
      case 'workflow-step1':
        return {
          title: 'Formulasi Ransum Baru (1/3)',
          subtitle: 'Pemilihan Bahan Baku & Batas Inklusi',
          showBack: true,
          onBack: () => navigateTo('tab', 'beranda')
        };
      case 'workflow-step2':
        return {
          title: 'Formulasi Ransum Baru (2/3)',
          subtitle: 'Pemeriksaan & Penyesuaian Matriks Nutrisi',
          showBack: true,
          onBack: () => navigateTo('workflow-step1')
        };
      case 'workflow-step3':
        return {
          title: 'Formulasi Ransum Baru (3/3)',
          subtitle: 'Pengaturan Target Nutrisi SNI',
          showBack: true,
          onBack: () => navigateTo('workflow-step2')
        };
      case 'workflow-result':
        return {
          title: 'Detail Batch Ransum',
          subtitle: currentResult?.batchNumber || 'Hasil Optimasi Least Cost',
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
        if (activeTab === 'matrix') return { title: 'Matrix Bahan Baku', subtitle: 'Nutrisi Lab & Harga Master' };
        if (activeTab === 'profil') return { title: 'Profil & Pengaturan', subtitle: farmConfig.farm_name };
        return { title: undefined, subtitle: 'Beranda' };
    }
  };

  const headerProps = getHeaderProps();

  // Show loading splash while ingredients load from SQLite backend
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
          onHomeClick={currentView.startsWith('workflow-') ? handleGoHome : undefined}
          onNotificationClick={() => setShowNotificationModal(true)}
          onProfileClick={() => navigateTo('tab', 'profil')}
          activeTab={activeTab}
          onTabChange={(tab) => navigateTo('tab', tab)}
          showNavTabs={!currentView.startsWith('workflow-')}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-hidden flex flex-col min-h-0 relative">
          {/* Workflow Step 1: Pemilihan Bahan Baku & Batas Inklusi (Tabel Interaktif) */}
          {currentView === 'workflow-step1' && (
            <WorkflowStep1Ingredients
              ingredients={formulationIngredients}
              onToggleIngredient={toggleFormulationIngredient}
              onSelectAll={selectAllFormulationIngredients}
              onUpdatePrice={updateFormulationIngredientPrice}
              onUpdateConstraint={updateFormulationIngredientConstraint}
              onResetDefaults={resetDefaults}
              onNext={() => navigateTo('workflow-step2')}
              onBack={() => navigateTo('tab', 'beranda')}
              onGoHome={handleGoHome}
            />
          )}

          {/* Workflow Step 2: Pemeriksaan & Penyesuaian Matriks Nutrisi (Tabel Matriks Nutrisi 22 Parameter) */}
          {currentView === 'workflow-step2' && (
            <WorkflowStep2Nutrients
              ingredients={formulationIngredients}
              masterIngredients={ingredients}
              customOverrides={customNutrientOverrides}
              onUpdateNutrient={updateFormulationNutrient}
              onResetIngredient={resetIngredientNutrientsToDefault}
              onResetAll={resetAllNutrientsToDefault}
              isCustom={isIngredientCustom}
              onNext={() => navigateTo('workflow-step3')}
              onBack={() => navigateTo('workflow-step1')}
              onGoHome={handleGoHome}
            />
          )}

          {/* Workflow Step 3: Pengaturan Target Nutrisi (8 Nutrisi Utama + 14 Nutrisi Tambahan) */}
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
              onCalculate={(customNutrients, customConstraints) => {
                handleCalculate(customNutrients, customConstraints);
                navigateTo('workflow-result');
              }}
              onBack={() => navigateTo('workflow-step2')}
              onGoHome={handleGoHome}
            />
          )}

          {/* Workflow Result: Hasil Formulasi Least Cost Simplex LP */}
          {currentView === 'workflow-result' && (
            currentResult ? (
              <FormulaResultScreen
                data={currentResult}
                onModify={() => navigateTo('workflow-step3')}
                onSendToDispense={() => navigateTo('dispense')}
                onAskAI={() => navigateTo('tab', 'asisten-ai')}
                onForceSave={() => navigateTo('dispense')}
                onOpenMarketPriceModal={() => setShowMarketPriceModal(true)}
                onSaveFormula={(formula) => {
                  const timeStr = 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
                  const pills = formula.ingredients.slice(0, 4).map(i => `${i.name.split(' ')[0]} ${Number(i.percentage.toFixed(1))}%`);
                  addHistory({
                    id: formula.id || `cf-${Date.now()}`,
                    title: formula.batchName,
                    batchInfo: `${formula.batchNumber} • ${formula.livestock === 'broiler' ? 'Broiler' : 'Layer'} (${formula.totalBatchKg} kg)`,
                    timeStr,
                    status: formula.isFeasible ? 'layak' : 'koreksi',
                    statusLabel: formula.isFeasible ? 'Layak SNI' : 'Perlu Koreksi',
                    pills,
                    totalWeight: formula.totalBatchKg,
                    costPerKg: formula.costPerKg,
                    totalCost: formula.totalCost,
                    icon: formula.livestock === 'broiler' ? 'grain' : 'egg',
                    category: formula.isFeasible ? 'layak' : 'koreksi',
                  }).catch(console.error);
                }}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <span className="material-symbols-outlined text-[48px] text-[#6d7b6c] mb-2">assignment_late</span>
                <p className="text-[14px] font-medium text-[#121c2a]">Belum ada hasil formulasi aktif</p>
                <button
                  type="button"
                  onClick={() => navigateTo('workflow-step1')}
                  className="mt-4 px-5 py-2.5 rounded-full bg-[#006e2f] text-white font-semibold text-[13px] hover:bg-[#005524] transition-all shadow-md"
                >
                  Mulai Formulasi Baru
                </button>
              </div>
            )
          )}

          {/* Dispense Screen: Kontrol Dispenser ESP32 IoT */}
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

          {/* Preset Nutrisi Catalog Screen */}
          {currentView === 'presets' && (
            <PresetNutrisiScreen
              presets={presets}
              onSelectPreset={onSelectPresetAndNavigate}
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
                  onSelectPreset={onSelectPresetAndNavigate}
                  onRepeatFormula={onRepeatFormulaAndNavigate}
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
                  onViewLastFormula={(item) => onViewFormulaDetailsAndNavigate(item, 'beranda')}
                />
              )}

              {activeTab === 'riwayat' && (
                <RiwayatScreen
                  history={history}
                  onViewDetails={(item) => onViewFormulaDetailsAndNavigate(item, 'riwayat')}
                  onRepeatFormula={onRepeatFormulaAndNavigate}
                  onAddHistory={addHistory}
                  onUpdateHistory={updateHistory}
                  onDeleteHistory={removeHistory}
                  onClearAllHistory={clearAllHistory}
                />
              )}

              {activeTab === 'asisten-ai' && (
                <AsistenAiScreen
                  onApplySubstitution={onAISubstitution}
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

        {/* Global Bottom Navigation on Tab Views */}
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

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
