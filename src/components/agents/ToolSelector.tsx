import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AVAILABLE_TOOLS, type Tool } from '@/lib/tools'

interface ToolSelectorProps {
  selectedTools: string[]
  onToolToggle: (toolId: string) => void
}

export function ToolSelector({ selectedTools, onToolToggle }: ToolSelectorProps) {
  const isToolSelected = (toolId: string) => selectedTools.includes(toolId)

  const renderTool = (tool: Tool) => (
    <div key={tool.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <Checkbox
        id={tool.id}
        checked={isToolSelected(tool.id)}
        onCheckedChange={() => onToolToggle(tool.id)}
        className="mt-1"
      />
      <div className="flex-1">
        <Label
          htmlFor={tool.id}
          className="flex items-center gap-2 cursor-pointer font-medium"
        >
          <span className="text-xl">{tool.icon}</span>
          {tool.name}
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          {tool.description}
        </p>
      </div>
    </div>
  )

  const computationTools = AVAILABLE_TOOLS.filter(t => t.category === 'computation')
  const researchTools = AVAILABLE_TOOLS.filter(t => t.category === 'research')
  const analysisTools = AVAILABLE_TOOLS.filter(t => t.category === 'analysis')

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Available Tools</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Select which tools this agent can use to assist with tasks
        </p>
      </div>

      {computationTools.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Computation</CardTitle>
            <CardDescription className="text-xs">
              Tools for mathematical and logical operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {computationTools.map(renderTool)}
          </CardContent>
        </Card>
      )}

      {researchTools.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Research</CardTitle>
            <CardDescription className="text-xs">
              Tools for finding and retrieving information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {researchTools.map(renderTool)}
          </CardContent>
        </Card>
      )}

      {analysisTools.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Analysis</CardTitle>
            <CardDescription className="text-xs">
              Tools for analyzing data and content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysisTools.map(renderTool)}
          </CardContent>
        </Card>
      )}

      {selectedTools.length === 0 && (
        <div className="text-center p-4 text-sm text-muted-foreground border border-dashed rounded-lg">
          No tools selected. Agent will work with natural language only.
        </div>
      )}
    </div>
  )
}
