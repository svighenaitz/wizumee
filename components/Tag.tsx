import React from 'react';
import { FiDelete } from "react-icons/fi";

interface TagProps extends React.ComponentPropsWithoutRef<"div"> {
    label: string
    onRemove: () => void
}

const Tag: React.FC<TagProps> = ({ label, onRemove }) => {
    return (
        <div className="flex p-1">
            {label}
            <span className="p-1" onClick={onRemove}>
                <FiDelete />
            </span>            
        </div>
    );
}

export default Tag