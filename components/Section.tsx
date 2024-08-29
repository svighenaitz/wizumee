import React from 'react';

interface SectionProps {
    children: React.ReactNode
}

const Section: React.FC<SectionProps> = ({ children }) => {
    return (
        <div className='flex flex-wrap gap-4 mb-10'>
            {children}
        </div>
    );
}

export default Section