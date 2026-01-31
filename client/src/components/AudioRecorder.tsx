import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";
import { useMediaCapture } from "@/hooks/useMediaCapture";
import { toast } from "sonner";

interface AudioRecorderProps {
  onRecorded: (file: File) => void;
}

export default function AudioRecorder({ onRecorded }: AudioRecorderProps) {
  const { isRecording, startRecording, stopRecording } = useMediaCapture();

  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      const blob = await stopRecording();
      if (blob) {
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: "audio/webm", // força sem codecs
        });
        onRecorded(file);
        toast.success("Gravação concluída!");
      }
    } else {
      // Start recording
      await startRecording("audio");
      toast.info("Gravando áudio...");
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleToggleRecording}
      disabled={false}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
        isRecording
          ? "bg-destructive text-white hover:bg-destructive/90 border-destructive"
          : "hover:bg-muted"
      }`}
      title={isRecording ? "Parar gravação" : "Gravar áudio"}
    >
      {isRecording ? (
        <Square className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5 text-primary" />
      )}
      <span className="text-sm font-medium hidden sm:inline">
        {isRecording ? "Parar" : "Áudio"}
      </span>
    </Button>
  );
}
