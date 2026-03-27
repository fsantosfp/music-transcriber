

type ToasterProps = {
    message: string;
    type: 'error' | 'success';
    onClose: () => void;
};

export function Toaster({ message, type, onClose }: ToasterProps) {
    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
    return (
        <div className={`fixed top-4 right-4 text-white px-4 py-3 rounded shadow-lg flex items-center gap-2 z-50 transition-opacity ${bgColor}`}>
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 font-bold cursor-pointer hover:text-gray-200" aria-label="fechar">×</button>
        </div>
    );
}
