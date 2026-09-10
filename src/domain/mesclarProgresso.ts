import type { ProgressoQuestao } from './tipos'

// Resolve conflito quando a mesma questão foi respondida em dois aparelhos offline
// (seção 5 do PLANO_APP_ESTUDOS.md): vence a linha com `ultimaResposta` mais recente,
// exceto a caixa — nessa, vence sempre o MENOR valor (se errou em algum lugar, precisa
// revisar de novo; é o desempate mais seguro pedagogicamente).
export function mesclarProgresso(local: ProgressoQuestao, remoto: ProgressoQuestao): ProgressoQuestao {
  const localGanha = new Date(local.ultimaResposta).getTime() >= new Date(remoto.ultimaResposta).getTime()
  const vencedor = localGanha ? local : remoto

  return {
    questaoId: local.questaoId,
    caixa: Math.min(local.caixa, remoto.caixa),
    acertos: vencedor.acertos,
    erros: vencedor.erros,
    proximaRevisao: vencedor.proximaRevisao,
    ultimaResposta: vencedor.ultimaResposta,
  }
}
