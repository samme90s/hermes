import { FC, useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Loading, Hex } from "./components/loading"
import { DialogBox } from "./components/dialog_box"
import { Box } from "./components/box"
import { ChatBox } from "./components/chat_box"
import { AudioRecorder } from "./components/audio_recorder"
import { ToggleInput } from "./components/toggle_input"
import { chat, ChatResponse } from "./services/gateway"
import { TextToSpeech } from "./components/text_to_speech"

interface DialogItem {
    text: string
    label?: string
}

export const App: FC = () => {
    const [isAudioMode, setIsAudioMode] = useState<boolean>(false)
    const [prompt, setPrompt] = useState<string>("")
    const [dialogs, setDialogs] = useState<DialogItem[]>([])

    const containerRef = useRef<HTMLDivElement>(null)

    const toggleMode = (): void => setIsAudioMode(prev => !prev)

    const handleCBSubmit = async (): Promise<void> => {
        if (!prompt.trim()) return

        const newDialog: DialogItem = { text: prompt, label: "Me" }
        setDialogs(prev => [...prev, newDialog])
        setPrompt("")

        // Trigger the answer mutation
        answerMutation.mutate(prompt)
    }

    const answerMutation = useMutation<ChatResponse, Error, string>(
        {
            mutationFn: (prompt) => chat(prompt),
            onSuccess: (data) => {
                const newDialog: DialogItem = { text: data.choices[0].message.content, label: "Best friend" }
                setDialogs(prev => [...prev, newDialog])
            },
            onError: (error) => {
                console.error(error)
            }
        }
    )

    return (
        <div className="max-w-lg h-screen p-4 mx-auto flex flex-col space-y-2">
            <Box
                ref={containerRef}
                className="max-h-screen flex-1 flex flex-col gap-y-2 overflow-y-auto"
            >
                {dialogs.map((dialog, index) => (
                    <DialogBox key={index} text={dialog.text} label={dialog.label} />
                ))}
                {answerMutation.isPending && <Loading color={Hex.BLUE} />}

                {/* Input area */}
                <div className="mt-auto space-y-2">
                    <div className="flex items-center gap-2">
                        {isAudioMode
                            ? <AudioRecorder disabled onChange={() => null} className="flex-grow" />
                            : <ChatBox value={prompt} onChange={setPrompt} onSubmit={handleCBSubmit} className="flex-grow" />
                        }
                        <ToggleInput onSwitch={toggleMode} toggled={isAudioMode} />
                    </div>
                    <TextToSpeech text={dialogs.at(-1)?.text || ""} />
                </div>
            </Box>
        </div >
    )
}
