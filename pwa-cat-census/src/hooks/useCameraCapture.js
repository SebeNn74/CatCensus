import { useState, useRef, useEffect } from "react";

const MAX_WIDTH = 400;
const BASE64_LIMIT = 68_000; // ≈ 50 Kb en base64
const INITIAL_QUALITY = 0.7;
const MIN_QUALITY = 0.1;
const QUALITY_STEP = 0.1;

function compressToBase64(source, sourceWidth, sourceHeight) {
  const canvas = document.createElement("canvas");
  const scale = MAX_WIDTH / sourceWidth;
  canvas.width = MAX_WIDTH;
  canvas.height = sourceHeight * scale;

  canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);

  let quality = INITIAL_QUALITY;
  let base64 = canvas.toDataURL("image/jpeg", quality);

  while (base64.length > BASE64_LIMIT && quality > MIN_QUALITY) {
    quality -= QUALITY_STEP;
    base64 = canvas.toDataURL("image/jpeg", quality);
  }

  if (base64.length > BASE64_LIMIT) {
    throw new Error("La imagen es demasiado grande. Intenta con otra foto.");
  }

  return base64;
}

export function useCameraCapture({ onCapture }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => stopStream();
  }, []);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      setError("No se pudo acceder a la cámara. Revisa los permisos.");
    }
  };

  const stopCamera = () => {
    stopStream();
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    try {
      const base64 = compressToBase64(
        video,
        video.videoWidth,
        video.videoHeight,
      );
      setImagePreview(base64);
      onCapture(base64);
    } catch (err) {
      setError(err.message);
    } finally {
      stopCamera();
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        try {
          const base64 = compressToBase64(img, img.width, img.height);
          setImagePreview(base64);
          onCapture(base64);
        } catch (err) {
          setError(err.message);
        }
      };
    };
  };

  const clearImage = () => {
    setImagePreview(null);
    onCapture("");
  };

  return {
    imagePreview,
    isCameraOpen,
    videoRef,
    startCamera,
    stopCamera,
    takePhoto,
    handleFileInput,
    clearImage,
    error,
  };
}
