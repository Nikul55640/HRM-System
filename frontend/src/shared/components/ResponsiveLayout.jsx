import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Responsive Layout Component
 * Handles responsive behavior and mobile optimization
 */
const ResponsiveLayout = ({ 
  children, 
  className = '', 
  mobileBreakpoint = 768,
  tabletBreakpoint = 1024 
}) => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: false
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width < mobileBreakpoint,
        isTablet: width >= mobileBreakpoint && width < tabletBreakpoint,
        isDesktop: width >= tabletBreakpoint
      });
    };

    // Set initial size
    handleResize();

    // Add event listener with throttling
    let timeoutId;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', throttledResize);
    return () => {
      window.removeEventListener('resize', throttledResize);
      clearTimeout(timeoutId);
    };
  }, [mobileBreakpoint, tabletBreakpoint]);

  // Generate responsive classes
  const responsiveClasses = [
    className,
    screenSize.isMobile ? 'mobile-layout' : '',
    screenSize.isTablet ? 'tablet-layout' : '',
    screenSize.isDesktop ? 'desktop-layout' : '',
    'responsive-container'
  ].filter(Boolean).join(' ');

  return (
    <div className={responsiveClasses} data-screen-size={screenSize.isMobile ? 'mobile' : screenSize.isTablet ? 'tablet' : 'desktop'}>
      {typeof children === 'function' ? children(screenSize) : children}
    </div>
  );
};

ResponsiveLayout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  className: PropTypes.string,
  mobileBreakpoint: PropTypes.number,
  tabletBreakpoint: PropTypes.number
};

export default ResponsiveLayout;