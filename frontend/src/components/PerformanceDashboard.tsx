// Performance Dashboard Component
// Shows real-time performance metrics for development and debugging

import React, { useEffect, useState } from 'react';
import { PerformanceDashboard } from '../utils/performanceMonitor';
import Icon from './icons/Icon';

interface PerformanceStats {
  avg: number;
  min: number;
  max: number;
  count: number;
}

const PerformanceDashboardComponent: React.FC = () => {
  const [stats, setStats] = useState<Record<string, PerformanceStats>>({});
  const [isVisible, setIsVisible] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        const dashboard = PerformanceDashboard.getInstance();
        setStats(dashboard.getAllStats());
      }, 1000);

      setRefreshInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isVisible]);

  const formatMetric = (value: number): string => {
    if (value < 1000) {
      return `${Math.round(value)}ms`;
    }
    return `${(value / 1000).toFixed(2)}s`;
  };

  const getMetricColor = (metric: string, value: number): string => {
    // Core Web Vitals thresholds
    const thresholds: Record<string, { good: number; poor: number }> = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'text-gray-600';

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportData = () => {
    const dashboard = PerformanceDashboard.getInstance();
    const data = dashboard.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className='fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50'
        title='Open Performance Dashboard'
      >
        <Icon name='activity' size={20} />
      </button>
    );
  }

  return (
    <div className='fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl w-96 max-h-96 overflow-hidden z-50'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50'>
        <h3 className='text-lg font-semibold text-gray-900'>Performance Dashboard</h3>
        <div className='flex space-x-2'>
          <button
            onClick={exportData}
            className='p-1 text-gray-500 hover:text-gray-700'
            title='Export Data'
          >
            <Icon name='download' size={16} />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className='p-1 text-gray-500 hover:text-gray-700'
            title='Close'
          >
            <Icon name='x' size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='p-4 max-h-80 overflow-y-auto'>
        {Object.keys(stats).length === 0 ? (
          <p className='text-gray-500 text-center py-4'>No performance data available</p>
        ) : (
          <div className='space-y-4'>
            {Object.entries(stats).map(([metric, stat]) => (
              <div key={metric} className='border border-gray-200 rounded-lg p-3'>
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='font-medium text-gray-900'>{metric}</h4>
                  <span className='text-sm text-gray-500'>{stat.count} samples</span>
                </div>

                <div className='grid grid-cols-3 gap-2 text-sm'>
                  <div>
                    <span className='text-gray-500'>Avg:</span>
                    <span className={`ml-1 font-medium ${getMetricColor(metric, stat.avg)}`}>
                      {formatMetric(stat.avg)}
                    </span>
                  </div>
                  <div>
                    <span className='text-gray-500'>Min:</span>
                    <span className={`ml-1 font-medium ${getMetricColor(metric, stat.min)}`}>
                      {formatMetric(stat.min)}
                    </span>
                  </div>
                  <div>
                    <span className='text-gray-500'>Max:</span>
                    <span className={`ml-1 font-medium ${getMetricColor(metric, stat.max)}`}>
                      {formatMetric(stat.max)}
                    </span>
                  </div>
                </div>

                {/* Progress bar for Core Web Vitals */}
                {['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].includes(metric) && (
                  <div className='mt-2'>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full ${
                          stat.avg <= (metric === 'CLS' ? 0.1 : 2500)
                            ? 'bg-green-500'
                            : stat.avg <= (metric === 'CLS' ? 0.25 : 4000)
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (stat.avg / (metric === 'CLS' ? 0.5 : 5000)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500'>
        <div className='flex justify-between'>
          <span>Real-time monitoring</span>
          <span>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboardComponent;
