/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { StokGudangModal } from './screens/StokGudangModal';
import { HardwareCalibrationModal } from './screens/HardwareCalibrationModal';

import { Ingredient, LivestockType, AgeUnit, FormulaResultData, PresetItem, HistoryFormulaItem, TargetNutrisi } from './types';
import { INITIAL_INGREDIENTS } from './data/mockData';
import { solveFeedFormulation } from './utils/formulationSolver';

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

  // Core Formulation State
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [livestock, setLivestock] = useState<LivestockType>('broiler');
  const [ageValue, setAgeValue] = useState<number>(21);
  const [ageUnit, setAgeUnit] = useState<AgeUnit>('hari');
  const [batchKg, setBatchKg] = useState<number>(500);

  // Result state
  const [currentResult, setCurrentResult] = useState<FormulaResultData | null>(null);

  // Modals state
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [showStockModal, setShowStockModal] = useState<boolean>(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(false);

  // Toggle ingredient selection in step 1
  const handleToggleIngredient = (id: string) => {
    setIngredients(prev =>
      prev.map(item => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleResetIngredients = () => {
    setIngredients(prev =>
      prev.map(item => ({
        ...item,
        selected: ['jagung', 'dedak', 'sbm', 'ikan', 'premix'].includes(item.id)
      }))
    );
  };

  // Update ingredient price in step 2
  const handleUpdatePrice = (id: string, price: number) => {
    setIngredients(prev =>
      prev.map(item => (item.id === id ? { ...item, currentPrice: price } : item))
    );
  };

  // Toggle constraint in step 2
  const handleToggleConstraint = (id: string) => {
    setIngredients(prev =>
      prev.map(item => (item.id === id ? { ...item, hasConstraint: !item.hasConstraint } : item))
    );
  };

  // Update constraint min/max in step 2
  const handleUpdateConstraint = (id: string, min?: number, max?: number) => {
    setIngredients(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              minConstraint: min !== undefined ? min : item.minConstraint,
              maxConstraint: max !== undefined ? max : item.maxConstraint
            }
          : item
      )
    );
  };

  // Update inventory stock and price from StokGudangModal
  const handleUpdateStock = (id: string, newStockKg: number, newPrice: number) => {
    setIngredients(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, inStockKg: newStockKg, currentPrice: newPrice }
          : item
      )
    );
  };

  // Calculate Formulation Solver
  const handleCalculate = (customNutrients?: Partial<TargetNutrisi>) => {
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

    const result = solveFeedFormulation(
      ingredients,
      livestock,
      phaseStr,
      batchKg,
      customNutrients
    );

    setCurrentResult(result);
    setCurrentView('workflow-result');
  };

  // Preset Selection
  const handleSelectPreset = (preset: PresetItem) => {
    if (preset.category === 'layer') {
      setLivestock('layer');
      setAgeValue(28);
      setAgeUnit('minggu');
    } else {
      setLivestock('broiler');
      if (preset.title.includes('Starter')) {
        setAgeValue(10);
        setAgeUnit('hari');
      } else if (preset.title.includes('Finisher')) {
        setAgeValue(32);
        setAgeUnit('hari');
      } else {
        setAgeValue(21);
        setAgeUnit('hari');
      }
    }
    // Launch formulation target screen
    setCurrentView('workflow-step3');
  };

  // Repeat Formula from Riwayat
  const handleRepeatFormula = (item: HistoryFormulaItem) => {
    setBatchKg(item.totalWeight);
    const result = solveFeedFormulation(ingredients, 'broiler', 'Finisher', item.totalWeight);
    setCurrentResult(result);
    setCurrentView('dispense');
  };

  // View details from Riwayat or Beranda
  const handleViewFormulaDetails = (_item?: HistoryFormulaItem) => {
    const result = solveFeedFormulation(ingredients, 'broiler', 'Finisher', 500);
    setCurrentResult(result);
    setCurrentView('workflow-result');
  };

  // Apply AI substitution recommendation
  const handleApplyAISubstitution = () => {
    // Add Tepung Ikan if not selected
    setIngredients(prev =>
      prev.map(i => {
        if (i.id === 'ikan') return { ...i, selected: true };
        if (i.id === 'sbm') return { ...i, hasConstraint: true, maxConstraint: 25 };
        return i;
      })
    );
    const result = solveFeedFormulation(ingredients, 'broiler', 'Finisher', 500);
    setCurrentResult(result);
    setCurrentView('workflow-result');
  };

  // Screen Title & Subtitle helper
  const getHeaderProps = () => {
    switch (currentView) {
      case 'workflow-step1':
      case 'workflow-step2':
      case 'workflow-step3':
        return {
          title: 'Formulasi Ransum Baru',
          subtitle: 'Kalkulator Presisi SNI',
          showBack: true,
          onBack: () => {
            if (currentView === 'workflow-step1') setCurrentView('tab');
            else if (currentView === 'workflow-step2') setCurrentView('workflow-step1');
            else if (currentView === 'workflow-step3') setCurrentView('workflow-step2');
          }
        };
      case 'workflow-result':
        return {
          title: 'Detail Batch Ransum',
          subtitle: currentResult?.batchNumber || 'Hasil Optimasi',
          showBack: true,
          onBack: () => setCurrentView('workflow-step3')
        };
      case 'dispense':
        return {
          title: 'Kontrol Dispenser Mesin',
          subtitle: 'ESP32 Auto-Mixer IoT',
          showBack: true,
          onBack: () => setCurrentView('tab')
        };
      case 'presets':
        return {
          title: 'Target & Preset Nutrisi',
          subtitle: 'Katalog Standar Pakan',
          showBack: true,
          onBack: () => setCurrentView('tab')
        };
      default:
        // In Tab mode
        if (activeTab === 'riwayat') {
          return { title: 'Riwayat Formula', subtitle: 'Arsip Racikan Kandang' };
        }
        if (activeTab === 'asisten-ai') {
          return { title: 'Asisten AI', subtitle: 'Dokter Nutrisi Kandang' };
        }
        if (activeTab === 'profil') {
          return { title: 'Profil & Pengaturan', subtitle: 'Peternakan Berkah Sejahtera' };
        }
        return { title: undefined, subtitle: 'Beranda' };
    }
  };

  const headerProps = getHeaderProps();

  // Smooth scroll to top on tab or view transitions
  const scrollToTop = () => {
    const scrollables = document.querySelectorAll('.overflow-y-auto');
    scrollables.forEach(el => el.scrollTo({ top: 0, behavior: 'smooth' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToTop();
  }, [currentView, activeTab]);

  return (
    <DeviceFrame>
      <div className="w-full h-full bg-[#f8f9ff] flex flex-col overflow-hidden relative">
        {/* Main Header */}
        <Header
          title={headerProps.title}
          subtitle={headerProps.subtitle}
          showBack={headerProps.showBack}
          onBack={headerProps.onBack}
          onNotificationClick={() => setShowNotificationModal(true)}
          onProfileClick={() => {
            setCurrentView('tab');
            setActiveTab('profil');
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-hidden flex flex-col min-h-0 relative">
          {/* Workflow Views */}
          {currentView === 'workflow-step1' && (
            <WorkflowStep1Ingredients
              ingredients={ingredients}
              onToggleIngredient={handleToggleIngredient}
              onResetDefaults={handleResetIngredients}
              onNext={() => setCurrentView('workflow-step2')}
              onBack={() => setCurrentView('tab')}
            />
          )}

          {currentView === 'workflow-step2' && (
            <WorkflowStep2Prices
              ingredients={ingredients}
              onUpdatePrice={handleUpdatePrice}
              onToggleConstraint={handleToggleConstraint}
              onUpdateConstraint={handleUpdateConstraint}
              onNext={() => setCurrentView('workflow-step3')}
              onBack={() => setCurrentView('workflow-step1')}
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
              onBack={() => setCurrentView('workflow-step2')}
            />
          )}

          {currentView === 'workflow-result' && currentResult && (
            <FormulaResultScreen
              data={currentResult}
              onModify={() => setCurrentView('workflow-step3')}
              onSendToDispense={() => setCurrentView('dispense')}
              onAskAI={() => {
                setCurrentView('tab');
                setActiveTab('asisten-ai');
              }}
              onForceSave={() => setCurrentView('dispense')}
            />
          )}

          {currentView === 'dispense' && (
            <DispenseScreen
              batchName={currentResult?.batchName || 'Broiler Grower 500 kg'}
              batchKg={currentResult?.totalBatchKg || batchKg}
              onBack={() => setCurrentView('tab')}
            />
          )}

          {currentView === 'presets' && (
            <PresetNutrisiScreen
              onSelectPreset={handleSelectPreset}
              onBack={() => setCurrentView('tab')}
            />
          )}

          {/* Tab Views */}
          {currentView === 'tab' && (
            <div className="flex-1 w-full min-h-0 flex flex-col overflow-hidden">
              {activeTab === 'beranda' && (
                <BerandaScreen
                  onStartFormulation={() => setCurrentView('workflow-step1')}
                  onOpenIngredients={() => setCurrentView('workflow-step1')}
                  onOpenPrices={() => setCurrentView('workflow-step2')}
                  onOpenTargets={() => setCurrentView('presets')}
                  onOpenDispense={() => setCurrentView('dispense')}
                  onOpenStock={() => setShowStockModal(true)}
                  onOpenHistory={() => setActiveTab('riwayat')}
                  onOpenAssistant={() => setActiveTab('asisten-ai')}
                  onViewLastFormula={handleViewFormulaDetails}
                />
              )}

              {activeTab === 'riwayat' && (
                <RiwayatScreen
                  onViewDetails={handleViewFormulaDetails}
                  onRepeatFormula={handleRepeatFormula}
                />
              )}

              {activeTab === 'asisten-ai' && (
                <AsistenAiScreen
                  onApplySubstitution={handleApplyAISubstitution}
                />
              )}

              {activeTab === 'profil' && (
                <ProfilScreen
                  onOpenPresets={() => setCurrentView('presets')}
                  onOpenStock={() => setShowStockModal(true)}
                  onOpenCalibration={() => setShowCalibrationModal(true)}
                  onOpenSNIGuide={() => setCurrentView('presets')}
                  onContactSupport={() => alert('Menghubungkan ke Tim Teknisi WhatsApp CluckFeed: +62 811-9988-7766')}
                />
              )}
            </div>
          )}
        </main>

        {/* Global Bottom Navigation (Visible in Tab Mode) */}
        {currentView === 'tab' && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              scrollToTop();
            }}
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
      </div>
    </DeviceFrame>
  );
}
