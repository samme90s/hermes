interface AudioControlsProps extends React.AudioHTMLAttributes<HTMLAudioElement> {}

export default function AudioControls({ ...props }: AudioControlsProps) {
    return (
        <div className="bg-neutral-800 p-4 rounded-lg shadow-md max-w-md my-10">
            <audio {...props} controls className="w-full h-auto rounded-lg" />
        </div>
    )
}
