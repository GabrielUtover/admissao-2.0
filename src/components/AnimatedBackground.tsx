import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Partículas sutis para fundo claro
    const particles: Array<{
      x: number
      y: number
      radius: number
      speedX: number
      speedY: number
      opacity: number
      color: string
    }> = []

    const particleCount = 25
    const colors = [
      'rgba(148, 163, 184, ', // slate-400
      'rgba(226, 232, 240, ', // slate-200
      'rgba(224, 231, 255, ', // indigo-100
      'rgba(199, 210, 254, ', // indigo-200
    ]

    // Criar partículas
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.12 + 0.03,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    // Animação
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        // Atualizar posição
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Rebater nas bordas
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1

        // Desenhar partícula
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = `${particle.color}${particle.opacity})`
        ctx.fill()

        // Conectar partículas próximas (muito sutil)
        particles.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 80) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `rgba(148, 163, 184, ${0.03 * (1 - distance / 80)})`
            ctx.lineWidth = 0.2
            ctx.stroke()
          }
        })
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

