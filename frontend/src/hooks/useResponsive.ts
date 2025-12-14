import { useState, useEffect } from 'react';

interface Breakpoints {
    isMobile: boolean;
    isTablet: boolean;
    isLaptop: boolean;
    isDesktop: boolean;
    width: number;
}

export const useResponsive = (): Breakpoints => {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Set initial size

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        isMobile: windowSize.width < 640,
        isTablet: windowSize.width >= 640 && windowSize.width < 1024,
        isLaptop: windowSize.width >= 1024 && windowSize.width < 1440,
        isDesktop: windowSize.width >= 1440,
        width: windowSize.width,
    };
};

