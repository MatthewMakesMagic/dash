import { VoiceCapture } from "@/components/voice/VoiceCapture";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <h1 className="mb-8 text-2xl font-semibold">Dash</h1>
      <VoiceCapture />
    </main>
  );
}
