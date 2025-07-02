import React, { useRef, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Scenario } from '../types';
import { ChartIcon, DownloadIcon } from './icons';

declare const html2canvas: any;

interface ChartProps {
  data: Scenario[];
  autoDownload?: boolean;
}

const ChartCard: React.FC<ChartProps> = ({ data, autoDownload }) => {
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
      link.download = 'scenario-comparison-chart.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to capture chart for download:', error);
    }
  }, []);

  useEffect(() => {
    if (autoDownload && !downloadTriggered.current && data.length > 0 && chartRef.current) {
        downloadTriggered.current = true;
        // Use a timeout to ensure the chart animation completes and everything is rendered.
        const timer = setTimeout(() => {
            handleDownload();
        }, 1000); 
        return () => clearTimeout(timer);
    }
  }, [autoDownload, data, handleDownload]);


  const formatCurrency = (value: number) => {
    if (value > 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value > 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const formatNumber = (value: number) => {
    if (value > 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value > 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };


  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ChartIcon className="w-6 h-6" />
          情景对比分析
        </h2>
        {data.length > 0 && (
          <button
            onClick={handleDownload}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="下载图表"
            title="下载图表"
          >
            <DownloadIcon className="w-6 h-6" />
          </button>
        )}
      </div>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-80 bg-slate-850 rounded-lg">
          <p className="text-slate-400">添加计算结果以开始对比</p>
        </div>
      ) : (
        <div className="w-full h-96" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#d1d5db' }} />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" tick={{ fill: '#d1d5db' }} tickFormatter={formatNumber} label={{ value: '销售量 (件)', angle: -90, position: 'insideLeft', fill: '#9ca3af', dy:40 }}/>
              <YAxis yAxisId="right" orientation="right" stroke="#22c55e" tick={{ fill: '#d1d5db' }} tickFormatter={formatCurrency} label={{ value: '销售额 (元)', angle: 90, position: 'insideRight', fill: '#9ca3af', dx:-10, dy:40 }}/>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  borderColor: '#4b5563',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#f3f4f6', fontWeight: 'bold' }}
                itemStyle={{ fontWeight: 'normal' }}
                formatter={(value: number, name: string) => {
                   if (name === '保本销售额') {
                     return `${new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(value)}`;
                   }
                   return `${new Intl.NumberFormat('zh-CN').format(value)} 件`;
                }}
              />
              <Legend wrapperStyle={{color: '#d1d5db'}}/>
              <Bar yAxisId="left" dataKey="breakEvenQuantity" name="保本销售量" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="breakEvenSales" name="保本销售额" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ChartCard;
