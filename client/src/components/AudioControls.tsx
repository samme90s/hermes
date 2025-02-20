interface AudioControlsProps extends React.AudioHTMLAttributes<HTMLAudioElement> { }

export default function AudioControls({ ...props }: AudioControlsProps) {
    return (
        <div className="flex justify-center">
            <div className="max-w-min bg-neutral-800 p-4 rounded-lg shadow-md my-10">
                <audio {...props} controls className="rounded-lg" />
            </div>
        </div>
    )
}
