const FUSO_HORARIO = 'America/Sao_Paulo'

function formatarDataBrasil(data: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO_HORARIO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(data)
}

export { formatarDataBrasil, FUSO_HORARIO }
