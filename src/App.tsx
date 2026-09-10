import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Raiz } from './app/Raiz'
import { Kitchen } from './screens/Kitchen'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Raiz />} />
        <Route path="/kitchen" element={<Kitchen />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
