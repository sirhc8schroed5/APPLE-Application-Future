# Apple App Store Review Notes: Neuropsych Dashboard ("HermSchrod Box")

## Overview
This application is a highly specialized clinical tool designed for neuropsychological assessment. Due to the sensitive nature of Protected Health Information (PHI), the application architecture has been engineered for maximum privacy and security.

## 1. 100% Offline Operation (Zero Network Egress)
- **Local Inference:** The application utilizes embedded AI models (Large Language Models, Vision Transformers, and Audio Encoders) that run entirely on the local device's Apple Silicon (Metal API). 
- **No Cloud APIs:** At no point does the application transmit clinical data, audio, video, or diagnostic text to external servers, cloud providers, or third-party APIs. The network entitlements (`com.apple.security.network.client/server`) are required strictly to facilitate communication between the Electron UI renderer and the locally bundled Node.js/Express backend server running on `localhost`.

## 2. Multimodal Biomarker Extraction (Camera & Microphone Usage)
- The application requests access to the Camera and Microphone to perform real-time, local biomarker extraction.
- **Audio:** Used by the local Speech Fingerprinting module to extract latent prosody and rhythm features for neurological assessment. Audio is processed in memory and never saved to disk or transmitted.
- **Video:** Used by the local Vision Heatmap module to track facial micro-expressions and motor praxis. Video frames are processed in memory and never saved or transmitted.

## 3. Zero-Knowledge Blockchain Audit Ledger
- **Immutable Integrity:** The application maintains a cryptographically secure, SQLite-backed local blockchain ledger.
- **Privacy:** Every clinical inference is hashed using SHA-256 (a zero-knowledge proof approach). This provides the clinician with an immutable audit trail of the diagnostic process (crucial for medical-legal compliance) without exposing the underlying raw PHI data outside the secure application sandbox.

## 4. Hardware Requirements
- This application requires a Mac with Apple Silicon (M1 or newer, optimized for M4) due to the heavy reliance on the Neural Engine and Metal framework for local machine learning inference.
