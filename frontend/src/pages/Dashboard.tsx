import { useEffect, useState } from 'react';
import axios from 'axios';
import { StatusBadge, type MusicStatusType } from '../components/StatusBadge';
import { FileAudio, ChevronRight, Upload, RotateCcw, Trash2, AlertTriangle, X, Search, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface MusicTrack {
    id: string;
    filename: string;
    status: MusicStatusType;
    audio_path: string;
    created_at: string;
    raw_transcription?: string;
    formatted_transcription?: string;
}

export function Dashboard() {
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset page on new search
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const fetchTracks = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/v1/music/?page=${page}&size=10&q=${debouncedSearch}`);
            setTracks(response.data.items);
            setTotalPages(response.data.pages);
            setTotalItems(response.data.total);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tracks:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTracks();
    }, [page, debouncedSearch]);

    const handleRetry = async (id: string) => {
        try {
            await axios.post(`http://localhost:8000/api/v1/music/${id}/retry`);
            fetchTracks();
        } catch (error) {
            console.error("Error retrying track:", error);
            alert("Erro ao tentar reprocessar o áudio.");
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedTracks(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        if (selectedTracks.length === tracks.length) {
            setSelectedTracks([]);
        } else {
            setSelectedTracks(tracks.map(t => t.id));
        }
    };

    const handleBulkDelete = async () => {
        setIsDeleting(true);
        try {
            await Promise.all(
                selectedTracks.map(id => axios.delete(`http://localhost:8000/api/v1/music/${id}`))
            );
            setTracks(prev => prev.filter(t => !selectedTracks.includes(t.id)));
            setSelectedTracks([]);
            setIsDeleteModalOpen(false);
            setDeleteInput("");
        } catch (error) {
            console.error("Failed to delete tracks:", error);
            alert("Ocorreu um erro ao excluir algumas faixas.");
        } finally {
            setIsDeleting(false);
        }
    };

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
        <div className="w-full max-w-5xl mx-auto py-10 px-6 pb-28">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Transcrições de Letras</h1>
                    <p className="text-gray-500 mt-1">Acompanhe o processamento do pipeline de inteligência artificial.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar música ou letra..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <Link to="/upload" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-sm font-medium transition-transform active:scale-95 shrink-0">
                        <Upload className="w-4 h-4" />
                        Nova Música
                    </Link>
                </div>
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
                                    <th className="px-6 py-4 whitespace-nowrap w-4">
                                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            checked={selectedTracks.length > 0 && selectedTracks.length === tracks.length}
                                            onChange={toggleAll} />
                                    </th>
                                    <th className="px-6 py-4 whitespace-nowrap">Arquivo Físico</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Upload realizado em</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Status da IA</th>
                                    <th className="px-6 py-4 text-right whitespace-nowrap">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tracks.map((track) => (
                                    <tr key={track.id} className={`transition-colors ${selectedTracks.includes(track.id) ? 'bg-blue-50/50 hover:bg-blue-50/70' : 'hover:bg-gray-50'}`}>
                                        <td className="px-6 py-4 whitespace-nowrap w-4">
                                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={selectedTracks.includes(track.id)}
                                                onChange={() => toggleSelection(track.id)} />
                                        </td>
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
                                                <Link to={`/music/${track.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold tracking-tight cursor-pointer">
                                                    Abrir Letra <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            ) : track.status === 'FAILED' ? (
                                                <button onClick={() => handleRetry(track.id)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-bold tracking-tight cursor-pointer transition-colors hover:bg-red-50 px-3 py-1.5 rounded-lg">
                                                    <RotateCcw className="w-4 h-4" /> Tentar Novamente
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">
                        Mostrando página <strong className="text-gray-900">{page}</strong> de <strong className="text-gray-900">{totalPages}</strong> ({totalItems} registros)
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" /> Anterior
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            Próxima <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Nuke Bar */}
            {selectedTracks.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] z-40 animate-in slide-in-from-bottom-5">
                    <div className="max-w-5xl mx-auto w-full flex justify-between items-center px-6">
                        <span className="font-medium text-gray-800">
                            <span className="bg-blue-100 text-blue-700 py-1 px-2.5 rounded-full text-sm mr-2">{selectedTracks.length}</span>
                            faixa{selectedTracks.length > 1 ? 's' : ''} selecionada{selectedTracks.length > 1 ? 's' : ''}
                        </span>
                        <div className="flex gap-4">
                            <button onClick={() => setSelectedTracks([])} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors cursor-pointer">
                                Cancelar
                            </button>
                            <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-bold shadow-sm transition-colors cursor-pointer">
                                <Trash2 className="w-4 h-4" /> Deletar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AWS Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-red-50 border-b border-red-100 p-6 text-center text-red-600 relative">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="absolute top-4 right-4 text-red-400 hover:text-red-700 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="mx-auto bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold">Zona de Perigo</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-6 font-medium leading-relaxed">
                                Você está prestes a apagar <strong>{selectedTracks.length} faixa{selectedTracks.length > 1 ? 's' : ''}</strong> permanentemente da base de dados e mandar os arquivos originais (.mp3/.wav) para o lixo. Essa ação <span className="underline decoration-red-500 font-bold">NÃO pode ser desfeita</span>.
                            </p>

                            <label className="block text-sm text-gray-600 font-medium mb-2">
                                Para confirmar, digite <span className="bg-gray-100 text-gray-800 font-mono px-1.5 py-0.5 rounded user-select-all">deletar</span> no campo abaixo:
                            </label>
                            <input
                                type="text"
                                value={deleteInput}
                                onChange={e => setDeleteInput(e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all font-mono text-center tracking-widest text-lg text-gray-800"
                                placeholder="digite aqui..."
                            />

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => { setIsDeleteModalOpen(false); setDeleteInput(""); }}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={deleteInput !== "deletar" || isDeleting}
                                    className={`flex-1 py-3 font-bold rounded-xl transition-all ${deleteInput === "deletar" && !isDeleting ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 cursor-pointer' : 'bg-red-100 text-red-300 cursor-not-allowed'}`}
                                >
                                    {isDeleting ? 'Nuking...' : 'Confirmar Exclusão'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
