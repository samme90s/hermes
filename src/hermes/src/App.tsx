import { FC, useEffect, useRef, useState } from "react"
import { Loading } from "./components/loading"
import { HexColors } from "./lib/colors"
import { DialogBox } from "./components/dialog_box"
import { Box } from "./components/box"
import { ChatBox } from "./components/chat_box"
import { DialogText } from "./components/dialog_text"

interface DialogItem {
    text: string
    label?: string
    className?: string
}

export const App: FC = () => {
    const [prompt, setPrompt] = useState<string>("")
    const [promptLoading, setPromptLoading] = useState<boolean>(false)
    const [answerLoading, setAnswerLoading] = useState<boolean>(false)
    const [dialogs, setDialogs] = useState<DialogItem[]>([])

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
    }, [dialogs, promptLoading, answerLoading])

    async function handlePrompt(): Promise<void> {
        if (!prompt.trim()) return
        setPromptLoading(true)

        const newDialog: DialogItem = { text: prompt, label: "Me", className: "bg-gray-700 text-white" }
        setDialogs(prev => [...prev, newDialog])
        setPrompt("")

        setPromptLoading(false)
        handleAnswer()
    }

    async function handleAnswer(): Promise<void> {
        setAnswerLoading(true)

        // Simulate...
        setTimeout(() => {
            const answer: DialogItem = { text: "This is a simulated response.", label: "Best friend" }
            setDialogs(prev => [...prev, answer])
            setAnswerLoading(false)
        }, 1000)
    }

    return (
        <div className="max-w-lg h-screen p-4 mx-auto flex flex-col space-y-2">
            <Box ref={containerRef} className="max-h-screen flex-1 flex flex-col gap-y-2 overflow-y-auto">
                {dialogs.map((dialog, index) => (
                    <DialogBox key={index} label={dialog.label} className={dialog.className}>
                        <DialogText text={dialog.text} />
                    </DialogBox>
                ))}
                {promptLoading && <DialogBox><Loading color={HexColors.RED} /></DialogBox>}
                {answerLoading && <DialogBox><Loading color={HexColors.RED} /></DialogBox>}
            </Box>
            <ChatBox value={prompt} onChange={setPrompt} onSubmit={handlePrompt} />
        </div>
    )
}
