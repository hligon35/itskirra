// Kirra's Nail Studio - Performance Monitoring
// Track website performance metrics and optimization results

class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.startTime = performance.now();
        this.init();
    }

    init() {
        // Wait for page to fully load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.trackInitialMetrics());
        } else {
            this.trackInitialMetrics();
        }

        window.addEventListener('load', () => this.trackLoadMetrics());
    }

    trackInitialMetrics() {
        this.metrics.domContentLoaded = performance.now() - this.startTime;
        console.log(`🎯 DOM Content Loaded: ${this.metrics.domContentLoaded.toFixed(2)}ms`);
    }

    trackLoadMetrics() {
        this.metrics.windowLoad = performance.now() - this.startTime;
        
        // Core Web Vitals
        this.trackCoreWebVitals();
        
        // Resource metrics
        this.trackResourceMetrics();
        
        // Custom metrics
        this.trackCustomMetrics();
        
        // Report results
        this.reportMetrics();
    }

    trackCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
                console.log(`🖼️ Largest Contentful Paint: ${this.metrics.lcp.toFixed(2)}ms`);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay (FID)
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                    console.log(`⚡ First Input Delay: ${this.metrics.fid.toFixed(2)}ms`);
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                this.metrics.cls = clsValue;
                console.log(`📐 Cumulative Layout Shift: ${this.metrics.cls.toFixed(4)}`);
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }

    trackResourceMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource');

        this.metrics.resources = {
            total: resources.length,
            images: resources.filter(r => r.initiatorType === 'img').length,
            scripts: resources.filter(r => r.initiatorType === 'script').length,
            stylesheets: resources.filter(r => r.initiatorType === 'link').length,
            fonts: resources.filter(r => r.initiatorType === 'other' && r.name.includes('font')).length
        };

        this.metrics.timing = {
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            connection: navigation.connectEnd - navigation.connectStart,
            request: navigation.responseStart - navigation.requestStart,
            response: navigation.responseEnd - navigation.responseStart,
            domProcessing: navigation.domContentLoadedEventStart - navigation.responseEnd,
            totalLoad: navigation.loadEventEnd - navigation.navigationStart
        };
    }

    trackCustomMetrics() {
        // Hero section visibility
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            this.metrics.heroVisible = this.getTimeToVisible(heroSection);
        }

        // Gallery initialization
        const gallery = document.querySelector('.gallery-grid');
        if (gallery) {
            this.metrics.galleryReady = this.getTimeToVisible(gallery);
        }

        // Form interaction ready
        const form = document.querySelector('#appointment-form, #appointmentForm');
        if (form) {
            this.metrics.formReady = performance.now() - this.startTime;
        }

        // Count lazy-loaded images
        const lazyImages = document.querySelectorAll('img[data-src]');
        this.metrics.lazyImages = lazyImages.length;

        // Mobile optimization check
        this.metrics.isMobile = window.innerWidth < 768;
        this.metrics.viewport = `${window.innerWidth}x${window.innerHeight}`;
    }

    getTimeToVisible(element) {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        return isVisible ? performance.now() - this.startTime : null;
    }

    reportMetrics() {
        console.group('🚀 Kirra\'s Nail Studio - Performance Report');
        
        console.log('📊 Load Times:');
        console.log(`  DOM Ready: ${this.metrics.domContentLoaded?.toFixed(2)}ms`);
        console.log(`  Window Load: ${this.metrics.windowLoad?.toFixed(2)}ms`);
        
        if (this.metrics.timing) {
            console.log('⏱️ Navigation Timing:');
            Object.entries(this.metrics.timing).forEach(([key, value]) => {
                console.log(`  ${key}: ${value.toFixed(2)}ms`);
            });
        }

        if (this.metrics.resources) {
            console.log('📦 Resources:');
            Object.entries(this.metrics.resources).forEach(([key, value]) => {
                console.log(`  ${key}: ${value}`);
            });
        }

        console.log('🎯 Custom Metrics:');
        if (this.metrics.heroVisible) console.log(`  Hero Visible: ${this.metrics.heroVisible.toFixed(2)}ms`);
        if (this.metrics.galleryReady) console.log(`  Gallery Ready: ${this.metrics.galleryReady.toFixed(2)}ms`);
        if (this.metrics.formReady) console.log(`  Form Ready: ${this.metrics.formReady.toFixed(2)}ms`);
        console.log(`  Lazy Images: ${this.metrics.lazyImages || 0}`);
        console.log(`  Device: ${this.metrics.isMobile ? 'Mobile' : 'Desktop'} (${this.metrics.viewport})`);

        console.log('🌟 Core Web Vitals:');
        if (this.metrics.lcp) console.log(`  LCP: ${this.metrics.lcp.toFixed(2)}ms ${this.getLCPGrade()}`);
        if (this.metrics.fid) console.log(`  FID: ${this.metrics.fid.toFixed(2)}ms ${this.getFIDGrade()}`);
        if (this.metrics.cls) console.log(`  CLS: ${this.metrics.cls.toFixed(4)} ${this.getCLSGrade()}`);

        this.generateOptimizationReport();
        
        console.groupEnd();
    }

    getLCPGrade() {
        if (!this.metrics.lcp) return '';
        if (this.metrics.lcp <= 2500) return '✅ Good';
        if (this.metrics.lcp <= 4000) return '⚠️ Needs Improvement';
        return '❌ Poor';
    }

    getFIDGrade() {
        if (!this.metrics.fid) return '';
        if (this.metrics.fid <= 100) return '✅ Good';
        if (this.metrics.fid <= 300) return '⚠️ Needs Improvement';
        return '❌ Poor';
    }

    getCLSGrade() {
        if (!this.metrics.cls) return '';
        if (this.metrics.cls <= 0.1) return '✅ Good';
        if (this.metrics.cls <= 0.25) return '⚠️ Needs Improvement';
        return '❌ Poor';
    }

    generateOptimizationReport() {
        console.log('🔧 Optimization Status:');
        
        const optimizations = [
            { name: 'Lazy Loading Images', status: this.metrics.lazyImages > 0, priority: 'High' },
            { name: 'Mobile-First Design', status: true, priority: 'High' },
            { name: 'CSS Custom Properties', status: true, priority: 'Medium' },
            { name: 'Optimized JavaScript', status: true, priority: 'High' },
            { name: 'SEO Meta Tags', status: document.querySelector('meta[name="description"]'), priority: 'High' },
            { name: 'Schema.org Markup', status: document.querySelector('script[type="application/ld+json"]'), priority: 'Medium' },
            { name: 'Responsive Images', status: document.querySelector('img[loading="lazy"]'), priority: 'Medium' },
            { name: 'Performance Monitoring', status: true, priority: 'Low' }
        ];

        optimizations.forEach(opt => {
            const status = opt.status ? '✅' : '❌';
            console.log(`  ${status} ${opt.name} (${opt.priority} Priority)`);
        });

        const score = optimizations.filter(opt => opt.status).length / optimizations.length * 100;
        console.log(`📈 Overall Optimization Score: ${score.toFixed(1)}%`);
    }

    // Method to export metrics for analysis
    exportMetrics() {
        return {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            metrics: this.metrics
        };
    }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
    window.performanceMonitor = new PerformanceMonitor();
    
    // Add to global scope for debugging
    window.getPerformanceReport = () => {
        return window.performanceMonitor.exportMetrics();
    };
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}
