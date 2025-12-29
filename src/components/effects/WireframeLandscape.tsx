import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useColorTheme } from '@/hooks/useColorTheme'
import type { ColorTheme } from '@/lib/theme-context'

interface WireframeLandscapeProps {
  className?: string
}

// Theme color mapping (lighter, more subtle versions)
const THEME_COLORS: Record<ColorTheme, THREE.Color> = {
  caffeine: new THREE.Color(0.7, 0.4, 0.2),
  bubblegum: new THREE.Color(1.0, 0.4, 0.8),
  candyland: new THREE.Color(1.0, 0.5, 0.9),
  catppuccin: new THREE.Color(0.8, 0.6, 0.9),
  claude: new THREE.Color(0.8, 0.5, 0.4),
}

// Procedural terrain generation - no image files needed

export function WireframeLandscape({ className = '' }: WireframeLandscapeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationIdRef = useRef<number>(0)
  const terrainRef = useRef<THREE.Mesh | null>(null)
  
  const { colorTheme } = useColorTheme()
  
  const themeColor = useMemo(() => {
    const baseColor = THEME_COLORS[colorTheme] || THEME_COLORS.caffeine
    return baseColor.clone()
  }, [colorTheme])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    // Setup scene
    const scene = new THREE.Scene()
    
    // Camera positioned elevated looking down at landscape (like reference images)
    const camera = new THREE.PerspectiveCamera(60, rect.width / rect.height, 0.1, 1000)  // Reduced FOV from 75 to 60 for less distortion
    camera.position.set(0, 50, 200)  // Higher and further back for better perspective
    camera.lookAt(0, 0, -150)  // Looking down toward distant terrain
    
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })
    renderer.setSize(rect.width, rect.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // High-resolution terrain for sharp jagged peaks
    const geometry = new THREE.PlaneGeometry(3000, 1200, 150, 100)
    geometry.rotateX(-Math.PI / 2)
    
    // Add lighting for depth
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(-10, 10, 10)
    scene.add(directionalLight)
    
    // Fog for depth
    scene.fog = new THREE.Fog(0x000000, 100, 300)
    
    // Animation state
    let isRunning = true
    let time = 0
    
    // Procedural terrain - flat foreground (1/3), mountains in back (2/3)
    const positions = geometry.attributes.position
    const valleyWidth = 0.2  // Center valley width
    const flatForegroundDepth = 0.33  // First 33% is completely flat
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getZ(i)
      
      // Normalize coordinates
      const normalizedX = (x / 3000 + 0.5)
      const normalizedZ = 1 - (z / 1200 + 0.5)  // Inverted: mountains grow toward -Z (camera direction)
      
      let height = 0
      
      // First 33% of depth is COMPLETELY FLAT (foreground open space)
      if (normalizedZ < flatForegroundDepth) {
        height = 0  // Flat foreground
      } else {
        // Mountains only in back 67%
        const distanceFromCenter = Math.abs(normalizedX - 0.5) * 2
        const depthIntoMountains = (normalizedZ - flatForegroundDepth) / (1 - flatForegroundDepth)
        
        // SMOOTH transition from valley to mountains (no hard edge)
        // Smoothstep function for gradual blend
        const valleyEdge = valleyWidth + 0.15  // Transition zone width
        let valleyBlend = 0
        
        if (distanceFromCenter < valleyWidth) {
          valleyBlend = 0  // Flat valley center
        } else if (distanceFromCenter < valleyEdge) {
          // Smooth gradient transition zone
          const t = (distanceFromCenter - valleyWidth) / (valleyEdge - valleyWidth)
          valleyBlend = t * t * (3 - 2 * t)  // Smoothstep
        } else {
          valleyBlend = 1  // Full mountains
        }
        
        // Only generate mountains if blend > 0
        if (valleyBlend > 0) {
          // Smaller heights to reduce stretching
          const baseHeight = 15
          const maxHeight = 120
          const depthCurve = Math.pow(depthIntoMountains, 2.0)
          const heightAtDepth = baseHeight + (maxHeight - baseHeight) * depthCurve
          
          // RIDGED NOISE for sharp jagged peaks
          const peakScale = 0.7 + depthIntoMountains * 1.5
          
          // Primary ridges - sharp peaks
          const ridge1 = 1 - Math.abs(Math.sin(normalizedX * 15 + normalizedZ * 4))
          const ridge2 = 1 - Math.abs(Math.sin(normalizedX * 28 - normalizedZ * 7))
          
          // Secondary detail ridges
          const ridge3 = 1 - Math.abs(Math.cos(normalizedX * 45 + normalizedZ * 11))
          
          // Combine ridges
          const ridgedNoise = (ridge1 * 0.6 + ridge2 * 0.3 + ridge3 * 0.1) * peakScale
          
          // Apply smooth valley blend to height
          height = heightAtDepth * valleyBlend * (0.3 + ridgedNoise * 1.5)
        }
      }
      
      positions.setY(i, Math.max(0, height))
    }
    
    positions.needsUpdate = true
    geometry.computeVertexNormals()
    
    // Create terrain with flat shading for angular low-poly look
    const material = new THREE.MeshStandardMaterial({
      color: themeColor,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
      emissive: themeColor,
      emissiveIntensity: 0.6,
      flatShading: true,
    })
    
    const terrain = new THREE.Mesh(geometry, material)
    terrain.position.set(0, 0, 0)
    scene.add(terrain)
    terrainRef.current = terrain
    
    console.log('🏔️ Procedural terrain generated:', {
      vertices: positions.count,
      valleyWidth: '25%',
      foregroundHills: '15 units',
      horizonMountains: '180 units',
      perspective: 'exponential (z^2.5)'
    })
    
    // Start animation loop
    const animate = () => {
      if (!isRunning) return
      
      time += 0.0005
      
      // Subtle rotation for dynamic effect
      if (terrainRef.current) {
        terrainRef.current.rotation.z = Math.sin(time) * 0.002
      }
      
      renderer.render(scene, camera)
      animationIdRef.current = requestAnimationFrame(animate)
    }
    
    animate()

    // Handle resize
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect()
      renderer.setSize(rect.width, rect.height)
      camera.aspect = rect.width / rect.height
      camera.updateProjectionMatrix()
    }
    
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(canvas)

    // Cleanup
    return () => {
      isRunning = false
      resizeObserver.disconnect()
      cancelAnimationFrame(animationIdRef.current)
      
      if (terrainRef.current) {
        const material = terrainRef.current.material as THREE.MeshStandardMaterial
        material.dispose()
        terrainRef.current.geometry.dispose()
      }
      
      renderer.dispose()
      geometry.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount - theme updates handled by separate effect below
  
  // Update material color when theme changes
  useEffect(() => {
    if (terrainRef.current) {
      const material = terrainRef.current.material as THREE.MeshStandardMaterial
      material.color.copy(themeColor)
      material.emissive.copy(themeColor)
      material.needsUpdate = true
    }
  }, [themeColor])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
