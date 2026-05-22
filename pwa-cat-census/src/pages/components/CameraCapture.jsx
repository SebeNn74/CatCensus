import { useCameraCapture } from "../../hooks/useCameraCapture";
import "../styles/CensusPage.css";

const KB_APPROX = (base64Len) => Math.round((base64Len * 0.75) / 1024);

function CameraCapture({ onCapture }) {
  const {
    imagePreview,
    isCameraOpen,
    videoRef,
    startCamera,
    stopCamera,
    takePhoto,
    handleFileInput,
    clearImage,
    error,
  } = useCameraCapture({ onCapture });

  return (
    <div className="camera-capture">
      {/* ── Stream de cámara activo ───────────────────────────────────────── */}
      {isCameraOpen && (
        <div className="camera-viewfinder">
          <video
            ref={videoRef}
            className="camera-video"
            autoPlay
            playsInline
            aria-label="Vista previa de la cámara"
          />
          <div className="camera-controls">
            <button
              type="button"
              className="camera-btn camera-btn--capture"
              onClick={takePhoto}
            >
              Capturar
            </button>
            <button
              type="button"
              className="camera-btn camera-btn--cancel"
              onClick={stopCamera}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Opciones cuando la cámara está cerrada ───────────────────────── */}
      {!isCameraOpen && (
        <div className="camera-options">
          <button
            type="button"
            className="camera-btn camera-btn--open"
            onClick={startCamera}
          >
            Abrir Cámara
          </button>

          <span className="camera-divider">o</span>

          <label className="camera-file-label">
            <span>Subir archivo / cámara nativa</span>
            <input
              className="camera-file-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInput}
            />
          </label>
        </div>
      )}

      {/* ── Error de cámara / compresión ─────────────────────────────────── */}
      {error && <p className="camera-error">{error}</p>}

      {/* ── Preview de la imagen capturada ───────────────────────────────── */}
      {imagePreview && (
        <div className="camera-preview">
          <img
            className="camera-preview-img"
            src={imagePreview}
            alt="Vista previa de la foto"
          />
          <div className="camera-preview-meta">
            {KB_APPROX(imagePreview.length)} Kb
            <button
              type="button"
              className="camera-preview-clear"
              onClick={clearImage}
              aria-label="Eliminar foto"
            >
              ✕ Quitar foto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CameraCapture;
