import { FC, useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Loading, Hex } from "./components/loading"
import { DialogBox } from "./components/dialog_box"
import { Box } from "./components/box"
import { chat, ChatResponse } from "./services/gateway"
import { ReadButton } from "./components/read_button"
import { RecordButton } from "./components/record_button"

export const App: FC = () => {
    const [currentText, setCurrentText] = useState<string>("")
    const [currentLabel, setCurrentLabel] = useState<string>("")

    useEffect(() => {
        const message = "hey"
        setCurrentLabel(message)
        answerMutation.mutate(message)
    }, [])

    const answerMutation = useMutation<ChatResponse, Error, string>(
        {
            mutationFn: (prompt) => chat(prompt),
            onSuccess: (data) => setCurrentText(data.message),
            onError: (error) => console.error(error)
        }
    )

    return (
        <div className="max-w-xl mx-auto p-2 space-y-2">
            <Box
                className="overflow-y-auto"
            >
                <div>
                    <DialogBox text={currentText} label={currentLabel} />
                    {answerMutation.isPending && <Loading color={Hex.BLUE} />}
                    <div className="flex">
                        <ReadButton text={currentText} disabled={answerMutation.isPending} />
                        <RecordButton onChange={() => console.log("I have recorded some audio...")} disabled={answerMutation.isPending} />
                    </div>
                </div>
            </Box>
        </div >
    )
}
