/**
 * Tool definitions for AI agents
 */

export interface Tool {
  id: string
  name: string
  description: string
  icon: string
  category: 'computation' | 'research' | 'analysis'
  enabled: boolean
}

export const AVAILABLE_TOOLS: Tool[] = [
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Perform mathematical calculations and solve equations. Supports basic arithmetic, exponents, and common math functions.',
    icon: '🔢',
    category: 'computation',
    enabled: true
  },
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Search the internet for current information using multiple search engines (Google, Bing, DuckDuckGo, Wikipedia, etc.).',
    icon: '🔍',
    category: 'research',
    enabled: true
  }
]

export function getToolById(id: string): Tool | undefined {
  return AVAILABLE_TOOLS.find(tool => tool.id === id)
}

export function getToolsByIds(ids: string[]): Tool[] {
  return ids.map(id => getToolById(id)).filter((tool): tool is Tool => tool !== undefined)
}

export function getToolsByCategory(category: Tool['category']): Tool[] {
  return AVAILABLE_TOOLS.filter(tool => tool.category === category)
}
