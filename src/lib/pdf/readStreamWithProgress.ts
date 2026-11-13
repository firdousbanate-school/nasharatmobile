import { mergeUint8Chunks } from "./mergeUint8Chunks";

/**
 * Reads a Fetch Response into a Uint8Array while reporting download progress (0-100).
 */
export async function readStreamWithProgress(
  response: Response,
  onProgress?: (percent: number) => void,
): Promise<Uint8Array> {
  const totalBytes = Number(response.headers.get("content-length") ?? 0);
  const notify = onProgress ?? (() => {});
  const reader = response.body?.getReader();

  if (!reader) {
    const buffer = await response.arrayBuffer();
    notify(100);
    return new Uint8Array(buffer);
  }

  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const step = await reader.read();
    if (step.done) break;
    if (!step.value) continue;
    chunks.push(step.value);
    received += step.value.byteLength;
    if (totalBytes > 0) {
      notify(Math.min(99, Math.round((received / totalBytes) * 100)));
    }
  }

  notify(100);
  return mergeUint8Chunks(chunks, received);
}
