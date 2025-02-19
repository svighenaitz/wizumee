import { useEffect, useRef, useState } from 'react'
import { FiPlus } from 'react-icons/fi'

type Props = {
  title: string
  children: React.ReactNode
}

export default function Accordion({ title, children }: Props) {
  const [showContent, setShowContent] = useState(false)
  const [contentHeight, setContentHeight] = useState('0px')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(`${contentRef.current.scrollHeight}px`)
    }
  }, [showContent, children])

  return (
    <div className="mb-5 rounded-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <button
        role="button"
        type='button'
        aria-expanded={showContent}
        style={{ borderBottom: showContent ? 'solid 2px' : '0px' }}
        className="flex w-full items-center justify-between rounded-[5px] border-black bg-[#bc95d4] p-5 font-bold"
        onClick={() => {
          setShowContent(!showContent)
        }}
      >
        {title}
        <FiPlus
          style={{ transform: `rotate(${showContent ? '45deg' : '0'})` }}
          className="ml-4 min-h-[24px] min-w-[24px] transition-transform ease-in-out"
        />
      </button>
      <div
        ref={contentRef}
        style={{ height: showContent ? `${contentHeight}` : '0' }}
        className="overflow-hidden rounded-[5px] bg-white font-bold transition-[height] ease-in-out"
      >
        <p className="p-5">{children}</p>
      </div>
    </div>
  )
}