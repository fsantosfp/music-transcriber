import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import WaveSurfer from 'wavesurfer.js';
import { type MusicTrack } from './Dashboard';
import { Play, Pause, ArrowLeft, Download, Volume2, Music as MusicIcon } from 'lucide-react';

export function MusicViewer() {
    const { id } = useParams();
    const [track, setTrack] = useState<MusicTrack | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);

    useEffect(() => {
        if (!id) return;

        axios.get(`http://localhost:8000/api/v1/music/${id}`)
            .then(res => {
                setTrack(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed fetching track details", err);
                setLoading(false);
            });
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
        ws.on('pause', () => setIsPlaying(false));
        ws.on('finish', () => setIsPlaying(false));

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

    const handleDownloadRaw = () => {
        if (!track || !track.raw_transcription) return;
        const blob = new Blob([track.raw_transcription], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `raw_${track.filename}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) {
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

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded-xl shadow-sm">
                            <MusicIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 line-clamp-1" title={track.filename}>
                                {track.filename}
                            </h1>
                            <p className="text-gray-500 text-sm mt-0.5">
                                Gerado em {new Date(track.created_at).toLocaleString('pt-BR')}
                            </p>
                        </div>
                    </div>

                    {track.raw_transcription && (
                        <button
                            onClick={handleDownloadRaw}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                            Baixar Log
                        </button>
                    )}
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

            {/* Letra Area */}
            <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Transcrição Sincronizada</h3>
                <div className="prose prose-blue max-w-none prose-p:leading-relaxed prose-p:text-gray-700">
                    <pre className="whitespace-pre-wrap font-sans text-[15px] md:text-[17px] leading-relaxed text-gray-800 bg-transparent p-0">
                        {lyricsText}
                    </pre>
                </div>
            </div>
        </div>
    );
}
