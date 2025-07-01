
import React from 'react';

interface InputProps {
  fixedCosts: string;
  setFixedCosts: (value: string) => void;
  variableCost: string;
  setVariableCost: (value: string) => void;
  unitPrice: string;
  setUnitPrice: (value: string) => void;
  handleCalculate: () => void;
  error: string | null;
}

const InputCard: React.FC<InputProps> = ({
  fixedCosts,
  setFixedCosts,
  variableCost,
  setVariableCost,
  unitPrice,
  setUnitPrice,
  handleCalculate,
  error,
}) => {
  const inputFields = [
    {
      label: "固定成本总额 (Fixed Costs)",
      value: fixedCosts,
      setter: setFixedCosts,
      id: "fixed-costs",
      placeholder: "例如: 50000"
    },
    {
      label: "单位变动成本 (Variable Cost per Unit)",
      value: variableCost,
      setter: setVariableCost,
      id: "variable-cost",
      placeholder: "例如: 75"
    },
    {
      label: "单位产品销售价格 (Price per Unit)",
      value: unitPrice,
      setter: setUnitPrice,
      id: "unit-price",
      placeholder: "例如: 125"
    }
  ];

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg w-full">
      <h2 className="text-2xl font-bold text-white mb-6">数据输入</h2>
      <div className="space-y-4">
        {inputFields.map(field => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium text-slate-300 mb-1">
              {field.label}
            </label>
            <input
              type="number"
              id={field.id}
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            />
          </div>
        ))}
      </div>
      {error && (
        <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      <button
        onClick={handleCalculate}
        className="mt-6 w-full bg-brand-blue hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
      >
        计算保本点
      </button>
    </div>
  );
};

export default InputCard;
