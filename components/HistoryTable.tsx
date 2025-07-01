
import React from 'react';
import { Scenario } from '../types';
import { TrashIcon } from './icons';

interface HistoryProps {
  scenarios: Scenario[];
  removeScenario: (id: number) => void;
}

const HistoryTable: React.FC<HistoryProps> = ({ scenarios, removeScenario }) => {
  if (scenarios.length === 0) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(value);
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('zh-CN').format(value);
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">已保存情景</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-850">
            <tr>
              <th scope="col" className="px-6 py-3">情景</th>
              <th scope="col" className="px-6 py-3">固定成本</th>
              <th scope="col" className="px-6 py-3">单位变动成本</th>
              <th scope="col" className="px-6 py-3">单位价格</th>
              <th scope="col" className="px-6 py-3">保本量</th>
              <th scope="col" className="px-6 py-3">保本额</th>
              <th scope="col" className="px-6 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s) => (
              <tr key={s.id} className="border-b border-slate-700 hover:bg-slate-850/50">
                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{s.name}</td>
                <td className="px-6 py-4">{formatCurrency(s.fixedCosts)}</td>
                <td className="px-6 py-4">{formatCurrency(s.variableCost)}</td>
                <td className="px-6 py-4">{formatCurrency(s.unitPrice)}</td>
                <td className="px-6 py-4 font-semibold text-brand-blue">{formatNumber(Math.ceil(s.breakEvenQuantity))} 件</td>
                <td className="px-6 py-4 font-semibold text-brand-green">{formatCurrency(s.breakEvenSales)}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => removeScenario(s.id)} className="text-red-500 hover:text-red-400 transition">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
