import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorFallbackProps {
  error: Error
  resetError?: () => void
  variant?: 'page' | 'component' | 'form'
}

export function ErrorFallback({ error, resetError, variant = 'component' }: ErrorFallbackProps) {
  const isPageLevel = variant === 'page'
  const isFormLevel = variant === 'form'

  if (isPageLevel) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Something went wrong</CardTitle>
            </div>
            <CardDescription>
              We encountered an error while loading this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-mono text-muted-foreground break-all">
                {error.message}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            {resetError && (
              <Button onClick={resetError} variant="outline">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button onClick={() => window.location.href = '/'}>
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (isFormLevel) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-destructive">Error</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            {resetError && (
              <Button onClick={resetError} size="sm" variant="outline">
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-muted/50 p-6">
      <div className="flex flex-col items-center text-center space-y-3">
        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
        <div>
          <h3 className="font-medium text-sm">Component Error</h3>
          <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
        </div>
        {resetError && (
          <Button onClick={resetError} size="sm" variant="ghost">
            <RefreshCcw className="mr-2 h-3 w-3" />
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}
