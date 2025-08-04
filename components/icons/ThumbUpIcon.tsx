import React from 'react';

interface IconProps { className?: string; }

export const ThumbUpIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 18.734V11.5a2.5 2.5 0 012.5-2.5h1.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V21M3 11.5h4" />
    </svg>
);
