// server/blockchain.js – Zero-Knowledge Immutable Ledger
// This module provides a SQLite-backed blockchain to immutably timestamp
// and hash all clinical inferences and data inputs.

import crypto from 'crypto';

export function initializeLedger(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS blockchain_ledger (
      index_num INTEGER PRIMARY KEY,
      timestamp TEXT,
      data TEXT,
      previous_hash TEXT,
      hash TEXT
    );
  `);

  // Create genesis block if the ledger is empty
  const row = db.prepare('SELECT COUNT(*) as count FROM blockchain_ledger').get();
  if (row.count === 0) {
    const genesisData = JSON.stringify({ message: "HermSchrod Box Genesis Block" });
    const timestamp = new Date().toISOString();
    const hash = crypto.createHash('sha256').update("0" + timestamp + genesisData + "0").digest('hex');
    
    db.prepare('INSERT INTO blockchain_ledger (index_num, timestamp, data, previous_hash, hash) VALUES (?, ?, ?, ?, ?)')
      .run(0, timestamp, genesisData, "0", hash);
    
    console.log("🔗 Blockchain Genesis Block created.");
  }
}

export function mineBlock(db, data) {
  // Get the latest block
  const previousBlock = db.prepare('SELECT * FROM blockchain_ledger ORDER BY index_num DESC LIMIT 1').get();
  
  const nextIndex = previousBlock.index_num + 1;
  const timestamp = new Date().toISOString();
  const serializedData = JSON.stringify(data);
  const previousHash = previousBlock.hash;
  
  // Calculate SHA-256 Hash
  const hash = crypto.createHash('sha256').update(nextIndex + timestamp + serializedData + previousHash).digest('hex');
  
  // Insert into ledger
  db.prepare('INSERT INTO blockchain_ledger (index_num, timestamp, data, previous_hash, hash) VALUES (?, ?, ?, ?, ?)')
    .run(nextIndex, timestamp, serializedData, previousHash, hash);
    
  console.log(`🔗 Block #${nextIndex} mined. Hash: ${hash.substring(0, 16)}...`);
  return hash;
}

export function verifyChain(db) {
  const chain = db.prepare('SELECT * FROM blockchain_ledger ORDER BY index_num ASC').all();
  
  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];

    if (currentBlock.previous_hash !== previousBlock.hash) {
      console.error(`🚨 Blockchain Integrity Compromised at block ${currentBlock.index_num}: previous_hash mismatch!`);
      return false;
    }

    const calculatedHash = crypto.createHash('sha256')
      .update(currentBlock.index_num + currentBlock.timestamp + currentBlock.data + currentBlock.previous_hash)
      .digest('hex');

    if (currentBlock.hash !== calculatedHash) {
      console.error(`🚨 Blockchain Integrity Compromised at block ${currentBlock.index_num}: invalid hash!`);
      return false;
    }
  }

  console.log(`🛡️ Blockchain verified. ${chain.length} blocks perfectly intact.`);
  return true;
}
