/**
 * Concatenates Uint8Array chunks into a single contiguous Uint8Array.
 */
export function mergeUint8Chunks(chunks: Uint8Array[], totalLength: number): Uint8Array {
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return merged;
}
