
import React from 'react';
import { PlusIcon } from './icons';

interface ResultsProps {
  quantity: number | null;
  sales: number | null;
  onAddToComparison: () => void;
}

const ResultsCard: React.FC<ResultsProps> = ({ quantity, sales, onAddToComparison }) => {
  const hasResults = quantity !== null && sales !== null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(value);
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('zh-CN').format(value);
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg w-full">
      <h2 className="text-2xl font-bold text-white mb-6">计算结果</h2>
      <div className="space-y-4">
        <div className="bg-slate-850 p-4 rounded-lg">
          <p className="text-sm text-slate-400">保本销售量 (Break-even Quantity)</p>
          <p className="text-3xl font-semibold text-brand-blue">
            {hasResults ? `${formatNumber(Math.ceil(quantity))} 件` : '—'}
          </p>
        </div>
        <div className="bg-slate-850 p-4 rounded-lg">
          <p className="text-sm text-slate-400">保本销售额 (Break-even Sales)</p>
          <p className="text-3xl font-semibold text-brand-green">
            {hasResults ? formatCurrency(sales) : '—'}
          </p>
        </div>
      </div>
      {hasResults && (
        <button
          onClick={onAddToComparison}
          className="mt-6 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>添加至对比</span>
        </button>
      )}
    </div>
  );
};

export default ResultsCard;
