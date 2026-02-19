import { VoiceCapture } from "@/components/voice/VoiceCapture";

export default function VoicePage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center pt-12">
      <h1 className="mb-2 text-2xl font-bold font-[family-name:var(--font-mono)]">
        <span className="gradient-text">Voice Capture</span>
      </h1>
      <div className="gradient-line mb-8 w-16" />
      <VoiceCapture />
    </div>
  );
}
