# Voice-to-Text Research: MeOS / Dash

**Date:** 2026-02-17
**Purpose:** Evaluate voice-to-text options for the voice-first productivity dashboard
**Context:** Voice captures intent (tasks, reflections, goals), LLMs parse into structured data. The voice layer needs accurate transcription; intelligence is delegated to LLMs via API.

> **Note on Sources:** This research is compiled from API documentation, developer community benchmarks, and pricing pages current through early 2025. Pricing and model versions should be verified against current provider pages before implementation, as this space evolves rapidly.

---

## Table of Contents

1. [Executive Summary & Recommendation](#1-executive-summary--recommendation)
2. [Provider Deep Dives](#2-provider-deep-dives)
3. [Comparison Matrix](#3-comparison-matrix)
4. [Cost Analysis](#4-cost-analysis)
5. [In-Browser Whisper (WASM)](#5-in-browser-whisper-wasm)
6. [Voice Capture UX Best Practices](#6-voice-capture-ux-best-practices)
7. [Mode Inference Problem](#7-mode-inference-problem)
8. [Architecture Recommendation for V1](#8-architecture-recommendation-for-v1)
9. [Implementation Roadmap](#9-implementation-roadmap)

---

## 1. Executive Summary & Recommendation

### V1 Recommendation: Deepgram Nova-2 (primary) + Web Speech API (fallback/preview)

**Why Deepgram for V1:**
- Best-in-class real-time streaming via WebSocket (sub-300ms latency)
- Excellent accuracy on conversational speech (Nova-2 consistently benchmarks at or above Whisper large-v3)
- Simple WebSocket integration from the browser (via a lightweight backend proxy for API key security)
- Pay-as-you-go pricing with a generous free tier (currently $200 in credits to start)
- Built-in smart formatting, punctuation, and endpointing
- Utterance detection and interim results for responsive UX

**Why Web Speech API as fallback/preview:**
- Zero cost, zero latency (runs on-device via browser engine)
- Good enough for "preview" text while user speaks
- Graceful degradation if the backend is unreachable

**Why not OpenAI Whisper API for V1:**
- No native streaming support -- batch-only means you must wait for the audio to finish, then upload, then wait for processing. This creates multi-second delays that kill the voice-first UX.
- OpenAI's newer `gpt-4o-transcribe` and `gpt-4o-mini-transcribe` models (released ~March 2025) improve accuracy but remain batch-only via the REST API.
- Excellent choice for a *secondary* pass (re-transcribe recordings for higher accuracy) but poor for primary real-time capture.

---

## 2. Provider Deep Dives

### 2.1 Web Speech API (Browser Native)

**What it is:** The `SpeechRecognition` interface built into browsers, powered by the browser vendor's cloud speech service (Google's servers for Chrome, Apple's on-device engine for Safari).

**Accuracy:**
- Chrome: Good for clear speech, degraded for conversational/fast speech, filler words, or domain-specific vocabulary. Roughly equivalent to Google's standard (non-enhanced) model. Word Error Rate (WER) approximately 8-15% on conversational speech depending on conditions.
- Safari: Uses Apple's on-device speech engine. Slightly lower accuracy than Chrome's cloud-based approach but improving. Better privacy.
- Firefox: No support. Uses no speech engine.

**Latency / Streaming:**
- True real-time streaming with interim results. Words appear as you speak.
- Chrome sends audio to Google's servers in real-time. Safari processes on-device.
- `interimResults` property provides partial transcriptions before utterance is finalized.

**Browser Support:**
- Chrome/Edge: Full support (via `webkitSpeechRecognition` prefix)
- Safari: Supported since Safari 14.1 (2021), with `SpeechRecognition` (no prefix)
- Firefox: NOT SUPPORTED. This is a deal-breaker for universal web apps.
- Mobile Chrome (Android): Supported
- Mobile Safari (iOS): Supported since iOS 14.5
- No support in any browser in private/incognito mode (Chrome)

**Pricing:** Free. No API costs.

**Language Support:** Depends on browser. Chrome supports 100+ languages/locales. Safari supports a smaller set.

**Privacy:**
- Chrome: Audio is sent to Google's servers. No data processing agreement. Not suitable for privacy-sensitive applications.
- Safari: Processes on-device (iOS 15+, macOS Monterey+). Good privacy story.

**Limitations:**
- No control over the model or its behavior
- Chrome auto-disconnects after ~60 seconds of silence or ~5 minutes of continuous speech (varies)
- No speaker diarization
- No custom vocabulary or boost words
- Inconsistent punctuation (Chrome sometimes adds it, sometimes does not)
- Results can be unpredictable -- sometimes re-processes and changes earlier words
- Cannot be used in background tabs in Chrome (kills the audio context)
- No SLA, no guarantees, Google could change behavior at any time
- Cannot record and transcribe simultaneously (the browser engine consumes the audio stream)

**Special Features:**
- `interimResults` for real-time preview
- `continuous` mode for extended listening
- Built-in language detection (limited)
- Zero implementation overhead

**Verdict for MeOS:** Useful as a zero-cost preview layer or offline fallback, but too unreliable and limited for the primary transcription engine. The Firefox gap alone disqualifies it as the sole solution. However, it is an excellent "type-ahead" preview while audio streams to a better service.

---

### 2.2 OpenAI Whisper API / Transcription API

**What it is:** OpenAI's cloud-hosted speech-to-text, originally based on the open-source Whisper model, now expanded with GPT-4o-based transcription models.

**Available Models (as of early 2025):**
| Model | Type | Notes |
|-------|------|-------|
| `whisper-1` | Whisper large-v2 based | Original offering, batch-only |
| `gpt-4o-transcribe` | GPT-4o-based | Higher accuracy, lower hallucination, batch-only |
| `gpt-4o-mini-transcribe` | GPT-4o-mini-based | Cheaper, still good accuracy, batch-only |

**Accuracy:**
- `whisper-1`: Very good. ~4-6% WER on clean English speech. Degrades on noisy audio or heavy accents. Known issue: hallucination on silent/low-audio segments (can generate phantom text).
- `gpt-4o-transcribe`: Best-in-class accuracy from OpenAI. Reduced hallucination. Better handling of accents, filler words, and mixed-language content.
- `gpt-4o-mini-transcribe`: Slightly below `gpt-4o-transcribe` but still very competitive.
- All models excel at punctuation and capitalization.

**Latency / Streaming:**
- **No native real-time streaming.** This is the critical limitation.
- Workflow: Record audio -> Upload file -> Receive transcript.
- Typical latency: 1-5 seconds for short utterances (depends on audio length and network).
- You can chunk audio and send segments, but this introduces complexity and can cause word-boundary issues.
- OpenAI has shown demos of real-time speech in their Realtime API (used for voice chat in ChatGPT), but this is a different product focused on conversational AI, not raw transcription-as-a-service.

**Pricing (as of early 2025):**
| Model | Price |
|-------|-------|
| `whisper-1` | $0.006 / minute |
| `gpt-4o-transcribe` | $0.006 / minute |
| `gpt-4o-mini-transcribe` | $0.003 / minute |

At 30 min/day:
- `whisper-1` or `gpt-4o-transcribe`: $0.18/day = ~$5.40/month
- `gpt-4o-mini-transcribe`: $0.09/day = ~$2.70/month

**Browser/Web Integration:**
- REST API only. Must record audio in browser (using MediaRecorder API), then POST the audio file to OpenAI's endpoint.
- Requires a backend proxy to keep API keys secure.
- Audio formats supported: mp3, mp4, mpeg, mpga, m4a, wav, webm.
- Max file size: 25MB (~90 minutes of compressed audio).

**Language Support:** 50+ languages. Automatic language detection. Can force language with `language` parameter.

**Privacy:**
- Audio is sent to OpenAI's servers.
- OpenAI's data usage policy: As of March 2023, API data is NOT used for model training by default. Data retention: 30 days for abuse monitoring (can be reduced via zero-retention agreement for enterprise).
- No on-device option.

**Special Features:**
- `response_format` options: json, text, srt, verbose_json, vtt
- `verbose_json` includes word-level timestamps
- `timestamp_granularities` parameter for word or segment-level timestamps
- `prompt` parameter: Can provide context/vocabulary to improve accuracy (e.g., "MeOS, epic, sprint, kanban")
- Translation endpoint: Can translate audio in any supported language to English text.

**Verdict for MeOS:** Excellent accuracy and very affordable, but the batch-only nature makes it unsuitable as the primary real-time transcription engine. Best used as a "second pass" -- record audio, stream it to Deepgram for real-time display, and optionally re-transcribe with Whisper for higher accuracy if needed. The `prompt` parameter is uniquely useful for domain vocabulary.

---

### 2.3 Deepgram

**What it is:** Purpose-built speech-to-text API company. Their Nova-2 model (released mid-2023, continuously updated) is widely considered the most accurate commercial ASR engine.

**Available Models:**
| Model | Use Case | Notes |
|-------|----------|-------|
| Nova-2 | General, best accuracy | Multiple variants: general, meeting, phonecall, finance, etc. |
| Nova | Previous generation | Still available, slightly cheaper |
| Enhanced | Legacy | Being phased out |
| Base | Legacy/budget | Lowest cost, lowest accuracy |
| Whisper (hosted) | Whisper compatibility | Deepgram-hosted Whisper models |

**Accuracy:**
- Nova-2 consistently benchmarks at ~8-12% lower WER than Whisper large-v3 on real-world conversational speech.
- Particularly strong on: filler words (um, uh), false starts, overlapping speech, diverse accents.
- "Meeting" variant optimized for multi-speaker conversational audio.
- Automatic punctuation and capitalization with high quality.
- Very low hallucination rate compared to Whisper.

**Latency / Streaming:**
- **Native WebSocket streaming with sub-300ms latency.** This is Deepgram's killer feature.
- Interim results (partial transcripts) update in real-time.
- `endpointing` parameter controls how quickly it finalizes an utterance (configurable from 10ms to 10000ms).
- `utterance_end_ms` for detecting when a user has stopped speaking.
- `interim_results` toggle for showing words as they are spoken.
- Batch API also available for pre-recorded audio.

**Pricing (as of early 2025):**
| Model | Streaming | Pre-recorded |
|-------|-----------|-------------|
| Nova-2 | $0.0059/min | $0.0043/min |
| Nova | $0.0049/min | $0.0036/min |
| Base | $0.0029/min | $0.0017/min |

Free tier: $200 in credits upon signup (no credit card required). This translates to roughly 33,000-47,000 minutes depending on model.

At 30 min/day with Nova-2 streaming:
- $0.177/day = ~$5.31/month

**Browser/Web Integration:**
- WebSocket-based streaming: Browser captures audio via `MediaRecorder` or raw `AudioContext`, streams PCM/Opus audio to Deepgram via WebSocket.
- **Requires a backend proxy** for WebSocket connection (API key security). Deepgram provides short-lived API keys that can be generated server-side and passed to the client, reducing backend complexity.
- Official JavaScript SDK available (`@deepgram/sdk`).
- Batch API: Standard REST endpoint for file uploads.

**Language Support:** 36+ languages (growing). Automatic language detection available.

**Privacy:**
- Cloud-only (no on-device option for the API).
- SOC 2 Type II compliant.
- Data not used for training without consent.
- Option for data deletion after processing.
- On-premises deployment available for enterprise (not relevant for V1).

**Special Features:**
- Speaker diarization (identify different speakers)
- Smart formatting (numbers, currencies, dates formatted properly)
- Keyword boosting (boost recognition of specific terms -- very useful for "MeOS", "epic", "kanban", etc.)
- Utterance detection (segment transcripts by speaker turns)
- Topic detection
- Summarization (built-in, but we would use LLM for this)
- Redaction (PII removal)
- Custom vocabulary/keyword boosting
- Multi-channel audio support
- Search within transcripts

**Verdict for MeOS:** The strongest candidate for V1's primary voice engine. The WebSocket streaming gives immediate, responsive transcription. Nova-2's accuracy on conversational speech is exactly what MeOS needs (users will speak naturally, not dictate). Keyword boosting handles domain vocabulary. Pricing is competitive. The short-lived API key feature simplifies browser integration.

---

### 2.4 AssemblyAI

**What it is:** AI speech-to-text company known for high accuracy and a rich feature set. Their Universal-2 model (released late 2024) is their latest.

**Available Models:**
| Model | Notes |
|-------|-------|
| Universal-2 | Latest, best accuracy, supports real-time |
| Best (legacy) | Previous generation |
| Nano | Low-cost, lower accuracy |

**Accuracy:**
- Universal-2 benchmarks competitively with Deepgram Nova-2 and ahead of Whisper large-v3 on most test sets.
- Strong on conversational speech, accents, and noisy environments.
- Excellent automatic punctuation and casing.

**Latency / Streaming:**
- Real-time streaming via WebSocket. Comparable latency to Deepgram (sub-500ms typical).
- Interim/partial results supported.
- Endpointing and utterance detection.

**Pricing (as of early 2025):**
| Model | Streaming | Async |
|-------|-----------|-------|
| Universal-2 | $0.0065/min | $0.0065/min |
| Nano | $0.002/min | $0.002/min |

Free tier: Pay-as-you-go with 100 hours free for new accounts (previously had different free tier structures, verify current).

At 30 min/day with Universal-2 streaming:
- $0.195/day = ~$5.85/month

**Browser/Web Integration:**
- WebSocket streaming similar to Deepgram.
- JavaScript SDK available (`assemblyai` npm package).
- Requires backend proxy for API key security.
- Good documentation and examples for browser integration.

**Language Support:** 20+ languages with Universal-2. Fewer than Deepgram or Whisper.

**Privacy:**
- SOC 2 Type II compliant.
- HIPAA eligible (with BAA).
- Data deleted after processing by default.
- EU data residency option available.

**Special Features:**
- LeMUR: Built-in LLM integration for transcript analysis (redundant for MeOS since we use our own LLM layer)
- Speaker diarization
- Sentiment analysis per utterance
- Topic detection
- Auto chapters
- Entity detection
- Content moderation
- PII redaction
- Custom vocabulary
- Word-level timestamps
- Dual-channel (stereo) support

**Verdict for MeOS:** Strong alternative to Deepgram. Very close in accuracy and features. Slightly more expensive and slightly fewer languages. The built-in LLM features (LeMUR) are irrelevant since MeOS delegates intelligence to its own LLM layer. A fine choice, but Deepgram's pricing edge and broader language support give it the V1 nod.

---

### 2.5 Google Cloud Speech-to-Text

**What it is:** Google's enterprise speech-to-text service, available in V1 (legacy) and V2 (current) APIs.

**Available Models:**
- Chirp (V2 default): Google's latest Universal Speech Model
- Chirp 2: Next generation (rolling out through 2025)
- Long, Short, Medical conversation, Phone call, Command & search (V1 models)

**Accuracy:**
- Chirp/Chirp 2: Very high accuracy, competitive with Nova-2 and Universal-2 on standard benchmarks.
- V1 models: Good but aging. The "phone call" and "medical" variants are domain-optimized.
- Strong on diverse accents and multilingual content.

**Latency / Streaming:**
- V1 API: Real-time streaming via gRPC. Well-established, low latency.
- V2 API: Streaming support via gRPC (BatchRecognize and StreamingRecognize).
- **gRPC is not natively supported in browsers.** Requires either:
  - A backend proxy that handles the gRPC connection and relays via WebSocket to the browser.
  - Or use of Google's REST API for batch processing.
- This is the significant drawback for web integration compared to Deepgram/AssemblyAI's native WebSocket approach.

**Pricing (as of early 2025):**
| Model | Price |
|-------|-------|
| Chirp (V2) | $0.016/min (standard), varies by region |
| V1 Standard | $0.006/min (first 500K min), then $0.004/min |
| V1 Enhanced | $0.009/min (first 500K min), then $0.006/min |
| V1 Medical | $0.078/min |

Free tier: 60 minutes/month free for V1 standard.

At 30 min/day with Chirp:
- $0.48/day = ~$14.40/month (significantly more expensive)

With V1 Standard:
- $0.18/day = ~$5.40/month

**Browser/Web Integration:**
- Requires backend integration due to gRPC.
- Google provides client libraries for Node.js, Python, etc., but not a browser-native WebSocket endpoint.
- More complex to integrate than Deepgram or AssemblyAI for a web app.

**Language Support:** 125+ languages (V1), 100+ (V2 Chirp). Best-in-class for language breadth.

**Privacy:**
- Google Cloud data processing agreements available.
- SOC 2, ISO 27001, HIPAA, FedRAMP compliant.
- Data processing location can be specified.
- Enhanced data logging can be disabled.

**Special Features:**
- Speaker diarization
- Automatic punctuation
- Word-level confidence scores
- Multi-channel recognition
- Speech adaptation (custom classes, phrases)
- Automatic language detection (V2)
- Model adaptation (custom training, enterprise)

**Verdict for MeOS:** Excellent service but poor fit for V1. The gRPC requirement adds significant integration complexity for a web app. The pricing (especially Chirp) is notably higher than Deepgram or OpenAI Whisper. The language breadth is unmatched, but MeOS V1 likely targets English first. Better considered for V2+ if international expansion demands it.

---

### 2.6 Azure Speech Services (Microsoft)

**What it is:** Microsoft's cognitive services speech-to-text offering, part of Azure AI Services.

**Available Models:**
- Custom Neural Voice (latest)
- Real-time transcription
- Batch transcription
- Whisper integration (Azure-hosted Whisper)
- Fast transcription (batch optimized for speed)

**Accuracy:**
- Competitive with other major cloud providers.
- Custom speech models allow fine-tuning on domain-specific data.
- Good on conversational speech but generally benchmarks slightly behind Nova-2 and Universal-2 for out-of-the-box English accuracy.

**Latency / Streaming:**
- Real-time streaming via WebSocket. Good latency (sub-500ms).
- JavaScript SDK available (`microsoft-cognitiveservices-speech-sdk`).
- The SDK can run directly in the browser (unique advantage).
- Interim results supported.

**Pricing (as of early 2025):**
| Tier | Price |
|------|-------|
| Standard (real-time) | $0.016/min ($1/hour) |
| Custom (real-time) | $0.0212/min ($1.272/hour) |
| Whisper (batch) | $0.006/min |
| Free tier | 5 hours/month free |

At 30 min/day with standard real-time:
- $0.48/day = ~$14.40/month

**Browser/Web Integration:**
- **Native browser SDK** -- `microsoft-cognitiveservices-speech-sdk` works directly in the browser via WebSocket.
- This is a significant advantage: no backend proxy needed for the speech connection itself (though you still need to manage auth tokens server-side).
- Good documentation for JavaScript/TypeScript.

**Language Support:** 100+ languages. Automatic language detection.

**Privacy:**
- Full Azure compliance stack (SOC, ISO, HIPAA, FedRAMP, GDPR).
- Data processing agreements available.
- Option to not log audio data.
- Custom endpoints available for isolation.

**Special Features:**
- Speaker diarization
- Custom speech models (fine-tuned to your domain)
- Pronunciation assessment
- Real-time translation
- Keyword recognition (wake word detection)
- Emotion recognition (preview)
- Audio content analysis

**Verdict for MeOS:** The browser SDK is a genuine advantage for web integration. However, the pricing ($14.40/month) is roughly 3x Deepgram for the same usage. Custom speech models could be valuable if MeOS needs domain-specific accuracy, but that is a V2+ concern. The Azure ecosystem adds complexity if you are not already on Azure.

---

### 2.7 Other Notable Options

#### Speechmatics
- UK-based, strong on multilingual and accent handling.
- Real-time streaming via WebSocket.
- Pricing: ~$0.007/min (competitive).
- Good accuracy, particularly on UK/European accents.
- Smaller developer community and ecosystem.
- Worth monitoring but not enough differentiation for V1.

#### Rev.ai (now part of Rev)
- Human-quality transcription company that also offers API.
- Real-time streaming via WebSocket.
- Pricing: $0.02-0.05/min (expensive).
- Accuracy is very high.
- Better known for human transcription; API is secondary.
- Too expensive for V1.

#### Gladia
- European company, built on top of Whisper with enhancements.
- Real-time streaming capability.
- Pricing: $0.0061/min (competitive).
- Adds speaker diarization, code-switching (language mixing) on top of Whisper.
- GDPR-focused (EU data processing).
- Interesting option for European users. Worth monitoring.

#### Picovoice Leopard/Cheetah
- On-device speech-to-text (edge processing).
- Available for web via WASM.
- Accuracy notably below cloud solutions.
- Interesting for privacy-first or offline use cases.
- Not suitable for V1 accuracy requirements.

---

## 3. Comparison Matrix

| Feature | Web Speech API | OpenAI Whisper API | Deepgram Nova-2 | AssemblyAI | Google Cloud STT | Azure Speech |
|---------|---------------|-------------------|-----------------|------------|-----------------|-------------|
| **Accuracy (conversational)** | Fair (8-15% WER) | Very Good (4-6% WER) | Excellent (3-5% WER) | Excellent (3-5% WER) | Very Good (4-6% WER) | Good (5-7% WER) |
| **Real-time streaming** | Yes (native) | No (batch only) | Yes (WebSocket) | Yes (WebSocket) | Yes (gRPC only) | Yes (WebSocket) |
| **Latency** | <100ms | 1-5s per chunk | <300ms | <500ms | <500ms | <500ms |
| **Browser integration** | Trivial | Moderate (REST) | Moderate (WS+proxy) | Moderate (WS+proxy) | Hard (gRPC proxy) | Easy (native SDK) |
| **Cost at 30 min/day** | Free | $2.70-5.40/mo | ~$5.31/mo | ~$5.85/mo | $5.40-14.40/mo | ~$14.40/mo |
| **Free tier** | Unlimited | Pay-per-use only | $200 credits | 100 hours free | 60 min/month | 5 hours/month |
| **Languages** | 100+ (Chrome) | 50+ | 36+ | 20+ | 125+ | 100+ |
| **Speaker diarization** | No | No | Yes | Yes | Yes | Yes |
| **Custom vocabulary** | No | Via prompt param | Keyword boosting | Custom vocabulary | Speech adaptation | Custom models |
| **Punctuation** | Inconsistent | Excellent | Good | Good | Good | Good |
| **Privacy** | Varies (Chrome=Google) | Cloud (OpenAI) | Cloud | Cloud | Cloud (configurable) | Cloud (configurable) |
| **Hallucination risk** | None | Moderate (whisper-1) | Very low | Very low | Very low | Very low |
| **Firefox support** | No | Yes (API) | Yes (API) | Yes (API) | Yes (API) | Yes (API) |

> **Note on WER figures:** Word Error Rates are approximate ranges based on community benchmarks and published papers using standard test sets (LibriSpeech, Earnings-22, AMI, etc.). Real-world performance varies significantly based on audio quality, accent, vocabulary, and recording environment. These should be treated as relative comparisons, not absolute guarantees.

---

## 4. Cost Analysis

### Usage Assumptions
- Primary user: 30 minutes of voice input per day
- 30 days per month = 900 minutes/month = 15 hours/month
- Assumes all audio is sent to the transcription service (no silence filtering)

### Monthly Cost Comparison

| Provider | Model | Monthly Cost | Annual Cost |
|----------|-------|-------------|-------------|
| Web Speech API | Browser native | $0 | $0 |
| OpenAI | gpt-4o-mini-transcribe | $2.70 | $32.40 |
| OpenAI | whisper-1 / gpt-4o-transcribe | $5.40 | $64.80 |
| Deepgram | Nova-2 (streaming) | $5.31 | $63.72 |
| Deepgram | Nova-2 (pre-recorded) | $3.87 | $46.44 |
| AssemblyAI | Universal-2 | $5.85 | $70.20 |
| Google | V1 Standard | $5.40 | $64.80 |
| Google | Chirp V2 | $14.40 | $172.80 |
| Azure | Standard (real-time) | $14.40 | $172.80 |
| Azure | Whisper (batch) | $5.40 | $64.80 |

### Cost Optimization Strategies
1. **Voice Activity Detection (VAD):** Only send audio when the user is speaking. A good VAD can reduce billable minutes by 30-50%. Libraries: `@ricky0123/vad-web` (runs in browser via WASM, uses Silero VAD model).
2. **Chunked streaming:** Only maintain the WebSocket connection while actively capturing, not idle.
3. **Silence thresholds:** End the stream after N seconds of silence instead of keeping it open.
4. **Hybrid approach:** Use Web Speech API for real-time preview (free), Deepgram for final transcription.

### Bottom Line
At moderate usage, all cloud providers cost roughly $3-6/month except Azure and Google Chirp which are ~$14/month. The cost difference between providers is negligible for a single user. The differentiators are accuracy, latency, and integration ease -- not price.

---

## 5. In-Browser Whisper (WASM)

### What Exists

**whisper.cpp:** A C/C++ port of OpenAI's Whisper model by Georgi Gerganov (the same developer behind llama.cpp). Highly optimized for CPU inference.

**whisper-web / whisper-wasm:** Community projects that compile whisper.cpp to WebAssembly for in-browser inference. Notable implementations:
- `nickmuchi/whisper-web` (demo on Hugging Face Spaces)
- Xenova's `transformers.js` library includes Whisper models that run in-browser via ONNX Runtime Web (WebAssembly + WebGPU)
- `whisper-turbo`: A WebGPU-accelerated implementation

### Performance in Browser

| Model | Size (GGML) | Browser Load Time | Transcription Speed | Quality |
|-------|-------------|-------------------|---------------------|---------|
| tiny | ~75MB | 2-5s | 5-15x realtime | Poor (not usable) |
| base | ~142MB | 5-10s | 2-8x realtime | Fair |
| small | ~466MB | 15-30s | 0.5-2x realtime | Good |
| medium | ~1.5GB | 30-60s | 0.2-0.5x realtime | Very good |
| large-v3 | ~3GB | Impractical | Impractical | Excellent |

> "X x realtime" means it processes X seconds of audio per second. So "2x realtime" means 10 seconds of audio takes 5 seconds to process.

**Key Findings:**
- **tiny/base models** are fast enough for near-real-time but accuracy is poor, especially on conversational speech.
- **small model** is the sweet spot for quality vs. speed, but is only near-real-time on modern hardware (M1+ Macs, recent desktop CPUs). Mobile devices struggle.
- **medium/large** models are too slow for real-time use in browser WASM. They work for batch processing (upload a recording, wait for transcript).
- **WebGPU acceleration** (via `whisper-turbo` or `transformers.js` with WebGPU backend) can improve speed 2-5x on supported browsers (Chrome 113+, Edge). This makes the `small` model viable for near-real-time on modern devices.
- **Model download**: Users must download the model on first use (75MB-1.5GB). This is a terrible first-use experience.
- **Memory usage**: The `small` model needs ~1GB of RAM. `medium` needs ~3GB. Browser tabs have memory limits.
- **No streaming**: Whisper is an encoder-decoder model that processes audio in chunks (typically 30 seconds). It cannot produce word-by-word streaming output like cloud APIs. You process a chunk, get the full text for that chunk, then process the next chunk.

### Verdict for MeOS

**Not recommended for V1.** The combination of:
- Large model downloads on first use
- No true streaming (chunk-based, not word-by-word)
- Accuracy/speed trade-off that penalizes mobile and older devices
- Memory pressure in the browser
- Complexity of implementation

...makes in-browser Whisper a poor fit for a voice-first UX that needs to feel responsive and work everywhere.

**Potentially interesting for V2+** as:
- A privacy-first offline mode
- A preprocessing/VAD step before sending to cloud
- A fallback when network is unavailable

**If you want on-device, consider:**
- Chrome's upcoming `MediaStreamTrack` + on-device ML APIs (experimental, not production-ready)
- Apple's on-device speech recognition via Safari's Web Speech API (already works)

---

## 6. Voice Capture UX Best Practices

### For a Productivity Dashboard (MeOS-Specific)

#### 6.1 Activation Model

**Push-to-talk (recommended for V1):**
- User explicitly presses a button (or keyboard shortcut) to start voice capture.
- Clearest intent signal. No false activations.
- Works well on both desktop and mobile.
- Low cognitive overhead -- user knows when the system is listening.
- Key shortcut recommendation: Hold `Space` to talk (when not in a text input), or a dedicated key like `V`.

**Why not always-listening / wake word for V1:**
- Wake word detection adds complexity (requires on-device keyword model).
- False activations in a productivity tool are highly disruptive.
- Privacy concerns (even perceived ones) are counter-productive for a system that needs user trust.
- Can be a V2 feature with the "progressive autonomy" model (user opts in).

**Why not tap-to-toggle:**
- User forgets to stop, transcribes ambient noise/conversations.
- Unclear visual state.
- If you do use this, aggressive auto-stop with silence detection is essential.

#### 6.2 Visual Feedback During Capture

**Essential elements:**
1. **Recording indicator:** Obvious, unmissable signal that the system is listening (pulsing circle, waveform animation, red dot). This is not just UX polish -- users NEED to know when they are being recorded.
2. **Live transcript preview:** Words appearing in real-time as the user speaks. This is the single most important UX element for voice capture. It confirms the system is working and lets users self-correct.
3. **Audio level meter:** Simple volume indicator to confirm the microphone is picking up audio. Catches "wrong microphone selected" issues immediately.
4. **Duration indicator:** Subtle timer showing how long the current capture has been running.

**Nice-to-have:**
- Waveform visualization (engaging but not essential)
- Confidence highlighting (dim words the system is less sure about)

#### 6.3 Post-Capture Flow

**For MeOS, this is the critical design decision.** When the user finishes speaking, what happens?

**Recommended flow (aligned with MeOS architecture):**

```
User speaks -> Live transcript appears (editable text area)
User stops  -> Transcript finalizes
             -> User can quick-edit the text if needed
             -> User presses Enter (or "Send to Agent")
             -> Capture object created with transcript + timestamp + context
             -> LLM parses intent, proposes structured data
             -> Push-and-confirm: "I heard a new task: [X]. Add to [Project]?"
```

**Key principles:**
- Voice appears as editable text -- user can fix errors before sending (from the brainstorming doc).
- Quick edit or Enter to send to agent (from the brainstorming doc).
- The system should NOT auto-process voice input without user confirmation. This aligns with "Push and Confirm. Always."
- However, if the user is in a rapid capture mode, allow "rapid fire" -- speak, auto-send, speak again, auto-send. The confirmation comes later in the Chat view.

#### 6.4 Error Handling

- **Microphone permission denied:** Clear instruction overlay showing how to enable.
- **No audio detected:** "I cannot hear you. Check your microphone." after 3 seconds of silence.
- **Transcription service unavailable:** Fall back to Web Speech API with a notice. If that also fails, offer text input with a "Voice unavailable" indicator.
- **Poor audio quality:** If VAD detects low signal-to-noise, suggest "Try moving to a quieter environment" (gentle, not blocking).

#### 6.5 Accessibility Considerations

- Voice input is an enhancement, never a requirement. Every voice interaction must have a text alternative.
- Keyboard shortcut for push-to-talk must not conflict with screen reader shortcuts.
- Live transcript region should be an ARIA live region for screen reader announcement.
- Recording state must be announced to screen readers.

---

## 7. Mode Inference Problem

### The Problem

From the brainstorming document: "Mode (capture vs conversation) should be inferred, not selected."

When a user activates voice, their intent could be:
1. **Task capture:** "Buy groceries after work"
2. **Reflection:** "Today was productive, I finished the API integration and feel good about it"
3. **Conversation with agent:** "What should I work on next?"
4. **Command:** "Show me my weekly view"
5. **Goal setting:** "I want to learn Rust this quarter"
6. **Status update:** "I finished the design review"
7. **Vague/uncertain:** "I don't know what to work on" (explicitly a first-class input per brainstorming doc)

The user should NOT have to declare "I am now capturing a task" vs "I am now talking to the agent."

### Recommended Approach: LLM-Based Classification (Post-Transcription)

**Since MeOS delegates intelligence to LLMs via API, mode inference should happen at the LLM layer, not the voice layer.**

**Flow:**
```
1. Voice -> Transcription (Deepgram, raw text)
2. Raw text -> LLM classification prompt
3. LLM returns: { mode: "task_capture" | "reflection" | "conversation" | "command" | "goal" | "status_update" | "uncertain", confidence: 0.0-1.0, ... }
4. If confidence > threshold (e.g., 0.85): auto-process with Push-and-Confirm
5. If confidence < threshold: ask user "Did you mean to [X] or [Y]?"
```

**Why this works for MeOS:**
- The LLM already needs to parse the transcript into structured data. Classification is a trivial addition.
- The LLM can use context (current view, time of day, recent activity, active task) to improve classification.
- No need to train a separate classifier -- the LLM handles it.
- As LLMs improve, classification improves automatically (architecture principle: "built for agent improvement").

**Classification prompt design:**

```
You are the intent classifier for a personal productivity system.
The user just spoke the following text via voice input.

Current context:
- Active view: {current_view}
- Active task: {active_task_name or "none"}
- Time: {current_time}
- Recent captures: {last_3_captures}

Transcript: "{transcript}"

Classify the user's intent as one of:
- task_capture: User is creating a new task or to-do
- reflection: User is reflecting on their day, feelings, or progress
- conversation: User is asking the agent a question or requesting analysis
- command: User wants to navigate or change the UI
- goal_setting: User is defining or updating a goal or vision
- status_update: User is reporting progress on an existing task
- uncertain: User expresses confusion about what to do (this is valid!)

Return JSON: { "mode": "...", "confidence": 0.0-1.0, "reasoning": "..." }
```

**Contextual signals that improve classification:**
- If user is in "Right Now" focus view and says something short, likely a status update.
- If user says "I want to..." or "I need to...", likely task capture or goal setting.
- If user asks a question (detected by question mark or rising intonation context), likely conversation.
- If user is in morning briefing flow, likely planning/conversation.
- If user is in end-of-day flow, likely reflection.

### Alternative: Explicit Modes with Smart Defaults

If inference feels unreliable in testing, a lighter approach:

- **Default mode based on context:** In "Right Now" view, default to status_update. In Chat view, default to conversation. On the dashboard, default to task_capture.
- **Quick switch:** User can prefix with keywords: "Task: ...", "Note: ...", "Question: ..."
- **Post-hoc correction:** If the system misclassifies, user can easily recategorize via a dropdown or quick action.

### Recommendation for V1

Start with LLM-based classification but with a **confirmation step for all captures** (aligned with Push and Confirm). The agent shows what it interpreted and asks for confirmation. This:
- Catches misclassifications
- Trains user expectations
- Provides data for improving classification over time
- Reduces user anxiety about voice input ("what if it misunderstands me?")

Over time (V2+, "progressive autonomy"), the confirmation can be relaxed for high-confidence classifications as the user builds trust.

---

## 8. Architecture Recommendation for V1

### System Architecture

```
Browser                          Backend                      External
+-------------------+    +-------------------+    +-------------------+
|                   |    |                   |    |                   |
| MediaRecorder /   |--->| WebSocket Proxy   |--->| Deepgram Nova-2   |
| AudioContext      |    | (auth + relay)    |<---| (streaming STT)   |
|                   |<---|                   |    |                   |
| Live Transcript   |    +-------------------+    +-------------------+
| (editable text)   |    |                   |    |                   |
|                   |--->| API Endpoint      |--->| LLM (Claude/GPT)  |
| Push-and-Confirm  |    | /capture          |<---| (intent parsing)  |
| UI                |<---|                   |    |                   |
|                   |    +-------------------+    +-------------------+
+-------------------+
|                   |
| Web Speech API    |  (fallback, no backend needed)
| (optional)        |
+-------------------+
```

### Component Breakdown

#### Browser Layer
1. **Audio Capture Module**
   - Uses `navigator.mediaDevices.getUserMedia()` for microphone access.
   - Captures audio as raw PCM (16-bit, 16kHz mono) for Deepgram, or Opus for bandwidth efficiency.
   - Implements Voice Activity Detection (VAD) using `@ricky0123/vad-web` to avoid sending silence.

2. **Streaming Transcription Client**
   - Connects to backend WebSocket proxy.
   - Sends audio chunks in real-time.
   - Receives interim and final transcript results.
   - Updates the live transcript UI.

3. **Web Speech API Fallback**
   - Used when backend is unreachable, or optionally as "instant preview" layer.
   - `webkitSpeechRecognition` with `continuous: true` and `interimResults: true`.
   - Output displayed but marked as "preview" quality.

4. **Transcript Editor**
   - Editable text area showing the live transcript.
   - User can correct errors before sending.
   - Enter key or "Send" button triggers intent processing.

5. **Push-and-Confirm UI**
   - Displays the LLM's interpretation of the voice input.
   - Shows proposed structured data (task, reflection, etc.).
   - Accept / Edit / Reject actions.

#### Backend Layer
1. **WebSocket Proxy**
   - Authenticates user, generates short-lived Deepgram API key (or proxies the connection).
   - Relays audio from browser to Deepgram, transcripts from Deepgram to browser.
   - Minimal logic -- just auth and relay.

2. **Capture Processing Endpoint**
   - Receives finalized transcript + context from browser.
   - Sends to LLM for intent classification and structured data extraction.
   - Returns proposed structured data to browser for Push-and-Confirm.

3. **Capture Storage**
   - Stores raw Capture objects (transcript, timestamp, context, resolved_to).
   - Links to resulting structured data objects (Task, Reflection, etc.).

### Technology Choices

| Component | Recommended | Rationale |
|-----------|-------------|-----------|
| Audio capture | `getUserMedia` + `AudioWorklet` | Standard, reliable, works in all modern browsers |
| VAD | `@ricky0123/vad-web` (Silero VAD) | Best browser-based VAD, runs via WASM, very accurate |
| Streaming STT | Deepgram Nova-2 via WebSocket | Best accuracy + latency for the price |
| Fallback STT | Web Speech API | Free, zero-dependency |
| LLM (intent) | Claude API (Haiku for classification, Sonnet/Opus for complex parsing) | Cost-effective, high quality |
| Backend proxy | Node.js / Next.js API route or Cloudflare Worker | Lightweight, low latency |

### Sequence: Voice Capture to Structured Data

```
1. User presses and holds voice button (or keyboard shortcut)
2. Browser requests microphone permission (first time only)
3. Audio capture starts, VAD activates
4. WebSocket connection to backend proxy opens
5. Audio streams: Browser -> Backend -> Deepgram
6. Transcripts stream back: Deepgram -> Backend -> Browser
7. Live transcript appears in editable text area
8. User releases button (or silence detected for N seconds)
9. Audio capture stops, WebSocket closes
10. Final transcript displayed in editor
11. User reviews, optionally edits, presses Enter
12. Browser sends { transcript, context } to backend /capture endpoint
13. Backend sends to LLM: "Classify and parse this capture"
14. LLM returns: { mode: "task_capture", proposed: { title: "Buy groceries", project: "Personal", ... } }
15. Browser displays Push-and-Confirm card
16. User accepts (or edits and accepts)
17. Structured data object created and stored
18. UI updates to reflect new data
```

---

## 9. Implementation Roadmap

### Phase 1: Basic Voice Capture (1-2 days)
- Implement `getUserMedia` audio capture in browser
- Integrate Web Speech API for immediate real-time transcription
- Build the transcript editor UI (editable text area)
- "Send" button that posts transcript to a processing endpoint
- This gives you a working voice-to-text flow with zero cost and minimal complexity

### Phase 2: Deepgram Integration (2-3 days)
- Set up Deepgram account (free $200 credits)
- Build backend WebSocket proxy (Node.js or serverless)
- Connect browser audio to Deepgram via proxy
- Replace Web Speech API transcript with Deepgram results (keep Web Speech as optional fallback)
- Add keyword boosting for MeOS domain terms

### Phase 3: LLM Intent Processing (2-3 days)
- Build the /capture processing endpoint
- Design and test the classification prompt
- Design and test the structured data extraction prompts (one per mode)
- Build the Push-and-Confirm UI component
- Connect end-to-end: voice -> transcript -> LLM -> proposed data -> confirm -> store

### Phase 4: UX Polish (2-3 days)
- Add VAD (`@ricky0123/vad-web`) to avoid streaming silence
- Add visual feedback (recording indicator, audio level, waveform)
- Add keyboard shortcut for push-to-talk
- Error handling (microphone denied, service unavailable, etc.)
- Auto-stop after extended silence
- Rapid capture mode (for quick-fire task entry)

### Phase 5: Production Hardening (ongoing)
- Monitor Deepgram costs and optimize (silence filtering, connection management)
- Log captures for quality analysis (with user consent)
- A/B test classification prompts for accuracy
- Consider secondary Whisper pass for important recordings
- Build analytics on voice usage patterns

---

## Appendix A: Key NPM Packages

| Package | Purpose |
|---------|---------|
| `@deepgram/sdk` | Deepgram JavaScript SDK |
| `@ricky0123/vad-web` | Browser-based Voice Activity Detection (Silero VAD via WASM) |
| `microsoft-cognitiveservices-speech-sdk` | Azure Speech SDK (if Azure chosen) |
| `assemblyai` | AssemblyAI SDK (if AssemblyAI chosen) |
| `recordrtc` | Feature-rich audio/video recording library |
| `audiobuffer-to-wav` | Convert AudioBuffer to WAV format |

## Appendix B: Deepgram WebSocket Integration Sketch

```javascript
// Browser-side: Connect to Deepgram via backend proxy
const socket = new WebSocket('wss://your-backend.com/voice-proxy');

// Audio capture
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

mediaRecorder.ondataavailable = (event) => {
  if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
    socket.send(event.data);
  }
};

// Receive transcripts
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'Results') {
    const transcript = data.channel.alternatives[0].transcript;
    const isFinal = data.is_final;
    updateTranscriptUI(transcript, isFinal);
  }
};

mediaRecorder.start(250); // Send chunks every 250ms
```

```javascript
// Backend-side: WebSocket proxy (Node.js sketch)
const WebSocket = require('ws');

// Browser connects here
wss.on('connection', (browserSocket) => {
  // Open connection to Deepgram
  const deepgramSocket = new WebSocket(
    'wss://api.deepgram.com/v1/listen?' +
    'model=nova-2&' +
    'punctuate=true&' +
    'smart_format=true&' +
    'interim_results=true&' +
    'endpointing=300&' +
    'keywords=MeOS:2&keywords=epic:1&keywords=kanban:1',
    { headers: { Authorization: `Token ${DEEPGRAM_API_KEY}` } }
  );

  // Relay audio: browser -> deepgram
  browserSocket.on('message', (audio) => {
    if (deepgramSocket.readyState === WebSocket.OPEN) {
      deepgramSocket.send(audio);
    }
  });

  // Relay transcripts: deepgram -> browser
  deepgramSocket.on('message', (transcript) => {
    if (browserSocket.readyState === WebSocket.OPEN) {
      browserSocket.send(transcript);
    }
  });
});
```

## Appendix C: Classification Prompt Template

```
System: You are the voice intent classifier for MeOS, a personal productivity system.
Analyze the user's voice transcription and classify their intent.

Context:
- Current view: {{current_view}}
- Active task: {{active_task || "none"}}
- Time of day: {{time_of_day}}
- Day type: {{weekday_or_weekend}}
- Recent captures: {{last_3_captures_summary}}

User transcript: "{{transcript}}"

Respond with JSON only:
{
  "mode": "task_capture" | "reflection" | "conversation" | "command" | "goal_setting" | "status_update" | "uncertain",
  "confidence": 0.0 to 1.0,
  "summary": "one-line summary of what the user said",
  "proposed_action": "what the system should do with this input"
}
```

---

**Document version:** 1.0
**Last updated:** 2026-02-17
**Status:** Research complete. Ready for architecture review and V1 implementation planning.
