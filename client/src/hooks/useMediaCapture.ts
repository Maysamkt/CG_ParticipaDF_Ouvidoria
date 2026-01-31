import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface CapturedMedia {
  blob: Blob;
  type: "audio" | "video" | "image";
  name: string;
}

function tsName(prefix: string, ext: string) {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  return `${prefix}-${timestamp}.${ext}`;
}

function pickMime(candidates: string[], fallback: string) {
  if (typeof MediaRecorder === "undefined") return fallback;
  return candidates.find(m => MediaRecorder.isTypeSupported(m)) ?? fallback;
}

export function useMediaCapture() {
  const [isRecording, setIsRecording] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const currentKindRef = useRef<"audio" | "video" | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setIsCapturing(false);
  }, []);

  useEffect(() => {
    return () => {
      try {
        mediaRecorderRef.current?.stop();
      } catch {
        // ignore
      }
      stopTracks();
    };
  }, [stopTracks]);

  // SIMPLIFIED API - Single source of truth for starting recording
  const startRecording = useCallback(
    async (type: "audio" | "video"): Promise<void> => {
      try {
        if (isRecording) {
          toast.warning("Já existe uma gravação em andamento");
          return;
        }

        if (type === "audio") {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          streamRef.current = stream;

          const mimeType = pickMime(
            ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"],
            "audio/webm"
          );

          const recorder = new MediaRecorder(stream, { mimeType });
          mediaRecorderRef.current = recorder;
          currentKindRef.current = "audio";
          chunksRef.current = [];

          recorder.ondataavailable = e => {
            if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
          };

          recorder.start();
          setIsRecording(true);
        } else {
          // Video recording
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: true,
          });
          streamRef.current = stream;

          const mimeType = pickMime(
            [
              "video/webm;codecs=vp9,opus",
              "video/webm;codecs=vp8,opus",
              "video/webm",
            ],
            "video/webm"
          );

          const recorder = new MediaRecorder(stream, { mimeType });
          mediaRecorderRef.current = recorder;
          currentKindRef.current = "video";
          chunksRef.current = [];

          recorder.ondataavailable = e => {
            if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
          };

          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = stream;
            await videoPreviewRef.current.play();
          }

          recorder.start();
          setIsRecording(true);
          setIsCapturing(true);
        }
      } catch (error) {
        const msg =
          type === "audio"
            ? "Erro ao acessar microfone. Verifique as permissões."
            : "Erro ao acessar câmera. Verifique as permissões.";
        toast.error(msg);
        console.error(error);
        stopTracks();
      }
    },
    [isRecording, stopTracks]
  );

  // SIMPLIFIED API - Single source of truth for stopping recording
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (!mediaRecorderRef.current || !isRecording) {
      return null;
    }

    return new Promise(resolve => {
      const recorder = mediaRecorderRef.current!;

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        chunksRef.current = [];
        currentKindRef.current = null;

        setIsRecording(false);
        stopTracks();

        resolve(blob);
      };

      try {
        recorder.stop();
      } catch {
        resolve(null);
      }
    });
  }, [isRecording, stopTracks]);

  // VIDEO PREVIEW & CAPTURE
  const captureVideo = useCallback(async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        await videoPreviewRef.current.play();
      }

      setIsCapturing(true);
    } catch (error) {
      toast.error("Erro ao acessar câmera. Verifique as permissões.");
      console.error(error);
    }
  }, []);

  const capturePhoto = useCallback(async (): Promise<CapturedMedia | null> => {
    if (!videoPreviewRef.current || !canvasRef.current) {
      toast.error("Câmera não está ativa");
      return null;
    }

    const video = videoPreviewRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);

    return new Promise(resolve => {
      canvas.toBlob(blob => {
        if (blob) {
          resolve({
            blob,
            type: "image",
            name: tsName("photo", "png"),
          });
        } else {
          resolve(null);
        }
      }, "image/png");
    });
  }, []);

  const stopCapture = useCallback(() => {
    stopTracks();
  }, [stopTracks]);

  return {
    // States
    isRecording,
    isCapturing,

    // Simplified API (primary)
    startRecording,
    stopRecording,

    // Video/photo capture
    captureVideo,
    capturePhoto,
    stopCapture,

    // Refs for video preview
    videoPreviewRef,
    canvasRef,
  };
}
