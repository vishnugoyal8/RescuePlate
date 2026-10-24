/**
 * RescuePlate Cryptographic Traceability Audit Chain (PS-43)
 * 
 * CORE PRINCIPLES:
 * 1. Local Demo Audit Trail: Deterministic SHA-256 hash chaining running in browser/node.
 * 2. Explicit Disclaimer: This is a local tamper-evident event log, NOT a deployed blockchain.
 *    Cryptographic hashes ensure record immutability, NOT food quality or physical truthfulness.
 * 3. Food safety checks are explicitly kept independent of hash validation.
 */

// Simple, self-contained deterministic SHA-256 implementation (synchronous fallback for Node & offline client)
function sha256Sync(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i, j; // Used as a counter
  let result = '';

  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  // Initial hash values: first 32 bits of the fractional parts of the square roots of the first 8 primes
  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let compositeClear = '\x80';
  while ((compositeClear[lengthProperty] + asciiBitLength / 8) % 64 !== 56) {
    compositeClear += '\x00';
  }

  const fullAscii = ascii + compositeClear;
  for (i = 0; i < fullAscii[lengthProperty]; i++) {
    j = fullAscii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }

  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const i2 = i + j;
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] =
        i < 16
          ? w[i]
          : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const s0_h = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const s1_h = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const temp1 = hash[7] + s1_h + ch + k[i] + w[i];
      const temp2 = s0_h + maj;

      hash = [
        (temp1 + temp2) | 0,
        hash[0],
        hash[1],
        hash[2],
        (hash[3] + temp1) | 0,
        hash[4],
        hash[5],
        hash[6]
      ];
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Computes deterministic SHA-256 hash of an event payload.
 */
export function computeEventHash(previousHash, eventType, timestamp, actorOrg, payload) {
  const serialized = JSON.stringify({
    previousHash: previousHash || GENESIS_HASH,
    eventType,
    timestamp,
    actorOrg,
    payload
  });
  return sha256Sync(serialized);
}

/**
 * Creates the initial Genesis event for a new food donation broadcast.
 */
export function createGenesisTraceEvent(donation) {
  const timestamp = donation.createdAt || new Date().toISOString();
  const actorOrg = donation.donorOrg || "Community Kitchen Partner";
  const payload = {
    donationId: donation.id,
    foodName: donation.foodName,
    category: donation.category,
    quantity: donation.quantity,
    unit: donation.unit,
    storageCondition: donation.storageCondition,
    collectionDeadline: donation.collectionDeadline,
    pickupAddress: donation.pickupAddress
  };

  const hash = computeEventHash(GENESIS_HASH, "Created", timestamp, actorOrg, payload);

  return {
    eventId: `EVT-${donation.id}-01`,
    donationId: donation.id,
    type: "Created",
    actorOrg,
    actorRole: "Food Donor",
    timestamp,
    payload,
    previousHash: GENESIS_HASH,
    hash,
    signatureLabel: "Donor Digital Dispatch Logged"
  };
}

/**
 * Appends a new timestamped event block to an existing traceability chain.
 */
export function appendTraceEvent(chain, eventType, actorOrg, actorRole, payload = {}, customTimestamp = null) {
  const prevEvent = chain && chain.length > 0 ? chain[chain.length - 1] : null;
  const previousHash = prevEvent ? prevEvent.hash : GENESIS_HASH;
  const timestamp = customTimestamp || new Date().toISOString();
  const donationId = prevEvent ? prevEvent.donationId : payload.donationId || "DON-UNKNOWN";

  const eventIndex = (chain ? chain.length : 0) + 1;
  const eventId = `EVT-${donationId}-${String(eventIndex).padStart(2, '0')}`;

  const hash = computeEventHash(previousHash, eventType, timestamp, actorOrg, payload);

  const newEvent = {
    eventId,
    donationId,
    type: eventType,
    actorOrg,
    actorRole: actorRole || "System",
    timestamp,
    payload,
    previousHash,
    hash,
    signatureLabel: `${actorRole} Handshake Verified`
  };

  return [...(chain || []), newEvent];
}

/**
 * Validates the cryptographic integrity of a traceability chain.
 * Checks:
 * 1. Genesis block references GENESIS_HASH
 * 2. Each subsequent block's previousHash exactly equals the preceding block's current hash
 * 3. Recomputed hash matches the stored hash
 * 
 * @param {Array} chain - List of chronological event blocks
 * @returns {{ isValid: boolean, brokenIndex?: number, error?: string }}
 */
export function verifyTraceabilityChain(chain) {
  if (!Array.isArray(chain) || chain.length === 0) {
    return { isValid: false, error: "Traceability chain is empty." };
  }

  for (let i = 0; i < chain.length; i++) {
    const current = chain[i];

    // Check genesis block
    if (i === 0) {
      if (current.previousHash !== GENESIS_HASH) {
        return {
          isValid: false,
          brokenIndex: 0,
          error: `Genesis block previousHash must equal GENESIS_HASH, found: ${current.previousHash}`
        };
      }
    } else {
      const prev = chain[i - 1];
      if (current.previousHash !== prev.hash) {
        return {
          isValid: false,
          brokenIndex: i,
          error: `Block #${i + 1} (${current.type}) previousHash does not match Block #${i} hash.`
        };
      }
    }

    // Recompute current block hash
    const expectedHash = computeEventHash(
      current.previousHash,
      current.type,
      current.timestamp,
      current.actorOrg,
      current.payload
    );

    if (current.hash !== expectedHash) {
      return {
        isValid: false,
        brokenIndex: i,
        error: `Block #${i + 1} (${current.type}) payload has been tampered with. Stored: ${current.hash}, Computed: ${expectedHash}`
      };
    }
  }

  return { isValid: true };
}
