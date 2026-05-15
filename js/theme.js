// js/theme.js - Centralized Theme Management for ALL Pages

(function() {
    'use strict';
    
    // Theme Manager Object
    const ThemeManager = {
        currentTheme: 'dark',
        
        // Initialize theme on page load
        init: function() {
            this.loadTheme();
            this.setupThemeSwitcher();
            this.watchSystemTheme();
            console.log('Theme Manager initialized - Current theme:', this.currentTheme);
        },
        
        // Load saved theme from localStorage
        loadTheme: function() {
            const savedTheme = localStorage.getItem('mittely_theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (savedTheme === 'light') {
                this.setTheme('light', false);
            } else if (savedTheme === 'dark') {
                this.setTheme('dark', false);
            } else if (prefersDark) {
                this.setTheme('dark', false);
            } else {
                this.setTheme('dark', false); // MITTELY default is dark
            }
        },
        
        // Set theme
        setTheme: function(theme, save = true) {
            this.currentTheme = theme;
            
            if (theme === 'light') {
                document.body.classList.add('light-theme');
            } else {
                document.body.classList.remove('light-theme');
            }
            
            if (save) {
                localStorage.setItem('mittely_theme', theme);
            }
            
            this.updateButtonIcon();
            this.updateMetaThemeColor();
            
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('themeChanged', { 
                detail: { theme: this.currentTheme } 
            }));
        },
        
        // Toggle between light and dark
        toggleTheme: function() {
            const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme, true);
            
            // Show toast if function exists
            if (typeof showToast === 'function') {
                showToast('Theme Changed', `${newTheme === 'light' ? 'Light' : 'Dark'} mode activated`, 'info');
            }
            
            return newTheme;
        },
        
        // Update theme switcher button icons
        updateButtonIcon: function() {
            const themeSwitcher = document.getElementById('themeSwitcher');
            if (!themeSwitcher) return;
            
            const sunIcon = themeSwitcher.querySelector('.fa-sun');
            const moonIcon = themeSwitcher.querySelector('.fa-moon');
            
            if (this.currentTheme === 'light') {
                if (sunIcon) sunIcon.style.display = 'none';
                if (moonIcon) moonIcon.style.display = 'inline-block';
            } else {
                if (sunIcon) sunIcon.style.display = 'inline-block';
                if (moonIcon) moonIcon.style.display = 'none';
            }
        },
        
        // Update meta theme-color for mobile browsers
        updateMetaThemeColor: function() {
            let metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (!metaThemeColor) {
                metaThemeColor = document.createElement('meta');
                metaThemeColor.name = 'theme-color';
                document.head.appendChild(metaThemeColor);
            }
            
            const color = this.currentTheme === 'light' ? '#f8fafc' : '#0b0f19';
            metaThemeColor.content = color;
        },
        
        // Setup theme switcher button
        setupThemeSwitcher: function() {
            const themeSwitcher = document.getElementById('themeSwitcher');
            if (!themeSwitcher) {
                console.warn('Theme switcher button not found on this page');
                return;
            }
            
            // Remove existing listeners by cloning
            const newButton = themeSwitcher.cloneNode(true);
            themeSwitcher.parentNode.replaceChild(newButton, themeSwitcher);
            
            // Add click listener
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
            
            // Update icons
            this.updateButtonIcon();
        },
        
        // Watch for system theme changes
        watchSystemTheme: function() {
            const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            const handleChange = (e) => {
                // Only change if user hasn't manually set a preference
                if (!localStorage.getItem('mittely_theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light', true);
                }
            };
            
            // Modern browsers
            if (darkModeMediaQuery.addEventListener) {
                darkModeMediaQuery.addEventListener('change', handleChange);
            } 
            // Fallback for older browsers
            else if (darkModeMediaQuery.addListener) {
                darkModeMediaQuery.addListener(handleChange);
            }
        },
        
        // Get current theme
        getTheme: function() {
            return this.currentTheme;
        },
        
        // Check if light theme is active
        isLightTheme: function() {
            return this.currentTheme === 'light';
        },
        
        // Check if dark theme is active
        isDarkTheme: function() {
            return this.currentTheme === 'dark';
        }
    };
    
    // Make ThemeManager globally available
    window.ThemeManager = ThemeManager;
    window.toggleTheme = function() { return ThemeManager.toggleTheme(); };
    window.getCurrentTheme = function() { return ThemeManager.getTheme(); };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
    } else {
        ThemeManager.init();
    }
})();