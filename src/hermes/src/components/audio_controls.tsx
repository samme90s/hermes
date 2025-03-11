import { FC } from "react"

interface AudioControlsProps extends React.AudioHTMLAttributes<HTMLAudioElement> { }

export const AudioControls: FC<AudioControlsProps> = ({ ...props }) => {
    return (
        <div className="flex justify-center">
            <div className="bg-neutral-800 p-4 rounded-lg shadow-md">
                <audio {...props} controls className="rounded-lg" />
            </div>
        </div>
    )
}
