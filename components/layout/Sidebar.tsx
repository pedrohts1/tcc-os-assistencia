
import { View } from '@/lib/types'

type Props = {
  viewAtiva: View
  onChangeView: (view: View) => void
}

export default function Sidebar({ viewAtiva, onChangeView }: Props) {

  return (
    <nav className="sidebar">
        <button
            key={View.CriarOS} 
            onClick={() => onChangeView(View.CriarOS)}
            className={viewAtiva === View.CriarOS ? 'ativo' : ''}
        >
            Criar OS
        </button>
        <button
            key={View.ListarOS} 
            onClick={() => onChangeView(View.ListarOS)}
            className={viewAtiva === View.ListarOS ? 'ativo' : ''}
        >
            Listar OS
        </button>
      
        <button
            key={View.Clientes} 
            onClick={() => onChangeView(View.Clientes)}
            className={viewAtiva === View.Clientes ? 'ativo' : ''}
        >
            Clientes
        </button>
    </nav>
  )
}