import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import WaveSurfer from 'wavesurfer.js';
import { type MusicTrack } from './Dashboard';
import { Play, Pause, ArrowLeft, Download, Volume2, Music as MusicIcon, Edit3, Save, CheckCircle2 } from 'lucide-react';

export function MusicViewer() {
    const { id } = useParams();
    const [track, setTrack] = useState<MusicTrack | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);

    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [segments, setSegments] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [savedNotice, setSavedNotice] = useState(false);
    const [playingSegment, setPlayingSegment] = useState<number | null>(null);

    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);

    const loadTrack = () => {
        if (!id) return;
        setLoading(true);
        axios.get(`http://localhost:8000/api/v1/music/${id}`)
            .then(res => {
                setTrack(res.data);
                if (isEditing && res.data.raw_transcription) {
                    try {
                        const parsed = JSON.parse(res.data.raw_transcription);
                        setSegments(parsed.segments || []);
                    } catch (e) {
                        console.error("Failed parsing raw transcription", e);
                    }
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed fetching track details", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadTrack();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (!track || !waveformRef.current) return;

        // Initialize WaveSurfer
        wavesurfer.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#93c5fd',      // tailwind blue-300
            progressColor: '#2563eb',  // tailwind blue-600
            cursorColor: '#1e40af',    // tailwind blue-800
            barWidth: 2,
            barRadius: 2,
            height: 80,
            url: `http://localhost:8000/${track.audio_path}`,
        });

        const ws = wavesurfer.current;

        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => { setIsPlaying(false); setPlayingSegment(null); });
        ws.on('finish', () => { setIsPlaying(false); setPlayingSegment(null); });

        ws.setVolume(volume);

        return () => {
            ws.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [track?.audio_path]);

    useEffect(() => {
        if (wavesurfer.current) {
            wavesurfer.current.setVolume(volume);
        }
    }, [volume]);

    const handlePlayPause = () => {
        if (wavesurfer.current) {
            wavesurfer.current.playPause();
        }
    };

    const toggleSegmentPlay = (index: number, start: number, end: number) => {
        if (!wavesurfer.current) return;
        if (isPlaying && playingSegment === index) {
            wavesurfer.current.pause();
            setPlayingSegment(null);
        } else {
            wavesurfer.current.play(start, end);
            setPlayingSegment(index);
        }
    };

    const toggleEditMode = () => {
        if (!isEditing && track?.raw_transcription) {
            try {
                const parsed = JSON.parse(track.raw_transcription);
                setSegments(parsed.segments || []);
            } catch (e) {
                console.error("Failed to parse", e);
            }
        }
        setIsEditing(!isEditing);
    };

    const handleSegmentChange = (index: number, newText: string) => {
        const newSegments = [...segments];
        newSegments[index].text = newText;
        setSegments(newSegments);
    };

    const handleSaveSegments = async () => {
        if (!track || !track.raw_transcription) return;
        setIsSaving(true);
        try {
            const parsed = JSON.parse(track.raw_transcription);
            parsed.segments = segments;
            const updatedRawString = JSON.stringify(parsed);

            await axios.patch(`http://localhost:8000/api/v1/music/${id}`, {
                raw_transcription: updatedRawString
            });

            setSavedNotice(true);
            setTimeout(() => setSavedNotice(false), 3000);

            // Reload background to update properties globally
            loadTrack();

        } catch (error) {
            console.error("Failed to save changes", error);
            alert("Erro ao salvar atualizações no banco");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadLyrics = () => {
        if (!track) return;
        // Fallback to raw if formatted is not available
        const exportText = track.formatted_transcription || track.raw_transcription;
        if (!exportText) return;

        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${track.filename}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading && !track) {
        return <div className="py-20 text-center text-gray-500">Buscando letra no banco de dados...</div>;
    }

    if (!track) {
        return <div className="py-20 text-center text-red-500 font-medium">Música não encontrada.</div>;
    }

    // Default formatting text or generic
    const lyricsText = track.formatted_transcription || track.raw_transcription || "Nenhuma letra disponível.";

    return (
        <div className="w-full max-w-5xl mx-auto py-10 px-6">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" />
                Voltar pro Dashboard
            </Link>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 flex-wrap">
                    <div className="flex items-center gap-4 max-w-full">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded-xl shadow-sm flex-shrink-0">
                            <MusicIcon className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate" title={track.filename}>
                                {track.filename}
                            </h1>
                            <p className="text-gray-500 text-sm mt-0.5">
                                Gerado em {new Date(track.created_at).toLocaleString('pt-BR')}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:ml-auto">
                        {track.raw_transcription && (
                            <button
                                onClick={toggleEditMode}
                                className={`inline-flex items-center gap-2 px-4 py-2 border font-medium text-sm rounded-lg transition-colors cursor-pointer ${isEditing ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm'}`}
                            >
                                <Edit3 className="w-4 h-4" />
                                {isEditing ? 'Sair do Modo Edição' : 'Editor de Segmentos'}
                            </button>
                        )}
                        {(track.formatted_transcription || track.raw_transcription) && (
                            <button
                                onClick={handleDownloadLyrics}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                Baixar Letra
                            </button>
                        )}
                    </div>
                </div>

                {/* Player Controls & Waveform */}
                <div className="bg-gray-50/50 border border-gray-100 p-4 font-sans rounded-xl mb-2">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePlayPause}
                            className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform active:scale-95 flex-shrink-0 cursor-pointer"
                        >
                            {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6 ml-1" fill="currentColor" />}
                        </button>

                        <div className="flex-1 w-full" ref={waveformRef} />
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                        <Volume2 className="w-4 h-4 text-gray-400" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs font-mono text-gray-500 ml-2">{(volume * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            {/* Letra Area / Editor Area */}
            {isEditing ? (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-blue-200 ring-4 ring-blue-50">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Editor de Segmentos Sincronizado</h3>
                            <p className="text-sm text-gray-500">Ouça individualmente os cortes da IA e corrija pontualmente.</p>
                        </div>
                        <button
                            onClick={handleSaveSegments}
                            disabled={isSaving}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all ${isSaving ? 'bg-gray-400 cursor-wait' : savedNotice ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer'}`}
                        >
                            {isSaving ? <span className="animate-pulse">Salvando...</span> : savedNotice ? <><CheckCircle2 className="w-5 h-5" /> Salvo!</> : <><Save className="w-5 h-5" /> Salvar Alterações</>}
                        </button>
                    </div>

                    <div className="flex flex-col gap-3">
                        {segments.map((seg, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 group">
                                <button
                                    onClick={() => toggleSegmentPlay(idx, seg.start, seg.end)}
                                    title={isPlaying && playingSegment === idx ? "Pausar" : "Ouvir este trecho"}
                                    className={`mt-1 flex-shrink-0 p-2.5 rounded-full transition-colors cursor-pointer ${isPlaying && playingSegment === idx ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-inner' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                                >
                                    {isPlaying && playingSegment === idx ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
                                </button>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={seg.text}
                                        onChange={(e) => handleSegmentChange(idx, e.target.value)}
                                        className="w-full bg-transparent border-b border-gray-200 focus:border-blue-500 focus:ring-0 outline-none px-1 py-1.5 text-gray-800 font-medium transition-colors"
                                    />
                                    <div className="text-[10px] text-gray-400 font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        [{seg.start.toFixed(2)}s - {seg.end.toFixed(2)}s]
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-200 animate-in fade-in zoom-in duration-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Transcrição Final</h3>
                    <div className="prose prose-blue max-w-none prose-p:leading-relaxed prose-p:text-gray-700">
                        <pre className="whitespace-pre-wrap font-sans text-[15px] md:text-[17px] leading-relaxed text-gray-800 bg-transparent p-0">
                            {lyricsText}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
