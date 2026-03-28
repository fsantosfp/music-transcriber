import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { Toaster } from './Toaster';

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

type UploadBoxProps = {
    onSuccess: (data: { id: string; status: string }) => void;
};

export function UploadBox({ onSuccess }: UploadBoxProps) {
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: any[]) => {
        if (fileRejections.length > 0) {
            setError('Formato inválido ou arquivo muito grande. (Max 50MB, formatos: mp3, wav, ogg, m4a)');
            return;
        }

        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        setError(null);

        try {
            const response = await apiClient.post('/music/upload', formData);
            if (response.status === 201) {
                onSuccess({ id: response.data.id, status: response.data.status });
            }
        } catch (err: any) {
            const message = err.response?.data?.detail || 'Ocorreu um erro durante o upload.';
            setError(typeof message === 'string' ? message : JSON.stringify(message));
        } finally {
            setIsUploading(false);
        }
    }, [onSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'audio/mpeg': ['.mp3'],
            'audio/wav': ['.wav'],
            'audio/ogg': ['.ogg'],
            'audio/mp4': ['.m4a']
        },
        maxSize: MAX_SIZE_BYTES,
        multiple: false
    });

    return (
        <>
            <div
                {...getRootProps()}
                className={`w-full max-w-lg p-12 mt-10 border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-4 hover:bg-blue-50 hover:border-blue-400
        ${isDragActive ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-white'}`}
            >
                <input {...getInputProps()} data-testid="dropzone-input" />

                {isUploading ? (
                    <>
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        <p className="text-gray-600 font-medium">Enviando seu áudio...</p>
                    </>
                ) : (
                    <>
                        <UploadCloud className={`w-12 h-12 transition-colors ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                        {isDragActive ? (
                            <p className="text-blue-600 font-semibold text-center">Solte o arquivo aqui!</p>
                        ) : (
                            <div className="text-center">
                                <p className="text-gray-700 font-medium mb-1">Arraste um arquivo de áudio ou clique aqui.</p>
                                <p className="text-gray-400 text-sm">mp3, wav, ogg, m4a (Máx 50MB)</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {error && <Toaster message={error} type="error" onClose={() => setError(null)} />}
        </>
    );
}
