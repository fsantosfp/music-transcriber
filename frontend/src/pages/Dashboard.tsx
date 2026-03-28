import { useEffect, useState } from 'react';
import axios from 'axios';
import { StatusBadge, type MusicStatusType } from '../components/StatusBadge';
import { FileAudio, ChevronRight, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface MusicTrack {
    id: string;
    filename: string;
    status: MusicStatusType;
    audio_path: string;
    created_at: string;
}

export function Dashboard() {
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTracks = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/music/');
            setTracks(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tracks:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTracks();
    }, []);

    useEffect(() => {
        // Escaneia tracks que exigem polling
        const pendingTracks = tracks.filter(t => t.status !== 'COMPLETED' && t.status !== 'FAILED');

        if (pendingTracks.length === 0) return;

        const interval = setInterval(() => {
            pendingTracks.forEach(async (track) => {
                try {
                    const res = await axios.get(`http://localhost:8000/api/v1/music/${track.id}`);
                    const updatedTrack: MusicTrack = res.data;

                    setTracks(prev => prev.map(t => t.id === updatedTrack.id ? updatedTrack : t));
                } catch (error) {
                    console.error(`Failed to poll status for ${track.id}`, error);
                }
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [tracks]);

    if (loading) {
        return <div className="flex justify-center items-center py-20 text-gray-500">Carregando dashboard...</div>;
    }

    return (
        <div className="w-full max-w-5xl mx-auto py-10 px-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Transcrições de Letras</h1>
                    <p className="text-gray-500 mt-1">Acompanhe o processamento do pipeline de inteligência artificial.</p>
                </div>
                <Link to="/upload" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-transform active:scale-95">
                    <Upload className="w-4 h-4" />
                    Nova Música
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {tracks.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-500">
                        <FileAudio className="w-14 h-14 text-blue-100 mb-4" />
                        <p className="text-lg font-medium text-gray-800">Nenhuma transcrição enviada</p>
                        <p className="text-sm mt-1">Clique no botão Acima para importar sua primeira faixa.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 whitespace-nowrap">Arquivo Físico</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Upload realizado em</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Status da IA</th>
                                    <th className="px-6 py-4 text-right whitespace-nowrap">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tracks.map((track) => (
                                    <tr key={track.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                <FileAudio className="w-4 h-4 text-gray-500" />
                                            </div>
                                            {track.filename}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            {new Date(track.created_at).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={track.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {track.status === 'COMPLETED' ? (
                                                <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold tracking-tight cursor-pointer">
                                                    Abrir Letra <ChevronRight className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <span className="text-gray-300 inline-flex items-center gap-1 font-medium cursor-not-allowed">
                                                    Aguarde Processamento...
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
