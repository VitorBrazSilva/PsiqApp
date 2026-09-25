import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function BotaoTexto({ children, className = '', type = 'button', ...props }: Props) {
  return <button {...props} type={type} className={`text-button ${className}`.trim()}>{children}</button>
}
