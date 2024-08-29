import React from 'react';
import { FiDelete } from "react-icons/fi";

interface TagProps extends React.ComponentPropsWithoutRef<"div"> {
    label: string
    onRemove: (label: string) => void
}

const Tag: React.FC<TagProps> = ({ label, onRemove }) => {
    return (
        <div className="inline-flex p-1">
            <span>{label}</span>
            <span className="p-1" onClick={()=>onRemove(label)}>
                <FiDelete />
            </span>            
        </div>
    );
}

export default Tag