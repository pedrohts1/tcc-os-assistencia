
export const View = {
  CriarOS:     'criar-os',
  ListarOS:    'listar-os',
  Clientes:    'clientes',
} as const

export type View = typeof View[keyof typeof View]