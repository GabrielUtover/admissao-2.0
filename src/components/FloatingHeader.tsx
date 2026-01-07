import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import { Button } from './ui/button'

interface FloatingHeaderProps {
  onSettingsClick: () => void
}

export function FloatingHeader({ onSettingsClick }: FloatingHeaderProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <header 
      className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-5xl px-4 md:px-6 lg:px-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`glass-header rounded-b-3xl overflow-hidden w-full origin-top transition-all duration-700 ${
          isHovered 
            ? 'header-expanded px-4 md:px-6 py-2.5 md:py-3' 
            : 'header-minimal px-4 md:px-6 py-1 bg-blue-300/50 border-blue-400/40'
        }`}
        style={{
          transformOrigin: 'top center',
        }}
      >
        <div className={`flex items-center justify-between gap-6 transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-60'
        }`}>
          {/* Logo */}
          <div className={`flex items-center gap-3 flex-shrink-0 transition-all duration-500 ${
            isHovered 
              ? 'opacity-100 scale-100 translate-x-0' 
              : 'opacity-0 scale-95 -translate-x-4 pointer-events-none'
          }`}>
            <img 
              src="/LOGO-UTOVER.svg" 
              alt="LOGO UTOVER" 
              className="h-8 md:h-10 w-auto transition-all duration-500"
            />
          </div>

          {/* Botões */}
          <div className={`flex items-center gap-3 transition-all duration-300 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}>
            <Button
              variant="outline"
              onClick={() => window.open('https://silafi.com.br', '_blank')}
              className="text-xs md:text-sm px-3 md:px-4"
            >
              Voltar
            </Button>
            <Button
              variant="outline"
              onClick={onSettingsClick}
              className="flex items-center justify-center p-1.5 md:p-2"
              size="icon"
            >
              <Settings2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
