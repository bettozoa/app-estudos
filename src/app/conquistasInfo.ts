// Metadados de exibição das 7 conquistas de exemplo (seção 7 do PLANO_APP_ESTUDOS.md) —
// espelha o seed em supabase/migrations/*_gamificacao.sql. Mantido local pra não depender de
// uma ida ao Supabase só pra mostrar nome/ícone na tela de Fim de sessão.
export interface InfoConquista {
  codigo: string
  nome: string
  descricao: string
  icone: string
}

export const CONQUISTAS: Record<string, InfoConquista> = {
  primeiro_modulo: { codigo: 'primeiro_modulo', nome: 'Primeiro módulo', descricao: 'Terminou o primeiro módulo de uma matéria.', icone: '🌟' },
  capitulo_completo: { codigo: 'capitulo_completo', nome: 'Capítulo 100%', descricao: 'Dominou todas as questões de um capítulo.', icone: '🏆' },
  sete_dias: { codigo: 'sete_dias', nome: 'Sete dias seguidos', descricao: 'Estudou 7 dias seguidos.', icone: '🔥' },
  cinquenta_revisoes: { codigo: 'cinquenta_revisoes', nome: '50 revisões em dia', descricao: 'Fez 50 revisões sem deixar nenhuma vencer.', icone: '📚' },
  fila_zerada: { codigo: 'fila_zerada', nome: 'Zerou a fila de revisão', descricao: 'Não deixou nenhuma revisão pendente.', icone: '✨' },
  vinte_seguidas: { codigo: 'vinte_seguidas', nome: 'Acertou 20 seguidas', descricao: 'Acertou 20 questões seguidas na mesma sessão.', icone: '⚡' },
  explorador: { codigo: 'explorador', nome: 'Explorador', descricao: 'Estudou 3 matérias diferentes.', icone: '🧭' },
}
