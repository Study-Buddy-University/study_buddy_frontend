import { useState } from 'react'
import { Bot, Copy, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SYSTEM_PROMPT_TEMPLATES, getCategoryLabel, type SystemPromptTemplate } from '@/lib/system-prompts'
import { toast } from 'sonner'

export function AgentsPage() {
  const [activeTab, setActiveTab] = useState<'learning' | 'subject' | 'tone'>('learning')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const learningTemplates = SYSTEM_PROMPT_TEMPLATES.filter(t => t.category === 'learning')
  const subjectTemplates = SYSTEM_PROMPT_TEMPLATES.filter(t => t.category === 'subject')
  const toneTemplates = SYSTEM_PROMPT_TEMPLATES.filter(t => t.category === 'tone')

  const handleCopy = async (template: SystemPromptTemplate) => {
    try {
      await navigator.clipboard.writeText(template.prompt)
      setCopiedId(template.id)
      toast.success('Prompt copied to clipboard!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Failed to copy prompt')
    }
  }

  const renderTemplateCard = (template: SystemPromptTemplate) => {
    const isCopied = copiedId === template.id
    
    return (
      <Card key={template.id} className="hover:shadow-lg transition-all">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{template.icon}</div>
              <div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="mt-1">
                  {template.description}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(template)}
              className="gap-2"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[120px] w-full rounded-md border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {template.prompt}
            </p>
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            AI Agents
          </h2>
          <p className="text-muted-foreground mt-2">
            Pre-configured AI personalities and teaching styles for your projects
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {SYSTEM_PROMPT_TEMPLATES.length} Agents Available
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'learning' | 'subject' | 'tone')} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="learning">
            Learning Styles
            <Badge variant="outline" className="ml-2">{learningTemplates.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="subject">
            Subject Experts
            <Badge variant="outline" className="ml-2">{subjectTemplates.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="tone">
            Tone & Style
            <Badge variant="outline" className="ml-2">{toneTemplates.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="learning" className="mt-6">
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{getCategoryLabel('learning')}</h3>
              <p className="text-sm text-muted-foreground">
                Different approaches to guide learning and problem-solving
              </p>
            </div>
            {learningTemplates.map(renderTemplateCard)}
          </div>
        </TabsContent>

        <TabsContent value="subject" className="mt-6">
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{getCategoryLabel('subject')}</h3>
              <p className="text-sm text-muted-foreground">
                Specialized tutors for specific subjects and skills
              </p>
            </div>
            {subjectTemplates.map(renderTemplateCard)}
          </div>
        </TabsContent>

        <TabsContent value="tone" className="mt-6">
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{getCategoryLabel('tone')}</h3>
              <p className="text-sm text-muted-foreground">
                Adjust the communication style and teaching approach
              </p>
            </div>
            {toneTemplates.map(renderTemplateCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
