import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ProjectStatusCheckerProps {
  onStatusChange?: (isHealthy: boolean) => void;
}

export function ProjectStatusChecker({ onStatusChange }: ProjectStatusCheckerProps) {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10;

  const checkHealth = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/health`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        setStatus('healthy');
        onStatusChange?.(true);
        return true;
      } else {
        setStatus('unhealthy');
        onStatusChange?.(false);
        return false;
      }
    } catch (error) {
      console.log('Health check failed:', error);
      setStatus('unhealthy');
      onStatusChange?.(false);
      return false;
    }
  };

  useEffect(() => {
    checkHealth();

    // Retry every 10 seconds if unhealthy (reduced from 3 seconds)
    const interval = setInterval(async () => {
      if (status !== 'healthy' && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        await checkHealth();
      } else if (retryCount >= maxRetries) {
        // Stop retrying after max attempts
        clearInterval(interval);
      }
    }, 10000); // Changed from 3000 to 10000 (10 seconds)

    return () => clearInterval(interval);
  }, [status, retryCount]);

  if (status === 'healthy') {
    return null; // Don't show anything when healthy
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div 
        className="bg-white rounded-lg shadow-xl border-2 p-4 flex items-start gap-3"
        style={{ borderColor: status === 'checking' ? '#2d5a3d' : '#d94a4a' }}
      >
        {status === 'checking' && (
          <Loader2 className="w-5 h-5 animate-spin flex-shrink-0 mt-0.5" style={{ color: '#2d5a3d' }} />
        )}
        {status === 'unhealthy' && (
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#d94a4a' }} />
        )}
        
        <div className="flex-1">
          <h3 className="font-semibold mb-1" style={{ color: '#052311' }}>
            {status === 'checking' ? 'Перевірка з\'єднання...' : 'Сервер запускається'}
          </h3>
          <p className="text-sm" style={{ color: '#1e3a5f' }}>
            {status === 'checking' 
              ? 'Підключаємось до сервера...'
              : 'Проект Supabase відновлюється. Це може зайняти до 5 хвилин. Автоматична перевірка...'
            }
          </p>
          {status === 'unhealthy' && (
            <p className="text-xs mt-2" style={{ color: '#1e3a5f', opacity: 0.7 }}>
              Спроба {retryCount} з {maxRetries}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}