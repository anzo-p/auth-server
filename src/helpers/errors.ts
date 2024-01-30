export function assertDefined<T>(value: T | undefined): T {
  if (typeof value === 'undefined') {
    throw new Error('Value is undefined');
  }
  return value;
}

export function handleError(err: any, context: string) {
  console.error(`Error in ${context}:`, err);
  throw err;
}
