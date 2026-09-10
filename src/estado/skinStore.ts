import { create } from 'zustand'
import { SKIN_PADRAO } from '../app/skins'

interface SkinState {
  skinAtual: string
  setSkin: (id: string) => void
}

// Skin do gato equipada pelo perfil ativo — lido uma vez do avatar do aluno ao entrar no
// Fluxo, e atualizado quando a criança equipa outra na Loja. Fica num store à parte (em vez
// de prop-drilling) porque o mascote aparece em várias telas independentes (Hoje, Sessão,
// Fim de sessão).
export const useSkinStore = create<SkinState>((set) => ({
  skinAtual: SKIN_PADRAO,
  setSkin: (id) => set({ skinAtual: id }),
}))
