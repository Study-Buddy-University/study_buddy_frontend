# Error Boundaries

React error boundaries to catch JavaScript errors anywhere in the component tree, log those errors, and display fallback UI.

## Components

### PageErrorBoundary
Use for page-level error handling. Shows a full-page error message with recovery options.

```tsx
import { PageErrorBoundary } from '@/components/error'

<PageErrorBoundary>
  <YourPage />
</PageErrorBoundary>
```

### ComponentErrorBoundary
Use for component-level error handling. Shows an inline error message.

```tsx
import { ComponentErrorBoundary } from '@/components/error'

// Component variant (default)
<ComponentErrorBoundary>
  <YourComponent />
</ComponentErrorBoundary>

// Form variant (better for forms)
<ComponentErrorBoundary variant="form">
  <YourForm />
</ComponentErrorBoundary>
```

### ErrorFallback
Customizable error UI component. Can be used standalone or with error boundaries.

```tsx
import { ErrorFallback } from '@/components/error'

<ErrorFallback 
  error={error} 
  resetError={() => retry()}
  variant="page" // or "component" or "form"
/>
```

## Usage Examples

### Protecting a Feature Section
```tsx
<ComponentErrorBoundary>
  <DocumentUploadForm />
</ComponentErrorBoundary>
```

### Protecting Chat Messages
```tsx
<ComponentErrorBoundary 
  fallback={<div>Could not load message</div>}
  onError={(error) => logToSentry(error)}
>
  <MessageList messages={messages} />
</ComponentErrorBoundary>
```

### Form Error Handling
```tsx
<ComponentErrorBoundary variant="form">
  <ProjectCreateForm />
</ComponentErrorBoundary>
```

## Features

- ✅ **3 Variants**: Page, Component, Form-specific error displays
- ✅ **Recovery**: "Try Again" button to reset error state
- ✅ **Navigation**: "Go Home" button on page errors
- ✅ **Error Logging**: Console logging with context
- ✅ **Custom Fallbacks**: Support for custom error UI
- ✅ **Callback Support**: `onError` prop for error tracking services

## Best Practices

1. **Wrap routes** at the router level (already done)
2. **Wrap risky components** like forms, data displays, third-party integrations
3. **Don't overuse** - Too many boundaries can hide errors
4. **Log errors** - Use the `onError` callback to send to monitoring services
5. **Provide context** - Show helpful error messages to users

## Integration with Error Tracking

```tsx
import * as Sentry from '@sentry/react'

<PageErrorBoundary 
  onError={(error, errorInfo) => {
    Sentry.captureException(error, {
      contexts: { react: errorInfo }
    })
  }}
>
  <YourPage />
</PageErrorBoundary>
```
