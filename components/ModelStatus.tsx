'use client';

import { useEffect, useState } from 'react';
import { checkModelHealth, getModelInfo } from '@/lib/local-model';

export default function ModelStatus() {
  const [status, setStatus] = useState<any>(null);
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const checkModel = async () => {
      const health = await checkModelHealth();
      const modelInfo = await getModelInfo();
      setStatus(health);
      setInfo(modelInfo);
    };

    checkModel();
    const interval = setInterval(checkModel, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  // Extract model_loaded from flask_api or direct status
  const modelLoaded = status.flask_api?.model_loaded || status.model_loaded || false;
  const mode = status.flask_api?.mode || status.mode || 'unknown';
  const connected = status.connected !== false;

  return (
    <div className={`p-4 rounded-lg border ${modelLoaded && connected ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${modelLoaded && connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {modelLoaded && connected ? '🤖 Local ML Model Active' : '❌ Model Not Loaded'}
          </h3>
          {modelLoaded && connected && (
            <div className="text-xs text-gray-600 mt-1">
              <p>Mode: {mode}</p>
              {info && info.loaded && (
                <>
                  <p>Type: {info.type}</p>
                  {info.n_features && <p>Features: {info.n_features}</p>}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
