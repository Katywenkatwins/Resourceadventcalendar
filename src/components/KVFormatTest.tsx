import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

export function KVFormatTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Starting KV format test...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/test-kv-format`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      console.log('Test result:', data);
      
      // Check if data is correctly formatted
      const isCorrect = 
        data.success &&
        data.types.original === 'object' &&
        data.types.retrieved === 'object' &&
        JSON.stringify(data.original) === JSON.stringify(data.retrieved);

      setResult({
        ...data,
        isCorrect
      });

    } catch (error) {
      console.error('Test failed:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Тест формату KV Store
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Цей тест перевіряє чи дані зберігаються в базі даних у правильному форматі.
        </p>

        <Button 
          onClick={runTest} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Тестування...
            </>
          ) : (
            'Запустити тест'
          )}
        </Button>

        {result && (
          <div className="space-y-4 mt-4">
            <div className={`flex items-center gap-2 p-4 rounded-lg ${
              result.isCorrect 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {result.isCorrect ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">✅ Тест пройдено!</p>
                    <p className="text-sm text-green-700">Дані зберігаються правильно</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-800">❌ Тест НЕ пройдено</p>
                    <p className="text-sm text-red-700">
                      {result.error || 'Дані зберігаються у неправильному форматі'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {result.success && (
              <div className="space-y-2 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-semibold mb-1">Оригінальні дані:</p>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(result.original, null, 2)}
                  </pre>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-semibold mb-1">Отримані дані:</p>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(result.retrieved, null, 2)}
                  </pre>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-semibold mb-1">Типи:</p>
                  <p className="text-xs">
                    Original: <code>{result.types.original}</code><br />
                    Retrieved: <code>{result.types.retrieved}</code>
                  </p>
                </div>
              </div>
            )}

            {result.isCorrect && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Наступний крок:</strong> Очистіть базу даних від старих записів:
                </p>
                <pre className="text-xs mt-2 bg-white p-2 rounded border">
                  DELETE FROM kv_store_dc8cbf1f WHERE key LIKE 'user:%';
                </pre>
              </div>
            )}

            {!result.success && result.error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Помилка:</strong> {result.error}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
