import { useState } from 'react';
import { UploadBox } from '../components/UploadBox';
import { Music, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function UploadView() {
    const [successData, setSuccessData] = useState<{ id: string, status: string } | null>(null);

    return (
        <div className="flex flex-col items-center py-12 w-full max-w-4xl mx-auto px-4">
            <div className="w-full mb-6">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar pro Dashboard
                </Link>
            </div>

            <header className="mb-10 flex flex-col items-center gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3.5 rounded-2xl shadow-lg shadow-blue-500/30">
                    <Music className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Music Transcriber MVP</h1>
                <p className="text-gray-500 text-center max-w-md">
                    Faça o upload da pista vocal ou instrumental e nós a transformaremos em uma letra com qualidade de estúdio!
                </p>
            </header>

            <main className="w-full flex justify-center flex-col items-center">
                {!successData ? (
                    <UploadBox onSuccess={(data) => setSuccessData(data)} />
                ) : (
                    <div className="mt-6 max-w-lg w-full bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-green-100 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Engenharia Iniciada!</h2>
                        <p className="text-gray-600 text-center mb-6">
                            O seu arquivo estourou a fila com sucesso. A IA já está varrendo os ruídos.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-xl w-full text-sm font-mono text-gray-700 flex flex-col gap-3 border border-gray-100">
                            <div className="flex justify-between border-b pb-2"><strong className="text-gray-900">ID da Transação:</strong> <span className="opacity-70">{successData.id.split('-')[0]}...</span></div>
                            <div className="flex justify-between"><strong className="text-gray-900">Módulo Atual:</strong> <span className="text-blue-600 font-semibold">{successData.status}</span></div>
                        </div>

                        <div className="mt-8 flex gap-3 w-full">
                            <button
                                onClick={() => setSuccessData(null)}
                                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors text-gray-700 font-semibold rounded-xl"
                            >
                                Outro Upload
                            </button>
                            <Link to="/dashboard" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors text-white font-semibold rounded-xl text-center shadow-md shadow-blue-500/20">
                                Ver Fila de Acompanhamento
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
