// server/vector.js – Local Vector Database (FAISS) for Test Manuals
// This module provides semantic search over unstructured clinical guidelines
// and test manuals (AQT, WAIS, CVLT) to augment the LLM's report generation.

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import faiss from 'faiss-node';

let index = null;
let docs = []; // Array of { id: string, text: string }

const RESOURCES_DIR = path.join(process.cwd(), '..', 'resources');
const OLLAMA_URL = 'http://localhost:11434/api/embeddings';
const MODEL = 'llama3.2:8b'; // We use the same model for embeddings

// Initialize the FAISS index by reading text files from the resources directory
export async function initVectorStore() {
  console.log('📚 Initializing FAISS Vector Store...');
  
  if (!fs.existsSync(RESOURCES_DIR)) {
    fs.mkdirSync(RESOURCES_DIR, { recursive: true });
    console.log(`Created empty resources directory at ${RESOURCES_DIR}. Please add .txt manuals.`);
    return;
  }

  const files = fs.readdirSync(RESOURCES_DIR).filter(f => f.endsWith('.txt'));
  
  if (files.length === 0) {
    console.log('⚠️ No text manuals found in resources/ directory.');
    return;
  }

  const vectors = [];
  for (const file of files) {
    const text = fs.readFileSync(path.join(RESOURCES_DIR, file), 'utf8');
    
    try {
      const response = await axios.post(OLLAMA_URL, {
        model: MODEL,
        prompt: text // Use 'prompt' instead of 'input' depending on Ollama version, standard is 'prompt' for embeddings in some versions, but 'model', 'prompt' -> vector
      });
      
      const embedding = response.data.embedding;
      if (embedding) {
        vectors.push(embedding);
        docs.push({ id: file, text });
      }
    } catch (e) {
      console.error(`Failed to embed ${file}:`, e.message);
    }
  }

  if (vectors.length > 0) {
    const dimension = vectors[0].length;
    index = new faiss.IndexFlatL2(dimension);
    index.add(vectors);
    console.log(`✅ Indexed ${vectors.length} manuals into FAISS.`);
  }
}

// Perform a semantic search query against the test manuals
export async function search(query, k = 3) {
  if (!index) {
    console.log("Vector index not initialized or empty. Attempting init...");
    await initVectorStore();
    if (!index) return []; // Still empty
  }

  try {
    const response = await axios.post(OLLAMA_URL, {
      model: MODEL,
      prompt: query
    });
    
    const queryVector = response.data.embedding;
    const distances = new Float32Array(k);
    const indices = new Int32Array(k);
    
    index.search([queryVector], k, distances, indices);
    
    // Map FAISS indices back to our document objects
    return Array.from(indices)
      .filter(i => i >= 0 && i < docs.length)
      .map(i => docs[i]);
      
  } catch (e) {
    console.error('Search failed:', e.message);
    return [];
  }
}
