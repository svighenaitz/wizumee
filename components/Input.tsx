"use client"
import React from "react";
import { useFormContext } from "react-hook-form";

interface Props extends React.ComponentPropsWithoutRef<"input"> {
  label?: string
  setValue?: React.Dispatch<React.SetStateAction<string>>
  placeholder?: string
  name?: any
  as?: 'input' | 'textarea'
}

const Input = ({ label, setValue, placeholder, name, as = 'input', ...rest }: Props) => {
  const { register } = useFormContext();

  return (
    <div>
      <p>{label}</p>
      {as === 'textarea' ? (
        <textarea
          className={rest.className}
          placeholder={placeholder}
          {...(name ? {...register(name)} : {})}
          {...rest}
        />
      ) : (
        <input
          className="rounded-md border-2 border-black p-[10px] font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none"
          type="text"
          aria-label={placeholder}
          placeholder={placeholder}
          {...(name ? {...register(name)} : {})}
          {...rest}
        />
      )}
    </div>
  )
}

export default Input