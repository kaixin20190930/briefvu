export type TargetResult = { blob: Blob; quality: number; reached: boolean };

export async function encodeToTarget(
  encode: (quality: number) => Promise<Blob>,
  targetBytes: number,
  attempts = 8,
): Promise<TargetResult> {
  if (!Number.isFinite(targetBytes) || targetBytes < 1000) throw new Error("Choose a target of at least 1 KB.");
  let low = 0.2;
  let high = 1;
  let bestUnder: TargetResult | null = null;
  let smallest: TargetResult | null = null;

  for (let index = 0; index < attempts; index++) {
    const quality = index === 0 ? high : index === 1 ? low : (low + high) / 2;
    const blob = await encode(quality);
    const candidate = { blob, quality, reached: blob.size <= targetBytes };
    if (!smallest || blob.size < smallest.blob.size) smallest = candidate;
    if (candidate.reached) {
      if (!bestUnder || quality > bestUnder.quality) bestUnder = candidate;
      low = quality;
    } else {
      high = quality;
    }
  }
  if (!smallest) throw new Error("The browser did not create an output image.");
  return bestUnder ?? { ...smallest, reached: false };
}
