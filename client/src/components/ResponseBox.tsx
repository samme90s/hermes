interface ResponseBoxProps {
    label: string
    response: string
}

export default function ResponseBox({ label, response }: ResponseBoxProps) {
    return (
        <div className="w-full max-w-lg mx-auto bg-white shadow-md rounded-lg border border-gray-200 p-4">
            <h2 className="text-xl font-semibold text-gray-800">{label}</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {response}
            </p>
        </div>
    )
}
