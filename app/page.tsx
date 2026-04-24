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

  return (
    <div className="layout">
      <Sidebar viewAtiva={viewAtiva} onChangeView={setViewAtiva} />
      <div className="quadro">
        <Header />
        <main className="conteudo">
          {
            (() => {
              switch (viewAtiva) {
                case View.CriarOS:
                  return <CriarOS />
                case View.Clientes:
                  return <Clientes />
                default:
                  return <ListarOS />
              }
            })()
          }
        </main>
      </div>
    </div>
  );
}
