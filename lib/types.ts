
export const View = {
  CriarOS:     'criar-os',
  ListarOS:    'listar-os',
  Clientes:    'clientes',
} as const

export type View = typeof View[keyof typeof View]

export interface ClienteInfo {
  id: number
  nome: string
  cpf: string
  telefone: string
  email: string
  endereco: string
}

export interface OSInfo {
  id: number
  stat: string
  tipo_os: string
  tipo_atendimento: string
  defeito_relatado: string
  acessorios: string
  aparencia: string
  observacoes: string
  data_entrada: string
  equip_id: number
  equip_tipo: string
  marca: string
  modelo: string
  numero_serie: string
  codigos_patrimonio: string
}
