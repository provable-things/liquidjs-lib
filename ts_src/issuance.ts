import { BufferWriter } from './bufferutils';
import { sha256 } from './crypto';
import * as bcrypto from './crypto';

export interface IssuanceContract {
  name: string;
  ticker: string;
  version: number;
  precision: number;
}

export interface OutPoint {
  txHash: string;
  vout: number;
}
// export function assetToHex

/**
 * Generate the entropy.
 * @param outPoint the prevout point used to compute the entropy.
 * @param contractHash the 32 bytes contract hash.
 */
export function generateEntropy(
  outPoint: OutPoint,
  contractHash: Buffer = Buffer.alloc(32),
): Buffer {
  if (outPoint.txHash.length !== 64) {
    throw new Error('Invalid txHash length');
  }

  const tBuffer: Buffer = Buffer.allocUnsafe(36);
  const s: BufferWriter = new BufferWriter(tBuffer, 0);
  s.writeSlice(Buffer.from(outPoint.txHash, 'hex').reverse());
  s.writeUInt32(outPoint.vout);

  return bcrypto.sha256(
    Buffer.concat([bcrypto.hash256(tBuffer), contractHash]),
  );
}

/**
 * calculate the asset tag from a given entropy.
 * @param entropy the entropy used to compute the asset tag.
 */
export function calculateAsset(entropy: Buffer): string {
  const kZero = Buffer.alloc(32);
  const assetBuffer = sha256(Buffer.concat([entropy, kZero]));
  const assetHex = assetBuffer.toString('hex');
  return assetHex;
}

/**
 * Compute the reissuance token.
 * @param entropy the entropy used to compute the reissuance token.
 * @param confidential true if confidential.
 */
export function calculateReissuanceToken(
  entropy: Buffer,
  confidential: boolean = false,
): Buffer {
  const k = confidential
    ? Buffer.from(
        '0000000000000000000000000000000000000000000000000000000000000002',
        'hex',
      )
    : Buffer.from(
        '0000000000000000000000000000000000000000000000000000000000000001',
        'hex',
      );

  return sha256(Buffer.concat([entropy, k]));
}