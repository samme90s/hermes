import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { App } from "./app"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Must wrap the app here with the query client to allow
// tanstack's stuff to work.
const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </StrictMode>,
)
