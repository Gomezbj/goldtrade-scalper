import React, { useState, useCallback, ChangeEvent, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import type { ImageFile } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ImageUploaderProps {
  title: string;
  onImageUpload: (file: ImageFile | null) => void;
  disabled: boolean;
}

export interface ImageUploaderHandles {
  clear: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const ImageUploader = forwardRef<ImageUploaderHandles, ImageUploaderProps>(({ title, onImageUpload, disabled }, ref) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      console.warn("El archivo no es una imagen:", file.type);
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);

    try {
      const base64 = await fileToBase64(file);
      onImageUpload({ name: file.name, base64, mimeType: file.type });
    } catch (error) {
      console.error("Error al convertir el archivo a base64", error);
      onImageUpload(null);
    }
  }, [preview, onImageUpload]);

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, [processFile]);

  const handleSingleClick = () => {
    if (!disabled) {
      dropZoneRef.current?.focus();
    }
  };

  const handleDoubleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = useCallback((event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (preview) {
        URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setFileName(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    onImageUpload(null);
  }, [preview, onImageUpload]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      handleRemoveImage();
    }
  }));

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDraggingOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFile = Array.from(files).find(f => f.type.startsWith('image/'));
      if (imageFile) {
        await processFile(imageFile);
      }
    }
  }, [disabled, processFile]);
  
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    if (disabled || document.activeElement !== dropZoneRef.current) {
        return;
    }
    
    const items = e.clipboardData?.items;
    if (items) {
      const imageItem = Array.from(items).find(item => item.type.startsWith('image/'));
      if (imageItem) {
        e.preventDefault();
        const blob = imageItem.getAsFile();
        if (blob) {
          const now = new Date();
          const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
          const file = new File([blob], `pasted_image_${timestamp}.${blob.type.split('/')[1]}`, { type: blob.type });
          await processFile(file);
        }
      }
    }
  }, [disabled, processFile]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  return (
    <div className={`bg-gray-800/50 p-6 rounded-xl border-2 border-dashed ${isDraggingOver ? 'border-sky-500' : 'border-gray-600'} transition-colors duration-300 ${!disabled && 'hover:border-sky-500'} ${disabled && 'opacity-60'}`}>
      <h2 className="text-xl font-semibold text-center text-gray-300 mb-4">{title}</h2>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        disabled={disabled}
      />
      <div
        ref={dropZoneRef}
        tabIndex={0}
        onClick={handleSingleClick}
        onDoubleClick={handleDoubleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full h-64 flex flex-col items-center justify-center rounded-lg bg-gray-700/50 transition-all duration-300 outline-none ${!disabled && 'cursor-pointer hover:bg-gray-700'} ${isDraggingOver ? 'bg-sky-900/40 ring-2 ring-sky-400 ring-offset-2 ring-offset-gray-800' : 'focus:ring-2 focus:ring-sky-500'}`}
        role="button"
        aria-label={`Área de carga para ${title}. Haz clic para preparar pegado, doble clic para buscar, arrastra y suelte una imagen, o haz clic y pegue una imagen.`}
      >
        {preview ? (
          <div className="relative w-full h-full group">
            <img src={preview} alt="Vista previa del gráfico" className="w-full h-full object-contain rounded-lg p-2" />
            <div className="absolute bottom-0 w-full bg-black/50 text-white text-xs text-center p-1 truncate">{fileName}</div>
            <button
                onClick={handleRemoveImage}
                className="absolute top-3 right-3 bg-gray-900/60 hover:bg-red-600 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 backdrop-blur-sm"
                aria-label="Eliminar imagen"
                disabled={disabled}
            >
                <TrashIcon />
            </button>
          </div>
        ) : (
          isDraggingOver ? (
            <div className="text-center text-sky-300 pointer-events-none">
                <UploadIcon />
                <p className="mt-2 font-semibold">Suelta la imagen para cargarla</p>
            </div>
          ) : (
            <div className="text-center text-gray-500 pointer-events-none">
              <UploadIcon />
              <p className="mt-2 font-semibold">Arrastra o pega una imagen</p>
              <p className="text-sm">o haz doble clic para buscar</p>
            </div>
          )
        )}
      </div>
    </div>
  );
});

export default ImageUploader;