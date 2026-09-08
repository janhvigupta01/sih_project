// Client-side SHA-256 hash generator using Web Crypto API
export const calculateSHA256 = async (inputString) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(inputString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generate verifiable handover tamper-proof checksum
export const generateHandoverHash = async ({ batchId, collectorId, recyclerId, weightKg, timestamp, lat, lng }) => {
  const payload = `${batchId}|${collectorId}|${recyclerId}|${weightKg}|${timestamp}|${lat},${lng}`;
  return await calculateSHA256(payload);
};
