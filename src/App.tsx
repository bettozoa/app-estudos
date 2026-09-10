import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Fluxo } from './app/Fluxo'
import { Kitchen } from './screens/Kitchen'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Fluxo />} />
        <Route path="/kitchen" element={<Kitchen />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
