import { useState } from 'react';
import { UploadBox } from './components/UploadBox';
import { Music, CheckCircle2 } from 'lucide-react';

function App() {
  const [successData, setSuccessData] = useState<{ id: string, status: string } | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center p-8 w-full font-sans">
      <header className="mb-8 flex flex-col items-center gap-3 mt-10">
        <div className="bg-blue-600 text-white p-3 rounded-xl shadow-lg">
          <Music className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Music Transcriber MVP</h1>
        <p className="text-gray-500 text-center max-w-md">
          Faça o upload da sua música e a inteligência artificial cuidará da transcrição para você!
        </p>
      </header>

      <main className="w-full flex justify-center flex-col items-center">
        {!successData ? (
          <UploadBox onSuccess={(data) => setSuccessData(data)} />
        ) : (
          <div className="mt-10 max-w-lg w-full bg-white p-8 rounded-xl shadow-sm border border-green-100 flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Upload Finalizado!</h2>
            <p className="text-gray-600 text-center mb-6">
              O seu arquivo foi recebido com sucesso. O processamento da IA iniciará em breve.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg w-full text-sm font-mono text-gray-700 flex flex-col gap-2">
              <div><strong className="text-gray-900">ID:</strong> {successData.id}</div>
              <div><strong className="text-gray-900">Status:</strong> <span className="text-blue-600 font-semibold">{successData.status}</span></div>
            </div>

            <button
              onClick={() => setSuccessData(null)}
              className="mt-8 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors text-white font-medium rounded-lg shadow-sm"
            >
              Fazer novo upload
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
