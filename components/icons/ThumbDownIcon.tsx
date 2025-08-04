import React from 'react';

interface IconProps { className?: string; }

export const ThumbDownIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.738 3h4.017c.163 0 .326.02.485.06L17 5.266V12.5a2.5 2.5 0 01-2.5 2.5h-1.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 12.5V3M21 12.5h-4" />
    </svg>
);
