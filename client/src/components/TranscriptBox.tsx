interface TranscriptBoxProps {
    transcription: string
}

export default function TranscriptBox({ transcription }: TranscriptBoxProps) {
    return (
        <div className="max-w-2xl mx-auto my-8 bg-white shadow-md rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Transcription</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {transcription}
            </p>
        </div>
    )
}
