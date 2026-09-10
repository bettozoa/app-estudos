const CHAVE_SOM_LIGADO = 'app-estudos:som-ligado'

// Som ligado por padrão, com preferência de mudo persistente (seção 4 do PLANO_VISUAL.md).
export function estaSomLigado(): boolean {
  try {
    return localStorage.getItem(CHAVE_SOM_LIGADO) !== 'nao'
  } catch {
    return true
  }
}

export function alternarSom(): boolean {
  const novoEstado = !estaSomLigado()
  try {
    localStorage.setItem(CHAVE_SOM_LIGADO, novoEstado ? 'sim' : 'nao')
  } catch {
    // localStorage indisponível: o app continua funcionando, só não lembra a preferência.
  }
  return novoEstado
}

// Efeitos curtos sintetizados via Web Audio — sem depender de arquivo de áudio externo, pra
// não pesar o download nem quebrar o "abre offline" (seção 3/4 do PLANO_APP_ESTUDOS.md).
function tocarBip(frequencia: number, duracaoSegundos: number, atrasoSegundos = 0) {
  if (!estaSomLigado()) return
  try {
    const AudioContextClasse = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const contexto = new AudioContextClasse()
    const inicio = contexto.currentTime + atrasoSegundos
    const oscilador = contexto.createOscillator()
    const ganho = contexto.createGain()
    oscilador.type = 'sine'
    oscilador.frequency.value = frequencia
    ganho.gain.setValueAtTime(0.001, inicio)
    ganho.gain.exponentialRampToValueAtTime(0.18, inicio + 0.01)
    ganho.gain.exponentialRampToValueAtTime(0.001, inicio + duracaoSegundos)
    oscilador.connect(ganho)
    ganho.connect(contexto.destination)
    oscilador.start(inicio)
    oscilador.stop(inicio + duracaoSegundos + 0.02)
    oscilador.onended = () => contexto.close()
  } catch {
    // Web Audio indisponível ou bloqueado (ex.: sem interação do usuário ainda) — silencioso.
  }
}

export function tocarSomAcerto() {
  tocarBip(880, 0.12)
  tocarBip(1175, 0.14, 0.08)
}

export function tocarSomErro() {
  tocarBip(196, 0.22)
}
