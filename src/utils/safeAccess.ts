/**
 * Utility functions for safe data access
 * Prevents crashes from undefined/null values
 */

export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  try {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }
    return result !== undefined && result !== null ? result : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function safeArray<T>(arr: any, defaultValue: T[] = []): T[] {
  return Array.isArray(arr) ? arr : defaultValue;
}

export function safeNumber(value: any, defaultValue: number = 0): number {
  const num = typeof value === 'number' ? value : Number(value);
  return isNaN(num) ? defaultValue : num;
}

export function safeString(value: any, defaultValue: string = ''): string {
  return value != null ? String(value) : defaultValue;
}








