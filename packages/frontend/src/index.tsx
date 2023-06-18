import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Start from './pages/Start'
import './index.css'
import Projects from './pages/Projects'
import ClaimPrize from './pages/ClaimPrize'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Start />} />
                <Route path="/claim/:claimCode" element={<Start />} />
                <Route path="projects" element={<Projects />} />
                <Route path="claim" element={<ClaimPrize />} />
            </Routes>
        </BrowserRouter>
    )
}

const rootElement = document.getElementById('root')
if (rootElement) {
    const root = createRoot(rootElement)
    root.render(<App />)
}
