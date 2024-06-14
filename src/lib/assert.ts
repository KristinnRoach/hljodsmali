export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    console.error(msg);
    throw new Error(msg);
  }
}
