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
            Los datos actualmente se guardan en tu navegador. Para sincronizar con Google Sheets y compartir entre dispositivos, sigue estos pasos:
          </p>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li>Usa esta hoja: <a 
              href="https://docs.google.com/spreadsheets/d/1sJmsAry32FM0A1jlyM1bWI9VyyBHedX65PyLUNVahXI/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              GymCounter Spreadsheet
            </a></li>
            <li>Crea un proyecto en la <a 
              href="https://console.cloud.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Google Cloud Console
            </a></li>
            <li>Habilita la <b>Google Sheets API</b> en tu proyecto</li>
            <li>Crea una <b>Clave API</b> o <b>Service Account</b></li>
            <li>Comparte la hoja con el correo de la service account</li>
            <li>Agrega las credenciales al código</li>
          </ol>
          
          <p className="mt-3">
            Para configurar esto, puedes contactar con el desarrollador para asistencia o ver la <a 
              href="https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              documentación detallada
            </a>.
          </p>
        </div>
      )}
    </div>
  );
} 