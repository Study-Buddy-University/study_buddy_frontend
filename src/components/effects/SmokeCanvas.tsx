import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useColorTheme } from '@/hooks/useColorTheme'
import type { ColorTheme } from '@/lib/theme-context'

interface SmokeCanvasProps {
  className?: string
}

// Theme color mapping
const THEME_COLORS: Record<ColorTheme, THREE.Color> = {
  caffeine: new THREE.Color(0.7, 0.4, 0.2),      // Brown/coffee
  bubblegum: new THREE.Color(1.0, 0.4, 0.8),     // Pink
  candyland: new THREE.Color(1.0, 0.5, 0.9),     // Light pink
  catppuccin: new THREE.Color(0.8, 0.6, 0.9),    // Purple
  claude: new THREE.Color(0.8, 0.5, 0.4),        // Rust/orange
}

export function SmokeCanvas({ className = '' }: SmokeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationIdRef = useRef<number>(0)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  
  // Get current theme from context
  const { colorTheme } = useColorTheme()
  
  // Memoize theme color calculation
  const themeColor = useMemo(() => {
    const baseColor = THEME_COLORS[colorTheme] || THEME_COLORS.caffeine
    // Make it brighter for visibility
    return baseColor.clone().multiplyScalar(1.3)
  }, [colorTheme])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    // Setup scene
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
    })
    renderer.setSize(rect.width, rect.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Smoke shader material
    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: themeColor.clone() },
        uOpacity: { value: 0.7 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;

        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m;
          m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          vec2 uv = vUv;
          
          // Create flowing smoke effect
          float noise1 = snoise(vec2(uv.x * 3.0 + uTime * 0.1, uv.y * 2.0 + uTime * 0.05));
          float noise2 = snoise(vec2(uv.x * 2.0 - uTime * 0.08, uv.y * 3.0 + uTime * 0.06));
          float noise3 = snoise(vec2(uv.x * 4.0 + uTime * 0.12, uv.y * 1.5 - uTime * 0.04));
          
          // Combine noise layers for smoke
          float smoke = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2);
          smoke = smoothstep(-0.3, 0.8, smoke);
          
          // Add vertical gradient (stronger at top)
          float gradient = smoothstep(0.0, 1.0, uv.y);
          smoke *= gradient;
          
          // Color variation based on smoke density
          vec3 color = mix(uColor * 0.7, uColor * 1.3, smoke);
          
          // Output with alpha
          gl_FragColor = vec4(color, smoke * uOpacity);
        }
      `,
    })

    // Store material ref for updates
    materialRef.current = material
    
    // Create plane mesh
    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Animation loop
    let time = Math.random() * 100 // Random start time for variety
    let isRunning = true
    
    const animate = () => {
      if (!isRunning) return
      
      time += 0.016 // ~60fps
      material.uniforms.uTime.value = time
      
      renderer.render(scene, camera)
      animationIdRef.current = requestAnimationFrame(animate)
    }
    
    animate()

    // Handle resize
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect()
      renderer.setSize(rect.width, rect.height)
    }
    
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(canvas)

    // Cleanup
    return () => {
      isRunning = false
      resizeObserver.disconnect()
      cancelAnimationFrame(animationIdRef.current)
      renderer.dispose()
      material.dispose()
      geometry.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount - theme updates handled by separate effect below
  
  // Update material color when theme changes (React handles this automatically)
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor.value = themeColor.clone()
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
