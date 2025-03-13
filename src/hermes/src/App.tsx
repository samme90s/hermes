import { FC, useEffect, useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Loading, Hex } from "./components/loading"
import { DialogBox } from "./components/dialog_box"
import { Box } from "./components/box"
import { ChatBox } from "./components/chat_box"
import { AudioRecorder } from "./components/audio_recorder"
import { ToggleInput } from "./components/toggle_input"
import { chat, ChatResponse } from "./services/gateway"

interface DialogItem {
    text: string
    label?: string
}

export const App: FC = () => {
    const [isAudioMode, setIsAudioMode] = useState<boolean>(false)
    const [prompt, setPrompt] = useState<string>("")
    const [promptLoading, setPromptLoading] = useState<boolean>(false)
    const [dialogs, setDialogs] = useState<DialogItem[]>([])

    const containerRef = useRef<HTMLDivElement>(null)

    const toggleMode = (): void => setIsAudioMode(prev => !prev)

    const handlePrompt = async (): Promise<void> => {
        if (!prompt.trim()) return
        setPromptLoading(true)

        const newDialog: DialogItem = { text: prompt, label: "Me" }
        setDialogs(prev => [...prev, newDialog])
        setPrompt("")

        setPromptLoading(false)

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

    // TODO: Fix scrolling when mutation is pending and resolves
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
    }, [isAudioMode, prompt, promptLoading, dialogs])

    return (
        <div className="max-w-lg h-screen p-4 mx-auto flex flex-col space-y-2">
            <Box
                ref={containerRef}
                className="max-h-screen flex-1 flex flex-col gap-y-2 overflow-y-auto"
            >
                {dialogs.map((dialog, index) => (
                    <DialogBox key={index} text={dialog.text} label={dialog.label} />
                ))}
                {(promptLoading || answerMutation.isPending) && <Loading color={Hex.BLUE} />}

                {/* Input area */}
                <div className="mt-auto relative">
                    {isAudioMode
                        ? <AudioRecorder onChange={() => null} onError={() => null} className="h-16 w-full" />
                        : <ChatBox value={prompt} onChange={setPrompt} onSubmit={handlePrompt} />
                    }
                    <ToggleInput onSwitch={toggleMode} toggled={isAudioMode} className="absolute right-1 bottom-1" />
                </div>
            </Box>
        </div >
    )
}
