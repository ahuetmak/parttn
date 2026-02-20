import React from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useState } from 'react';

export default function LogoDownload() {
  const [copied, setCopied] = useState(false);

  // SVG Code para copiar
  const svgCode = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <g filter="url(#glow)" stroke="#00F2A6" strokeWidth="2" fill="none">
    <path d="M50 15 L70 35 L50 40 L30 35 Z" strokeLinejoin="miter"/>
    <path d="M30 35 L50 40 L50 85 L20 45 Z" strokeLinejoin="miter"/>
    <path d="M70 35 L50 40 L50 85 L80 45 Z" strokeLinejoin="miter"/>
    <line x1="50" y1="40" x2="50" y2="85"/>
    <line x1="30" y1="35" x2="20" y2="45"/>
    <line x1="70" y1="35" x2="80" y2="45"/>
    <line x1="20" y1="45" x2="50" y2="85"/>
    <line x1="80" y1="45" x2="50" y2="85"/>
    <line x1="30" y1="35" x2="70" y2="35"/>
  </g>
</svg>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(svgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'partth-logo.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = (size: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fondo negro
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);

    const img = new Image();
    const svgBlob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob((blob) => {
        if (blob) {
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `partth-logo-${size}x${size}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
        }
      }, 'image/png');
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };

  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9]">
              Logo PARTTH
            </span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Descarga el logo oficial en diferentes formatos y tamaños
          </p>
        </div>

        {/* Logo Preview */}
        <div className="mb-16 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#00F2A6]/20 blur-3xl rounded-full" />
            <div className="relative bg-black border-2 border-[#00F2A6]/30 rounded-3xl p-16 shadow-2xl shadow-[#00F2A6]/20">
              <Logo size={200} className="text-[#00F2A6]" />
            </div>
          </div>
        </div>

        {/* Descargas */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* SVG */}
          <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0v8h12V6H4z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Formato SVG</h3>
                <p className="text-zinc-500 text-sm">Vector escalable (recomendado)</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownloadSVG}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all"
              >
                <Download className="w-5 h-5" />
                Descargar SVG
              </button>

              <button
                onClick={handleCopy}
                className="w-full px-6 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold flex items-center justify-center gap-2 hover:border-[#00F2A6]/30 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-[#00F2A6]" />
                    <span className="text-[#00F2A6]">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar código SVG
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 p-4 bg-black rounded-xl border border-zinc-800">
              <p className="text-zinc-500 text-xs mb-2 uppercase tracking-wider font-semibold">Ventajas:</p>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>• Escalable sin pérdida de calidad</li>
                <li>• Tamaño de archivo pequeño</li>
                <li>• Perfecto para web</li>
                <li>• Fácil de modificar colores</li>
              </ul>
            </div>
          </div>

          {/* PNG */}
          <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Formato PNG</h3>
                <p className="text-zinc-500 text-sm">Imágenes rasterizadas</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleDownloadPNG(512)}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold flex items-center justify-between hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  <span>512×512 px</span>
                </div>
                <span className="text-xs opacity-70">(Social media)</span>
              </button>

              <button
                onClick={() => handleDownloadPNG(1024)}
                className="w-full px-6 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold flex items-center justify-between hover:border-[#00F2A6]/30 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  <span>1024×1024 px</span>
                </div>
                <span className="text-xs text-zinc-500">(Alta calidad)</span>
              </button>

              <button
                onClick={() => handleDownloadPNG(2048)}
                className="w-full px-6 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold flex items-center justify-between hover:border-[#00F2A6]/30 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  <span>2048×2048 px</span>
                </div>
                <span className="text-xs text-zinc-500">(Impresión)</span>
              </button>
            </div>

            <div className="mt-6 p-4 bg-black rounded-xl border border-zinc-800">
              <p className="text-zinc-500 text-xs mb-2 uppercase tracking-wider font-semibold">Usos comunes:</p>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>• Perfiles de redes sociales</li>
                <li>• Favicon de sitio web</li>
                <li>• Material impreso</li>
                <li>• Presentaciones</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Brand Info */}
        <div className="mt-16 bg-zinc-900 border border-[#00F2A6]/20 rounded-2xl p-8">
          <h3 className="text-white font-bold text-2xl mb-6 flex items-center gap-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9]">
              Información de Marca
            </span>
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-zinc-500 text-sm uppercase tracking-wider mb-2">Nombre</p>
              <p className="text-white font-bold text-2xl">PARTTH</p>
            </div>
            <div>
              <p className="text-zinc-500 text-sm uppercase tracking-wider mb-2">Dominio</p>
              <p className="text-[#00F2A6] font-mono font-bold text-lg">partth.com</p>
            </div>
            <div>
              <p className="text-zinc-500 text-sm uppercase tracking-wider mb-2">Color Principal</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00F2A6] shadow-lg shadow-[#00F2A6]/50" />
                <span className="text-white font-mono">#00F2A6</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <p className="text-zinc-500 text-sm uppercase tracking-wider mb-3">Emails de Contacto</p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="px-4 py-3 bg-black rounded-lg border border-zinc-800">
                <p className="text-zinc-500 text-xs mb-1">Soporte</p>
                <p className="text-[#00F2A6] font-mono text-sm">support@partth.com</p>
              </div>
              <div className="px-4 py-3 bg-black rounded-lg border border-zinc-800">
                <p className="text-zinc-500 text-xs mb-1">Admin</p>
                <p className="text-[#00F2A6] font-mono text-sm">admin@partth.com</p>
              </div>
              <div className="px-4 py-3 bg-black rounded-lg border border-zinc-800">
                <p className="text-zinc-500 text-xs mb-1">Legal</p>
                <p className="text-[#00F2A6] font-mono text-sm">legal@partth.com</p>
              </div>
              <div className="px-4 py-3 bg-black rounded-lg border border-zinc-800">
                <p className="text-zinc-500 text-xs mb-1">Privacidad</p>
                <p className="text-[#00F2A6] font-mono text-sm">privacy@partth.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Código SVG */}
        <div className="mt-8 bg-zinc-900 border border-[#00F2A6]/20 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-xl">Código SVG</h3>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm font-bold flex items-center gap-2 hover:border-[#00F2A6]/30 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#00F2A6]" />
                  <span className="text-[#00F2A6]">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </button>
          </div>
          <pre className="bg-black rounded-xl p-4 overflow-x-auto border border-zinc-800">
            <code className="text-[#00F2A6] text-xs font-mono">{svgCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
