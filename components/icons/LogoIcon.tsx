import React from 'react';

export const LogoIcon: React.FC = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#2b63c0', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path d="M4 16.5L6 14.5L9 17.5L12 14.5L15 17.5L18 14.5L20 16.5" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 9.5L6 7.5L9 10.5L12 7.5L15 10.5L18 7.5L20 9.5" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
