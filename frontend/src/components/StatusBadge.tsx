import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type MusicStatusType = 'PENDING' | 'PROCESSING_WHISPER' | 'PROCESSING_FORMATTING' | 'ISOLATING_VOCALS' | 'COMPLETED' | 'FAILED';

interface StatusBadgeProps {
    status: MusicStatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    switch (status) {
        case 'PENDING':
            return (
                <span className={twMerge(clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"))}>
                    Na fila
                </span>
            );
        case 'PROCESSING_WHISPER':
        case 'PROCESSING_FORMATTING':
            return (
                <span className={twMerge(clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"))}>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Processando...
                </span>
            );
        case 'ISOLATING_VOCALS':
            return (
                <span className={twMerge(clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"))}>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Limpando áudio...
                </span>
            );
        case 'COMPLETED':
            return (
                <span className={twMerge(clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"))}>
                    Pronto
                </span>
            );
        case 'FAILED':
            return (
                <span className={twMerge(clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"))}>
                    Erro
                </span>
            );
        default:
            return (
                <span className={twMerge(clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"))}>
                    Desconhecido
                </span>
            );
    }
}
