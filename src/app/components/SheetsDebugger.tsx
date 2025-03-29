'use client';

import { useState } from 'react';

export default function SheetsDebugger() {
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const addLog = (message: string) => {
    setDebugLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };
  
  const testConnection = async () => {
    addLog('Intentando conectar con Google Sheets a través de la API...');
    
    try {
      // Probar conexión llamando a la API
      const response = await fetch('/api/sheets?type=users');
      const data = await response.json();
      
      if (response.ok) {
        addLog('✅ Conexión exitosa con la API del servidor');
        addLog(`Usuarios encontrados: ${data.users?.length || 0}`);
        
        // Verificar conexión con Google Sheets comprobando si hay usuarios predeterminados
        const hasDefaultUsers = data.users?.length === 2 && 
          data.users[0]?.name === 'Gabi' && 
          data.users[1]?.name === 'Iña';
          
        if (hasDefaultUsers) {
          addLog('⚠️ Se están usando usuarios predeterminados, lo que puede indicar que:');
          addLog('  - No se pudo conectar con Google Sheets');
          addLog('  - No se encontró la hoja "Users" o está vacía');
          addLog('  - La clave privada puede ser inválida');
        } else {
          addLog('✅ Se obtuvieron usuarios reales de Google Sheets');
        }
        
        // Probar obtención de visitas
        addLog('Obteniendo visitas...');
        const visitsResponse = await fetch('/api/sheets?type=visits');
        const visitsData = await visitsResponse.json();
        
        if (visitsResponse.ok) {
          addLog(`✅ Visitas encontradas: ${visitsData.visits?.length || 0}`);
        } else {
          addLog('❌ Error al obtener visitas');
        }
      } else {
        addLog(`❌ Error al conectar: ${data.error || 'Error desconocido'}`);
        addLog('Posibles problemas:');
        addLog('1. La clave privada puede ser inválida');
        addLog('2. La cuenta de servicio no tiene acceso a la hoja');
        addLog('3. La hoja de cálculo no existe o no es accesible');
      }
    } catch (error) {
      addLog(`❌ Error inesperado: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const clearLogs = () => {
    setDebugLog([]);
  };
  
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700"
        >
          🐞 Depurador
        </button>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium">Depurador de Google Sheets</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="p-4 flex space-x-2">
          <button
            onClick={testConnection}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Probar Conexión
          </button>
          <button
            onClick={clearLogs}
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
          >
            Limpiar Logs
          </button>
        </div>
        
        <div className="p-4 overflow-auto flex-1 bg-gray-100 font-mono text-sm">
          {debugLog.length === 0 ? (
            <p className="text-gray-500">Haz clic en &quot;Probar Conexión&quot; para diagnosticar problemas.</p>
          ) : (
            <pre className="whitespace-pre-wrap">
              {debugLog.join('\n')}
            </pre>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <h4 className="font-medium mb-2">Soluciones comunes:</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Verifica que el archivo <code>.env.local</code> contenga la clave privada correcta</li>
            <li>Asegúrate de que la cuenta de servicio tenga acceso a la hoja de cálculo</li>
            <li>Comprueba que la hoja tiene las pestañas &quot;Users&quot; y &quot;Visits&quot;</li>
            <li>Reinicia el servidor después de modificar el archivo <code>.env.local</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
} 