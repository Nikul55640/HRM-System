import { useEffect } from 'react';

/**
 * Performance Monitor Component
 * Tracks and reports performance metrics
 */
const PerformanceMonitor = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            console.log('LCP:', entry.startTime);
            if (entry.startTime > 2500) {
              console.warn('⚠️ LCP is slow:', entry.startTime + 'ms');
            }
            break;
          case 'first-input':
            console.log('FID:', entry.processingStart - entry.startTime);
            if (entry.processingStart - entry.startTime > 100) {
              console.warn('⚠️ FID is slow:', (entry.processingStart - entry.startTime) + 'ms');
            }
            break;
          case 'layout-shift':
            if (!entry.hadRecentInput) {
              console.log('CLS:', entry.value);
              if (entry.value > 0.1) {
                console.warn('⚠️ CLS is high:', entry.value);
              }
            }
            break;
        }
      });
    });

    // Observe performance metrics
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    // Monitor bundle sizes
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      const largeResources = resources.filter(resource => resource.transferSize > 100000); // > 100KB
      
      if (largeResources.length > 0) {
        console.group('🚨 Large Resources Detected:');
        largeResources.forEach(resource => {
          console.log(`${resource.name}: ${Math.round(resource.transferSize / 1024)}KB`);
        });
        console.groupEnd();
      }
    }

    // Monitor long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          console.warn('🐌 Long Task detected:', entry.duration + 'ms', entry);
        }
      });
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long Task Observer not supported:', error);
    }

    return () => {
      observer.disconnect();
      longTaskObserver.disconnect();
    };
  }, [enabled]);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;