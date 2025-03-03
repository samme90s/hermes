import { app, BrowserWindow } from "electron"
import { fileURLToPath } from "url"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Fallback to true if environment was not set
const isDev = process.env.NODE_ENV ? process.env.NODE_ENV !== "production" : true

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    // For development, load the Vite server URL.
    if (isDev) {
        win.loadURL("http://localhost:5173")
    }
    else {
        // For production, load the built index.html from client/dist
        // "__dirname" resolves to client/dist/electron after compilation,
        // so "../index.html" resolves to client/dist/index.html
        win.loadFile(path.join(__dirname, "../index.html"))
    }
    // Uncomment this to open inspector:
    // win.webContents.openDevTools()
}

app.whenReady().then(createWindow)
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
