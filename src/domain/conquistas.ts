export interface ContextoConquistas {
  moduloConcluidoAgora: boolean
  capituloDominadoAgora: boolean
  ofensivaAtual: number
  revisoesEmDiaTotal: number
  filaVazia: boolean
  maiorSequenciaAcertosNaSessao: number
  materiasComProgresso: number
  conquistasJaObtidas: string[]
}

// As 7 conquistas de exemplo da seção 7 do PLANO_APP_ESTUDOS.md, com regra fixa em código —
// não um interpretador genérico da coluna `regra` (jsonb) do banco, que só serve de metadado
// de exibição. Retorna os códigos NOVOS (que ainda não estavam em conquistasJaObtidas).
export function avaliarConquistas(contexto: ContextoConquistas): string[] {
  const jaTem = (codigo: string) => contexto.conquistasJaObtidas.includes(codigo)
  const novas: string[] = []

  if (contexto.moduloConcluidoAgora && !jaTem('primeiro_modulo')) novas.push('primeiro_modulo')
  if (contexto.capituloDominadoAgora && !jaTem('capitulo_completo')) novas.push('capitulo_completo')
  if (contexto.ofensivaAtual >= 7 && !jaTem('sete_dias')) novas.push('sete_dias')
  if (contexto.revisoesEmDiaTotal >= 50 && !jaTem('cinquenta_revisoes')) novas.push('cinquenta_revisoes')
  if (contexto.filaVazia && !jaTem('fila_zerada')) novas.push('fila_zerada')
  if (contexto.maiorSequenciaAcertosNaSessao >= 20 && !jaTem('vinte_seguidas')) novas.push('vinte_seguidas')
  if (contexto.materiasComProgresso >= 3 && !jaTem('explorador')) novas.push('explorador')

  return novas
}
