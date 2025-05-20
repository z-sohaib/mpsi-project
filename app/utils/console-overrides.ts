// This file overrides the console.error method to silence certain extension-related warnings

// Store original console methods
const originalConsoleError = console.error;

// Override console.error to filter out extension-related warnings
console.error = function (...args: unknown[]) {
  // Check if this is an extension resource warning
  const isExtensionWarning = args.some(
    (arg) =>
      typeof arg === 'string' &&
      (arg.includes('chrome-extension://') ||
        arg.includes('web_accessible_resources')),
  );

  // Only log if it's not an extension warning
  if (!isExtensionWarning) {
    originalConsoleError.apply(console, args);
  }
};
