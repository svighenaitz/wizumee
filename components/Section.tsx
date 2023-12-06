import React from 'react';

interface SectionProps {
    children: React.ReactNode
}

const Section: React.FC<SectionProps> = ({ children }) => {
    return (
        <div className='grid gap-4 grid-cols-3 pb-10'>
            {children}
        </div>
    );
}

export default Section