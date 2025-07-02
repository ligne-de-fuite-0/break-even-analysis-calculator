import React, { useRef, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot, ReferenceArea } from 'recharts';
import { LineChartIcon, DownloadIcon } from './icons';

declare const html2canvas: any;

interface BreakdownChartProps {
  fixedCosts: number;
  variableCost: number;
  unitPrice: number;
  breakEvenQuantity: number;
  breakEvenSales: number;
  autoDownload?: boolean;
}

const BreakdownChartCard: React.FC<BreakdownChartProps> = ({
  fixedCosts,
  variableCost,
  unitPrice,
  breakEvenQuantity,
  breakEvenSales,
  autoDownload
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const downloadTriggered = useRef(false);

  const handleDownload = useCallback(async () => {
    if (!chartRef.current || typeof html2canvas === 'undefined') {
      console.error("Chart reference or html2canvas is not available.");
      return;
    }

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#1e293b', // bg-slate-800
        scale: 2, // for higher resolution
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'breakdown-chart.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to capture chart for download:', error);
    }
  }, []);

  useEffect(() => {
    if (autoDownload && !downloadTriggered.current && chartRef.current) {
        downloadTriggered.current = true;
        // Use a timeout to ensure the chart animation completes and everything is rendered.
        const timer = setTimeout(() => {
            handleDownload();
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [autoDownload, handleDownload]);
  
  const chartData = React.useMemo(() => {
    if (unitPrice <= variableCost || unitPrice <= 0) return [];

    const data = [];
    const maxQuantity = Math.max(Math.ceil(breakEvenQuantity * 2), 100); 
    const step = Math.ceil(maxQuantity / 20);

    for (let q = 0; q <= maxQuantity; q += step) {
      if (q > maxQuantity) { // Ensure last step doesn't overshoot
        data.push({
            quantity: maxQuantity,
            totalRevenue: unitPrice * maxQuantity,
            totalCosts: fixedCosts + (variableCost * maxQuantity),
            fixedCosts: fixedCosts,
        });
        break;
      }
      data.push({
        quantity: q,
        totalRevenue: unitPrice * q,
        totalCosts: fixedCosts + (variableCost * q),
        fixedCosts: fixedCosts,
      });
    }

    const beqCeiled = Math.ceil(breakEvenQuantity);
    if (!data.find(d => d.quantity === beqCeiled)) {
        data.push({
            quantity: beqCeiled,
            totalRevenue: unitPrice * beqCeiled,
            totalCosts: fixedCosts + (variableCost * beqCeiled),
            fixedCosts: fixedCosts,
        });
        data.sort((a,b) => a.quantity - b.quantity);
    }

    return data;
  }, [fixedCosts, variableCost, unitPrice, breakEvenQuantity]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `¥${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `¥${(value / 1000).toFixed(1)}K`;
    return `¥${value.toFixed(0)}`;
  };
  
  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <LineChartIcon className="w-6 h-6" />
          保本点明细图
        </h2>
        <button
          onClick={handleDownload}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label="下载图表"
          title="下载图表"
        >
          <DownloadIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="w-full h-96" ref={chartRef}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 30, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="quantity" 
              stroke="#9ca3af" 
              tick={{ fill: '#d1d5db' }}
              label={{ value: '销售量 (件)', position: 'insideBottom', offset: -10, fill: '#9ca3af' }}
              type="number"
              domain={[0, 'dataMax']}
              tickFormatter={formatNumber}
            />
            <YAxis 
              stroke="#9ca3af" 
              tick={{ fill: '#d1d5db' }} 
              tickFormatter={formatCurrency}
              label={{ value: '金额 (元)', angle: -90, position: 'insideLeft', fill: '#9ca3af', dx: -20 }}
              domain={[0, 'dataMax']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                borderColor: '#4b5563',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: '#f3f4f6', fontWeight: 'bold' }}
              itemStyle={{ fontWeight: 'normal' }}
              formatter={(value: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(value)}
              labelFormatter={(label) => `销售量: ${formatNumber(label)}`}
            />
            <Legend wrapperStyle={{color: '#d1d5db', paddingTop: '20px'}}/>

            <ReferenceArea x1={0} x2={breakEvenQuantity} fill="#dc2626" fillOpacity={0.1} label={{ value: '亏损区', position: 'insideTopLeft', fill: '#f87171', fontSize: 12, dy: 10, dx: 10 }} />
            <ReferenceArea x1={breakEvenQuantity} fill="#16a34a" fillOpacity={0.1} label={{ value: '盈利区', position: 'insideTopRight', fill: '#4ade80', fontSize: 12, dy: 10, dx: -10 }} />
            
            <Line type="monotone" dataKey="totalRevenue" name="总收入" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="totalCosts" name="总成本" stroke="#f97316" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="fixedCosts" name="固定成本" stroke="#60a5fa" strokeWidth={2} strokeDasharray="5 5" dot={false} />

            <ReferenceDot
                x={breakEvenQuantity}
                y={breakEvenSales}
                r={6}
                fill="#3b82f6"
                stroke="white"
                strokeWidth={2}
                label={{
                    value: `保本点 (${formatNumber(Math.ceil(breakEvenQuantity))} 件, ${formatCurrency(breakEvenSales)})`,
                    position: 'top',
                    fill: '#d1d5db',
                    dy: -15,
                    fontSize: 12
                }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BreakdownChartCard;
