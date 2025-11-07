// components/AddApplicationForm/MeteoriteLoader.tsx
'use client'

import React, { useState, useEffect } from 'react'

interface MeteoriteLoaderProps {
  message?: string
}

export default function MeteoriteLoader({ message = 'Processing...' }: MeteoriteLoaderProps) {
  const [particles, setParticles] = useState<any[]>([])

  useEffect(() => {
    const meteorites = [
      { id: 1, angle: 0, color: '#3b82f6', speed: 1 },
      { id: 2, angle: 120, color: '#8b5cf6', speed: 1 },
      { id: 3, angle: 240, color: '#ec4899', speed: 1 },
    ]

    const canvas = document.getElementById('meteorite-canvas') as HTMLCanvasElement
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 300
    canvas.height = 300
    const centerX = 150
    const centerY = 150
    const radius = 80

    let animationFrameId: number
    let time = 0

    const drawTrail = (x: number, y: number, color: string, opacity: number) => {
      ctx!.fillStyle = color.replace(')', `, ${opacity})`).replace('rgb', 'rgba')
      ctx!.beginPath()
      ctx!.arc(x, y, 3, 0, Math.PI * 2)
      ctx!.fill()
    }

    const animate = () => {
      ctx!.clearRect(0, 0, canvas.width, canvas.height)

      // Draw orbit circle
      ctx!.strokeStyle = 'rgba(59, 130, 246, 0.1)'
      ctx!.lineWidth = 1
      ctx!.beginPath()
      ctx!.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx!.stroke()

      // Draw center glow
      const gradient = ctx!.createRadialGradient(centerX, centerY, 0, centerX, centerY, 15)
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)')
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
      ctx!.fillStyle = gradient
      ctx!.fillRect(centerX - 15, centerY - 15, 30, 30)

      meteorites.forEach((meteor) => {
        const angle = (meteor.angle + time * meteor.speed) * (Math.PI / 180)
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)

        // Draw trail (multiple circles behind the meteorite)
        for (let i = 1; i <= 5; i++) {
          const trailAngle = (meteor.angle + time * meteor.speed - i * 8) * (Math.PI / 180)
          const trailX = centerX + radius * Math.cos(trailAngle)
          const trailY = centerY + radius * Math.sin(trailAngle)
          const trailOpacity = (1 - i / 5) * 0.6

          drawTrail(trailX, trailY, meteor.color, trailOpacity)
        }

        // Draw meteorite core
        ctx!.fillStyle = meteor.color
        ctx!.beginPath()
        ctx!.arc(x, y, 5, 0, Math.PI * 2)
        ctx!.fill()

        // Draw meteorite glow
        const meteorGradient = ctx!.createRadialGradient(x, y, 0, x, y, 10)
        meteorGradient.addColorStop(0, meteor.color.replace(')', ', 0.3)').replace('rgb', 'rgba'))
        meteorGradient.addColorStop(1, meteor.color.replace(')', ', 0)').replace('rgb', 'rgba'))
        ctx!.fillStyle = meteorGradient
        ctx!.fillRect(x - 10, y - 10, 20, 20)
      })

      time += 0.5
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24">
      <canvas
        id="meteorite-canvas"
        className="w-80 h-80 sm:w-96 sm:h-96 mb-6 drop-shadow-lg"
      />
      <p className="text-base sm:text-lg font-medium text-foreground text-center">
        {message}
      </p>
    </div>
  )
}