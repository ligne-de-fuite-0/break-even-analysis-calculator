import React, { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Scenario } from '../types';
import { ChartIcon, DownloadIcon } from './icons';

interface ChartProps {
  data: Scenario[];
}

const ChartCard: React.FC<ChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!chartRef.current) {
      console.error("Chart reference is not available.");
      return;
    }

    const svgElement = chartRef.current.querySelector('svg');
    if (!svgElement) {
      console.error("SVG element not found.");
      return;
    }

    try {
      const { width, height } = svgElement.getBoundingClientRect();

      const styles = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('');
          } catch (e) {
            console.warn('Cannot read CSS rules from stylesheet', sheet.href);
            return '';
          }
        })
        .join('');

      const svgClone = svgElement.cloneNode(true) as SVGElement;
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgClone.setAttribute('width', String(width));
      svgClone.setAttribute('height', String(height));
      
      const styleElement = document.createElement('style');
      styleElement.textContent = styles;
      
      const defsElement = document.createElement('defs');
      defsElement.appendChild(styleElement);
      svgClone.insertBefore(defsElement, svgClone.firstChild);

      const svgString = new XMLSerializer().serializeToString(svgClone);
      const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2; // Higher resolution
        canvas.width = width * scale;
        canvas.height = height * scale;

        const context = canvas.getContext('2d');
        if (context) {
          context.scale(scale, scale);
          context.fillStyle = '#1e293b'; // bg-slate-800
          context.fillRect(0, 0, width, height);
          context.drawImage(image, 0, 0, width, height);
          
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = 'scenario-comparison-chart.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      };
      image.onerror = (err) => {
        console.error('Failed to load SVG image for download.', err);
      };
      image.src = dataUri;
    } catch (error) {
      console.error('Failed to prepare chart for download:', error);
    }
  };


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
