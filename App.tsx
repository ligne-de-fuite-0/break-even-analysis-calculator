
import React, { useState, useCallback } from 'react';
import { Scenario } from './types';
import InputCard from './components/InputCard';
import ResultsCard from './components/ResultsCard';
import ChartCard from './components/ChartCard';
import HistoryTable from './components/HistoryTable';
import { CalculatorIcon, ChartIcon, LineChartIcon } from './components/icons';
import BreakdownChartCard from "./components/BreakdownChartCard";

const TabButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, label, isActive, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center px-4 py-3 font-semibold text-sm transition-colors duration-200 ease-in-out border-b-2
      ${isActive ? 'text-brand-blue border-brand-blue' : 'text-slate-400 border-transparent hover:text-white hover:border-slate-500'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
  >
    {icon}
    <span className="ml-2">{label}</span>
  </button>
);


const App: React.FC = () => {
  const [fixedCosts, setFixedCosts] = useState<string>('50000');
  const [variableCost, setVariableCost] = useState<string>('75');
  const [unitPrice, setUnitPrice] = useState<string>('125');
  const [error, setError] = useState<string | null>(null);

  const [currentResult, setCurrentResult] = useState<{ quantity: number; sales: number } | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeChartTab, setActiveChartTab] = useState<'comparison' | 'breakdown'>('comparison');


  const handleCalculate = useCallback(() => {
    setError(null);

    const fc = parseFloat(fixedCosts);
    const vc = parseFloat(variableCost);
    const p = parseFloat(unitPrice);

    if (isNaN(fc) || isNaN(vc) || isNaN(p)) {
      setError("所有输入必须是有效的数字。");
      setCurrentResult(null);
      return;
    }

    if (fc < 0 || vc < 0 || p < 0) {
      setError("所有输入值必须为非负数。");
      setCurrentResult(null);
      return;
    }

    if (p <= vc) {
      setError("单位产品销售价格必须大于单位变动成本。");
      setCurrentResult(null);
      return;
    }

    const breakEvenQuantity = fc / (p - vc);
    const breakEvenSales = fc / (1 - (vc / p));

    setCurrentResult({ quantity: breakEvenQuantity, sales: breakEvenSales });
    setActiveChartTab('breakdown');
  }, [fixedCosts, variableCost, unitPrice]);

  const handleAddToComparison = useCallback(() => {
    if (!currentResult) return;
    
    const fc = parseFloat(fixedCosts);
    const vc = parseFloat(variableCost);
    const p = parseFloat(unitPrice);

    const newScenario: Scenario = {
      id: Date.now(),
      name: `情景 ${scenarios.length + 1}`,
      fixedCosts: fc,
      variableCost: vc,
      unitPrice: p,
      breakEvenQuantity: currentResult.quantity,
      breakEvenSales: currentResult.sales,
    };

    setScenarios(prev => [...prev, newScenario]);
    setActiveChartTab('comparison');
  }, [currentResult, fixedCosts, variableCost, unitPrice, scenarios.length]);

  const handleRemoveScenario = (id: number) => {
    const updatedScenarios = scenarios.filter(s => s.id !== id).map((s, index) => ({ ...s, name: `情景 ${index + 1}` }));
    setScenarios(updatedScenarios);
    if(updatedScenarios.length === 0 && activeChartTab === 'comparison') {
        if(currentResult){
            setActiveChartTab('breakdown');
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight flex items-center justify-center gap-3">
            <CalculatorIcon className="w-10 h-10 text-brand-blue" />
            <span>保本点分析计算器</span>
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            输入您的成本和价格数据，即时计算保本销售量和销售额，并对比多种情景。
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <InputCard 
              fixedCosts={fixedCosts}
              setFixedCosts={setFixedCosts}
              variableCost={variableCost}
              setVariableCost={setVariableCost}
              unitPrice={unitPrice}
              setUnitPrice={setUnitPrice}
              handleCalculate={handleCalculate}
              error={error}
            />
            <ResultsCard 
              quantity={currentResult?.quantity ?? null}
              sales={currentResult?.sales ?? null}
              onAddToComparison={handleAddToComparison}
            />
          </div>
          <div className="lg:col-span-3">
             <div className="mb-4 flex border-b border-slate-700">
                <TabButton
                    icon={<ChartIcon className="w-5 h-5" />}
                    label="情景对比分析"
                    isActive={activeChartTab === 'comparison'}
                    onClick={() => setActiveChartTab('comparison')}
                />
                <TabButton
                    icon={<LineChartIcon className="w-5 h-5" />}
                    label="保本点明细图"
                    isActive={activeChartTab === 'breakdown'}
                    onClick={() => setActiveChartTab('breakdown')}
                    disabled={!currentResult}
                />
            </div>
             {activeChartTab === 'comparison' && <ChartCard data={scenarios} />}
             {activeChartTab === 'breakdown' && currentResult && (
                 <BreakdownChartCard
                     fixedCosts={parseFloat(fixedCosts) || 0}
                     variableCost={parseFloat(variableCost) || 0}
                     unitPrice={parseFloat(unitPrice) || 0}
                     breakEvenQuantity={currentResult.quantity}
                     breakEvenSales={currentResult.sales}
                 />
             )}
            {activeChartTab === 'breakdown' && !currentResult && (
                <div className="flex items-center justify-center h-[464px] bg-slate-800 rounded-xl shadow-lg">
                    <div className="text-center text-slate-400">
                        <LineChartIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>先计算一个结果来查看保本点明细图</p>
                    </div>
               </div>
            )}
          </div>
        </main>

        <section className="mt-8">
          <HistoryTable scenarios={scenarios} removeScenario={handleRemoveScenario} />
        </section>

        <footer className="text-center mt-12 py-6 border-t border-slate-800">
            <p className="text-sm text-slate-500">
                Crafted by a Senior Frontend React Engineer.
            </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
