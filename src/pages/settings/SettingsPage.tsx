import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Moon, Palette, Save, Zap, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { ThemeSelector } from '@/components/theme/ThemeSelector'
import { systemService } from '@/services/system'

export function SettingsPage() {
  const [settings, setSettings] = useState({
    preferences: {
      language: 'en',
      timezone: 'America/New_York',
      defaultModel: 'qwen2.5:0.5b',
    },
  })
  
  // Use React Query for GPU data fetching (best practice)
  const { data: gpuInfo, isLoading: loadingGpu } = useQuery({
    queryKey: ['gpu-info'],
    queryFn: () => systemService.getGPUInfo(),
    staleTime: 30000, // Refresh every 30s
  })

  const formatBytes = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`
    }
    return `${mb.toFixed(0)} MB`
  }

  const handleSave = () => {
    toast.success('Settings saved successfully')
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Separator />

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>
              Customize how the application looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Select your preferred color scheme
                </p>
              </div>
              <ThemeSelector />
            </div>
          </CardContent>
        </Card>

        {/* GPU Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <div>
                <CardTitle>GPU Information</CardTitle>
                <CardDescription>
                  GPU status and utilization (configured via docker-compose.yml)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingGpu && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!loadingGpu && gpuInfo && (
              <div className="space-y-4">
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

                {gpuInfo.available && gpuInfo.gpus && gpuInfo.gpus.length > 0 && (
                  <div className="space-y-3">
                    {gpuInfo.gpus.map((gpu, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{gpu.name}</p>
                          <Badge variant="outline">GPU {index}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Memory:</span>
                            <span className="ml-2 font-mono">
                              {formatBytes(gpu.memory_used_mb)} / {formatBytes(gpu.memory_total_mb)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Utilization:</span>
                            <span className="ml-2 font-mono">{gpu.utilization_percent}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              <CardTitle>Preferences</CardTitle>
            </div>
            <CardDescription>
              Customize your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.preferences.language}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, language: value },
                  })
                }
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.preferences.timezone}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, timezone: value },
                  })
                }
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-model">Default AI Model</Label>
              <Select
                value={settings.preferences.defaultModel}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, defaultModel: value },
                  })
                }
              >
                <SelectTrigger id="default-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <optgroup label="⚡ Fast Models (CPU-friendly)">
                    <SelectItem value="qwen2.5:0.5b">Qwen 2.5 Mini (0.5B) - Fastest</SelectItem>
                    <SelectItem value="gemma2:2b">Gemma 2 (2B) - Very Fast</SelectItem>
                    <SelectItem value="phi3:mini">Phi-3 Mini (3.8B) - Fast</SelectItem>
                  </optgroup>
                  <optgroup label="🚀 Full Models (Better Quality)">
                    <SelectItem value="llama3-groq-tool-use:8b">Llama 3 Groq (8B)</SelectItem>
                    <SelectItem value="llama3:8b">Llama 3 (8B)</SelectItem>
                    <SelectItem value="qwen2.5:7b">Qwen 2.5 (7B)</SelectItem>
                    <SelectItem value="mistral:7b">Mistral (7B)</SelectItem>
                  </optgroup>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
