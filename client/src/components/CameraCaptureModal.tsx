import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  mode: "photo" | "video";
  onClose: () => void;
  onCaptured: (file: File) => void;
};

export default function CameraCaptureModal({
  open,
  mode,
  onClose,
  onCaptured,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        setError(null);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: mode === "video",
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // iOS Safari
          videoRef.current.playsInline = true;
          videoRef.current.muted = true;
          await videoRef.current.play();
        }
      } catch (e: any) {
        setError(e?.message ?? "Não foi possível acessar a câmera.");
      }
    })();

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      recorderRef.current = null;
      setRecording(false);
    };
  }, [open, mode]);

  const takePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob: Blob = await new Promise(res =>
      canvas.toBlob(b => res(b!), "image/jpeg", 0.92)
    );

    const file = new File([blob], `foto-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    onCaptured(file);
    onClose();
  };

  const startVideo = () => {
    const stream = streamRef.current;
    if (!stream) return;

    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    recorder.ondataavailable = e => e.data.size && chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const file = new File([blob], `video-${Date.now()}.webm`, {
        type: "video/webm",
      });
      onCaptured(file);
      onClose();
    };

    recorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  const stopVideo = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-background rounded-xl border border-border overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <div className="font-semibold">
            {mode === "photo" ? "Tirar foto" : "Gravar vídeo"}
          </div>
          <button
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Fechar
          </button>
        </div>

        <div className="bg-black">
          <video ref={videoRef} className="w-full h-[340px] object-contain" />
        </div>

        <div className="p-4 flex gap-3 justify-end">
          {error ? (
            <div className="text-sm text-red-500 mr-auto">{error}</div>
          ) : null}

          {mode === "photo" ? (
            <button
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
              onClick={takePhoto}
            >
              Capturar
            </button>
          ) : (
            <>
              {!recording ? (
                <button
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
                  onClick={startVideo}
                >
                  Iniciar gravação
                </button>
              ) : (
                <button
                  className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground"
                  onClick={stopVideo}
                >
                  Parar
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
