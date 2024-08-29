import React from 'react'

function TagHolder({tags}: {tags: string[]}) {
  return <div>
    {tags.map((tag, index) => (
      <div key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 inline-block whitespace-normal break-words">
        {tag}
      </div>
    ))}    
  </div>
}

export default TagHolder