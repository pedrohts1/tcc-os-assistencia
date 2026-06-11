'use client'

import { useState } from 'react'
import { View } from '@/lib/types'

import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import CriarOS from '@/components/telas/CriarOS'
import ListarOS from '@/components/telas/ListarOS'
import Clientes from '@/components/telas/Clientes'

export default function Home() {
  const [viewAtiva, setViewAtiva] = useState<View>(View.ListarOS)
  const [toastOS, setToastOS] = useState<number | null>(null)
  const [clienteFiltro, setClienteFiltro] = useState<{ id: number, nome: string } | null>(null)

  function handleChangeView(view: View) {
    setViewAtiva(view)
    setClienteFiltro(null)
  }

  function handleOSSalva(idOrdem: number) {
    setViewAtiva(View.ListarOS)
    setClienteFiltro(null)
    setToastOS(idOrdem)
    setTimeout(() => setToastOS(null), 4000)
  }

  function handleVerOSCliente(id: number, nome: string) {
    setClienteFiltro({ id, nome })
    setViewAtiva(View.ListarOS)
  }

  return (
    <div className="layout">
      <Sidebar viewAtiva={viewAtiva} onChangeView={handleChangeView} />
      <div className="quadro">
        <Header />
        {toastOS && (
          <div className="toast">
            OS #{toastOS} criada com sucesso!
          </div>
        )}
        <main className="conteudo">
          {
            (() => {
              switch (viewAtiva) {
                case View.CriarOS:
                  return (
                    <CriarOS
                      onCancelar={() => setViewAtiva(View.ListarOS)}
                      onSalvar={handleOSSalva}
                    />
                  )
                case View.Clientes:
                  return <Clientes onVerOS={handleVerOSCliente} />
                default:
                  return (
                    <ListarOS
                      clienteFiltro={clienteFiltro}
                      onLimparFiltro={() => setClienteFiltro(null)}
                    />
                  )
              }
            })()
          }
        </main>
      </div>
    </div>
  );
}
