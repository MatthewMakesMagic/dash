import { VoiceCapture } from "@/components/voice/VoiceCapture";

export default function VoicePage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center pt-12">
      <h1 className="mb-8 text-2xl font-semibold">Voice Capture</h1>
      <VoiceCapture />
    </div>
  );
}
