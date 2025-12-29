import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { systemService } from '@/services/system'
import { Loader2, AlertCircle, CheckCircle2, Zap } from 'lucide-react'

export default function GPUSettings() {
  const { data: gpuInfo, error, isLoading, refetch } = useQuery({
    queryKey: ['gpu-info'],
    queryFn: async () => {
      const info = await systemService.getGPUInfo()
      return info
    },
  })

  const [gpuEnabled, setGpuEnabled] = useState(() => {
    const saved = localStorage.getItem('use_gpu')
    return saved === 'true'
  })

  const handleGPUToggle = (enabled: boolean) => {
    setGpuEnabled(enabled)
    localStorage.setItem('use_gpu', enabled.toString())
  }

  const formatBytes = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`
    }
    return `${mb.toFixed(0)} MB`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">GPU Settings</h2>
        <p className="text-muted-foreground">
          Manage GPU acceleration for AI models
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                GPU Acceleration
              </CardTitle>
              <CardDescription>
                Enable GPU acceleration for faster model inference
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="gpu-enabled"
                checked={gpuEnabled}
                onCheckedChange={handleGPUToggle}
                disabled={!gpuInfo?.available}
              />
              <Label htmlFor="gpu-enabled">
                {gpuEnabled ? 'Enabled' : 'Disabled'}
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span>Failed to load GPU information</span>
              <Button variant="ghost" size="sm" onClick={() => refetch()} className="ml-auto">
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !error && gpuInfo && (
            <div className="space-y-4">
              {/* GPU Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {gpuInfo.available ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">
                      {gpuInfo.available ? 'GPU Available' : 'No GPU Detected'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {gpuInfo.available
                        ? `${gpuInfo.gpu_count} GPU${gpuInfo.gpu_count > 1 ? 's' : ''} detected`
                        : gpuInfo.message || 'Running on CPU'}
                    </p>
                  </div>
                </div>
                <Badge variant={gpuInfo.available ? 'default' : 'secondary'}>
                  {gpuInfo.available ? 'Ready' : 'CPU Only'}
                </Badge>
              </div>

              {/* Driver Info */}
              {gpuInfo.available && gpuInfo.driver_version && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Driver Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">NVIDIA Driver:</span>
                        <span className="ml-2 font-mono">{gpuInfo.driver_version}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* GPU Details */}
              {gpuInfo.available && gpuInfo.gpus && gpuInfo.gpus.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium">GPU Details</h4>
                    {gpuInfo.gpus.map((gpu, index) => (
                      <Card key={index} className="border-2">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{gpu.name}</CardTitle>
                            <Badge variant="outline">GPU {index}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Memory Usage */}
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Memory Usage</span>
                              <span className="font-mono">
                                {formatBytes(gpu.memory_used_mb)} / {formatBytes(gpu.memory_total_mb)}
                              </span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{
                                  width: `${(gpu.memory_used_mb / gpu.memory_total_mb) * 100}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* GPU Utilization */}
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">GPU Utilization</span>
                              <span className="font-mono">{gpu.utilization_percent}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${gpu.utilization_percent}%` }}
                              />
                            </div>
                          </div>

                          {/* Available Memory */}
                          <div className="pt-2 border-t">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Available Memory</span>
                              <span className="font-mono text-green-600">
                                {formatBytes(gpu.memory_free_mb)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              {/* Info Box */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">ℹ️ GPU Acceleration Notes</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>GPU acceleration requires NVIDIA GPU with CUDA support</li>
                  <li>Ollama must be configured to use GPU (see docker-compose.yml)</li>
                  <li>Larger models benefit more from GPU acceleration</li>
                  <li>CPU-only mode works fine for smaller models (0.5B-3B)</li>
                </ul>
              </div>

              <Button onClick={() => refetch()} variant="outline" className="w-full">
                Refresh GPU Info
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
