import { useRef, useId } from 'react'
import { Copy, Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useCodeActions } from '@/hooks/useCodeActions'

interface CodeBlockProps {
  inline?: boolean
  className?: string
  children?: React.ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

/**
 * Enhanced code block component with copy and download functionality
 */
export function CodeBlock({ inline, className, children, node, ...props }: CodeBlockProps) {
  const { copyToClipboard, downloadCode, getLanguageDisplayName, copiedStates } = useCodeActions()
  
  // Generate stable unique ID for this code block instance
  const blockId = useId()
  
  // Ref to extract text content from rendered DOM
  const codeRef = useRef<HTMLElement>(null)

  // Extract language from className (e.g., "language-python" -> "python")
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : 'text'
  
  const isCopied = copiedStates[blockId] || false
  
  // Extract code text - try multiple sources
  const getCodeText = (): string => {
    // Try getting raw text from ReactMarkdown node
    if (node && node.children && node.children[0]?.value) {
      return node.children[0].value
    }
    
    // Try DOM textContent
    if (codeRef.current?.textContent) {
      return codeRef.current.textContent
    }
    
    // Fallback: if children is string
    if (typeof children === 'string') {
      return children
    }
    
    return ''
  }

  // Inline code - simple styling
  if (inline) {
    return (
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono" {...props}>
        {children}
      </code>
    )
  }

  // Code block with header and actions
  const languageDisplay = getLanguageDisplayName(language)

  return (
    <div className="group relative rounded-lg border bg-muted/50 my-4 overflow-hidden">
      {/* Header with language label and action buttons */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <span className="text-xs font-mono text-muted-foreground font-semibold">
          {languageDisplay}
        </span>
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => copyToClipboard(getCodeText(), blockId)}
                  aria-label="Copy code to clipboard"
                >
                  {isCopied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{isCopied ? 'Copied!' : 'Copy code'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => downloadCode(getCodeText(), language)}
                  aria-label={`Download code as ${language} file`}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Download as file</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Code content */}
      <pre className="overflow-x-auto p-4 m-0">
        <code ref={codeRef} className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  )
}
