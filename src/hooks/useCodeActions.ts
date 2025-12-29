import { useState } from 'react'
import { toast } from 'sonner'

/**
 * Hook for code block actions (copy and download)
 */
export function useCodeActions() {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  /**
   * Copy code to clipboard with fallback for older browsers
   */
  const copyToClipboard = async (code: string, id: string) => {
    try {
      // Modern Clipboard API
      await navigator.clipboard.writeText(code)
      toast.success('Code copied to clipboard')
      
      // Visual feedback
      setCopiedStates(prev => ({ ...prev, [id]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }))
      }, 2000)
    } catch {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = code
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        
        toast.success('Code copied to clipboard')
        setCopiedStates(prev => ({ ...prev, [id]: true }))
        setTimeout(() => {
          setCopiedStates(prev => ({ ...prev, [id]: false }))
        }, 2000)
      } catch (fallbackErr) {
        toast.error('Failed to copy code')
        console.error('Copy failed:', fallbackErr)
      }
    }
  }

  /**
   * Get file extension for a given language
   */
  const getExtensionForLanguage = (language: string): string => {
    const extensions: Record<string, string> = {
      'python': 'py',
      'py': 'py',
      'javascript': 'js',
      'js': 'js',
      'typescript': 'ts',
      'ts': 'ts',
      'jsx': 'jsx',
      'tsx': 'tsx',
      'java': 'java',
      'cpp': 'cpp',
      'c++': 'cpp',
      'c': 'c',
      'csharp': 'cs',
      'cs': 'cs',
      'go': 'go',
      'golang': 'go',
      'rust': 'rs',
      'rs': 'rs',
      'php': 'php',
      'ruby': 'rb',
      'rb': 'rb',
      'swift': 'swift',
      'kotlin': 'kt',
      'kt': 'kt',
      'bash': 'sh',
      'shell': 'sh',
      'sh': 'sh',
      'sql': 'sql',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'yaml': 'yml',
      'yml': 'yml',
      'xml': 'xml',
      'markdown': 'md',
      'md': 'md',
    }
    return extensions[language.toLowerCase()] || 'txt'
  }

  /**
   * Get display name for a language
   */
  const getLanguageDisplayName = (language: string): string => {
    const names: Record<string, string> = {
      'js': 'JavaScript',
      'javascript': 'JavaScript',
      'ts': 'TypeScript',
      'typescript': 'TypeScript',
      'py': 'Python',
      'python': 'Python',
      'jsx': 'React JSX',
      'tsx': 'React TSX',
      'java': 'Java',
      'cpp': 'C++',
      'c++': 'C++',
      'c': 'C',
      'csharp': 'C#',
      'cs': 'C#',
      'go': 'Go',
      'golang': 'Go',
      'rust': 'Rust',
      'rs': 'Rust',
      'php': 'PHP',
      'ruby': 'Ruby',
      'rb': 'Ruby',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'kt': 'Kotlin',
      'bash': 'Bash',
      'shell': 'Shell',
      'sh': 'Shell',
      'sql': 'SQL',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'sass': 'Sass',
      'json': 'JSON',
      'yaml': 'YAML',
      'yml': 'YAML',
      'xml': 'XML',
      'markdown': 'Markdown',
      'md': 'Markdown',
    }
    return names[language.toLowerCase()] || language.toUpperCase()
  }

  /**
   * Download code as a file
   */
  const downloadCode = (code: string, language: string) => {
    const extension = getExtensionForLanguage(language)
    const filename = `code-snippet-${Date.now()}.${extension}`
    
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
    
    toast.success(`Downloaded ${filename}`)
  }

  return {
    copyToClipboard,
    downloadCode,
    getLanguageDisplayName,
    copiedStates,
  }
}
