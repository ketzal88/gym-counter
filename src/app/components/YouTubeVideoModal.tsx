'use client';

import { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { getExerciseVideoData, getYouTubeEmbedUrl, getYouTubeUrl } from '@/data/exerciseVideos';

interface YouTubeVideoModalProps {
  exerciseId: string;
  exerciseName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function YouTubeVideoModal({
  exerciseId,
  exerciseName,
  isOpen,
  onClose,
}: YouTubeVideoModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const embedUrl = getYouTubeEmbedUrl(exerciseId);
  const videoUrl = getYouTubeUrl(exerciseId);
  const videoData = getExerciseVideoData(exerciseId);

  // Si no hay video, mostrar mensaje
  if (!embedUrl) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-4">
            <div className="text-5xl mb-4">🎥</div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Video No Disponible
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Lo sentimos, aún no tenemos un video para <span className="font-bold">{exerciseName}</span>.
              Estamos trabajando en añadir más contenido.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
          <div className="flex-1 pr-4">
            <h3 className="font-black text-white text-lg truncate">
              {videoData?.title || exerciseName}
            </h3>
            {videoData?.channel && (
              <p className="text-sm text-slate-400">
                {videoData.channel} {videoData.duration && `• ${videoData.duration}`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Open in YouTube */}
            {videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
                title="Abrir en YouTube"
              >
                <ExternalLink className="w-5 h-5 text-white" />
              </a>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Video Embed - 16:9 Aspect Ratio */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedUrl}
            title={exerciseName}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-slate-800 border-t border-slate-700">
          <p className="text-sm text-slate-400 text-center">
            💡 <span className="font-bold text-white">Pro tip:</span> Pausa el video y practica la técnica con peso ligero primero
          </p>
        </div>
      </div>
    </div>
  );
}
