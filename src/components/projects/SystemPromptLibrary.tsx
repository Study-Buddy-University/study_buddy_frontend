import { useState } from 'react'
import { BookOpen, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { SYSTEM_PROMPT_TEMPLATES, type SystemPromptTemplate } from '@/lib/system-prompts'

interface SystemPromptLibraryProps {
  onSelect: (template: SystemPromptTemplate) => void
  selectedPrompt?: string
}

export function SystemPromptLibrary({ onSelect, selectedPrompt }: SystemPromptLibraryProps) {
  const [activeTab, setActiveTab] = useState<'learning' | 'subject' | 'tone'>('learning')
  
  const learningTemplates = SYSTEM_PROMPT_TEMPLATES.filter(t => t.category === 'learning')
  const subjectTemplates = SYSTEM_PROMPT_TEMPLATES.filter(t => t.category === 'subject')
  const toneTemplates = SYSTEM_PROMPT_TEMPLATES.filter(t => t.category === 'tone')

  const renderTemplateCard = (template: SystemPromptTemplate) => {
    const isSelected = selectedPrompt === template.prompt
    
    return (
      <Card
        key={template.id}
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'border-primary ring-2 ring-primary/20' : ''
        }`}
        onClick={() => onSelect(template)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{template.icon}</span>
              <div>
                <CardTitle className="text-sm">{template.name}</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {template.description}
                </CardDescription>
              </div>
            </div>
            {isSelected && (
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" />
                Selected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {template.prompt}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">AI Agent Library</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Choose an AI agent to assign to this project
      </p>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'learning' | 'subject' | 'tone')} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="learning" className="text-xs">Learning</TabsTrigger>
          <TabsTrigger value="subject" className="text-xs">Subjects</TabsTrigger>
          <TabsTrigger value="tone" className="text-xs">Tone</TabsTrigger>
        </TabsList>

        <TabsContent value="learning" className="mt-4">
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {learningTemplates.map(renderTemplateCard)}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="subject" className="mt-4">
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {subjectTemplates.map(renderTemplateCard)}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tone" className="mt-4">
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {toneTemplates.map(renderTemplateCard)}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onSelect({ 
            id: 'custom', 
            name: 'Custom', 
            category: 'learning',
            icon: '✨',
            description: 'Write your own prompt',
            prompt: '' 
          })}
        >
          ✨ Start with Blank Prompt
        </Button>
      </div>
    </div>
  )
}
