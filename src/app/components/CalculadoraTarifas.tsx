import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export function CalculadoraTarifas() {
  const [totalProducto, setTotalProducto] = useState(2500);
  const [comisionSocio, setComisionSocio] = useState(25);

  const feePARTTH = totalProducto * 0.15;
  const gananciaSocio = totalProducto * (comisionSocio / 100);
  const netoMarca = totalProducto - feePARTTH - gananciaSocio;

  return (
    <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/30 rounded-3xl p-8 mb-16 shadow-[0_0_60px_rgba(0,242,166,0.15)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center">
          <Calculator className="w-6 h-6 text-[#00F2A6]" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Calculadora Rápida</h2>
          <p className="text-[#64748B]">Simula tu compensación en tiempo real</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          {/* Total del Producto */}
          <div>
            <label className="block text-white font-semibold mb-3">
              Total del Producto (Diamantes 💎)
            </label>
            <div className="bg-black/60 border border-[#00F2A6]/20 rounded-xl p-4">
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={totalProducto}
                onChange={(e) => setTotalProducto(Number(e.target.value))}
                className="w-full mb-3"
              />
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="100"
                  max="10000"
                  value={totalProducto}
                  onChange={(e) => setTotalProducto(Number(e.target.value))}
                  className="flex-1 bg-black/60 border border-[#00F2A6]/20 rounded-lg px-4 py-2 text-white text-xl font-bold focus:outline-none focus:border-[#00F2A6]"
                />
                <span className="text-2xl">💎</span>
              </div>
            </div>
          </div>

          {/* Comisión Socio */}
          <div>
            <label className="block text-white font-semibold mb-3">
              Comisión del Socio (%)
            </label>
            <div className="bg-black/60 border border-[#0EA5E9]/20 rounded-xl p-4">
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={comisionSocio}
                onChange={(e) => setComisionSocio(Number(e.target.value))}
                className="w-full mb-3"
              />
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={comisionSocio}
                  onChange={(e) => setComisionSocio(Math.min(40, Math.max(0, Number(e.target.value))))}
                  className="flex-1 bg-black/60 border border-[#0EA5E9]/20 rounded-lg px-4 py-2 text-white text-xl font-bold focus:outline-none focus:border-[#0EA5E9]"
                />
                <span className="text-white text-xl">%</span>
              </div>
              <p className="text-[#64748B] text-xs mt-2">
                Default: 25% • Máximo editable por Marca: 40%
              </p>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          <div className="bg-black/60 rounded-xl p-5 border border-[#00F2A6]/10">
            <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-2">
              Total del Producto
            </p>
            <p className="text-4xl font-bold text-white">{totalProducto.toLocaleString()} 💎</p>
            <p className="text-[#94A3B8] text-sm mt-1">${totalProducto.toLocaleString()} USD</p>
          </div>

          <div className="bg-black/60 rounded-xl p-5 border border-[#F59E0B]/10">
            <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-2">
              Fee PARTH (15%)
            </p>
            <p className="text-3xl font-bold text-[#F59E0B]">-{feePARTTH.toLocaleString()} 💎</p>
            <p className="text-[#64748B] text-sm mt-1">Protección + procesamiento</p>
          </div>

          <div className="bg-black/60 rounded-xl p-5 border border-[#0EA5E9]/10">
            <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-2">
              Ganancia Socio ({comisionSocio}%)
            </p>
            <p className="text-3xl font-bold text-[#0EA5E9]">{gananciaSocio.toLocaleString()} 💎</p>
            <p className="text-[#64748B] text-sm mt-1">${gananciaSocio.toLocaleString()} USD</p>
          </div>

          <div className="bg-gradient-to-r from-[#10B981]/20 to-[#10B981]/10 rounded-xl p-5 border border-[#10B981]/30">
            <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-2">
              Neto Marca
            </p>
            <p className="text-4xl font-bold text-[#10B981]">{netoMarca.toLocaleString()} 💎</p>
            <p className="text-[#10B981] text-sm mt-1">
              {((netoMarca / totalProducto) * 100).toFixed(1)}% del total • ${netoMarca.toLocaleString()} USD
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-[#00F2A6]/10 border border-[#00F2A6]/20 rounded-xl">
        <p className="text-[#00F2A6] text-center font-semibold">
          ⚡ Se cobra solo cuando se libera el pago • Sin costos ocultos
        </p>
      </div>
    </div>
  );
}