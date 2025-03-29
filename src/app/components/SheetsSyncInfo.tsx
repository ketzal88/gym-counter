'use client';

import { useState } from 'react';

export default function SheetsSyncInfo() {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="w-full max-w-md mx-auto mt-8 mb-8 bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-blue-800">
          <span className="mr-2">📊</span> 
          Sincronización con Google Sheets
        </h3>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-blue-700 hover:text-blue-900"
        >
          {expanded ? '▲ Ocultar' : '▼ Mostrar'}
        </button>
      </div>
      
      {expanded && (
        <div className="mt-4 text-sm text-blue-700">
          <p className="mb-3">
            Los datos se guardan en tu navegador y se sincronizan con Google Sheets para compartir entre dispositivos.
          </p>
          
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-100 rounded">
            <h4 className="font-medium text-yellow-800 mb-2">Configuración de credenciales</h4>
            <p className="mb-2">Para sincronizar con Google Sheets, necesitas configurar las credenciales de Service Account:</p>
            <ol className="list-decimal pl-5 space-y-1 text-yellow-700">
              <li>Descarga el archivo JSON de credenciales desde Google Cloud Console</li>
              <li>Copia la <code>private_key</code> del archivo JSON</li>
              <li>Modifica el archivo <code>.env.local</code> y pega la clave privada en la variable <code>GOOGLE_PRIVATE_KEY</code></li>
              <li>Asegúrate de reemplazar los saltos de línea con <code>\n</code></li>
              <li>Reinicia la aplicación para aplicar los cambios</li>
            </ol>
          </div>
          
          <p className="mb-2">
            Hoja de cálculo en uso: <a 
              href="https://docs.google.com/spreadsheets/d/1sJmsAry32FM0A1jlyM1bWI9VyyBHedX65PyLUNVahXI/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              GymCounter Spreadsheet
            </a>
          </p>
          
          <p className="mb-2">
            Cuenta de servicio: <code className="bg-blue-100 px-1 rounded text-blue-800">
              gymcounter@possible-byte-351918.iam.gserviceaccount.com
            </code>
          </p>
          
          <p>
            Asegúrate de que has compartido la hoja de cálculo con esta cuenta de servicio con permisos de editor.
          </p>
        </div>
      )}
    </div>
  );
} 