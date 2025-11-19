import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function PaymentDebug() {
  const [merchantSecret, setMerchantSecret] = useState('99a97987a610ae0f7443d490a994e8c9fb211900');
  const [signatureInfo, setSignatureInfo] = useState<any>(null);

  const testSignature = async () => {
    try {
      // Test data
      const testData = {
        merchantAccount: 'adventresurs_space',
        merchantDomainName: 'advent-calendar.com',
        orderReference: `test-${Date.now()}`,
        orderDate: Math.floor(Date.now() / 1000),
        amount: 10,
        currency: 'EUR',
        productName: 'Світло',
        productCount: 1,
        productPrice: 10
      };

      // Generate signature string
      const signatureFields = [
        testData.merchantAccount,
        testData.merchantDomainName,
        testData.orderReference,
        testData.orderDate.toString(),
        testData.amount.toString(),
        testData.currency,
        testData.productName,
        testData.productCount.toString(),
        testData.productPrice.toString()
      ];

      const signatureString = signatureFields.join(';');

      // Generate signature using Web Crypto API
      const encoder = new TextEncoder();
      const keyData = encoder.encode(merchantSecret);
      const messageData = encoder.encode(signatureString);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const hashArray = Array.from(new Uint8Array(signature));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      setSignatureInfo({
        signatureString,
        signature: hashHex,
        paymentData: {
          ...testData,
          productName: [testData.productName],
          productCount: [testData.productCount],
          productPrice: [testData.productPrice],
          merchantSignature: hashHex
        }
      });
    } catch (error) {
      console.error('Error testing signature:', error);
      setSignatureInfo({ error: error.message });
    }
  };

  return (
    <Card className="max-w-4xl mx-auto m-8">
      <CardHeader>
        <CardTitle>WayForPay Signature Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Merchant Secret Key</Label>
          <Input
            type="text"
            value={merchantSecret}
            onChange={(e) => setMerchantSecret(e.target.value)}
            placeholder="Enter merchant secret key"
          />
        </div>

        <Button onClick={testSignature}>
          Test Signature Generation
        </Button>

        {signatureInfo && (
          <div className="space-y-4 mt-4">
            {signatureInfo.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800">Error: {signatureInfo.error}</p>
              </div>
            ) : (
              <>
                <div>
                  <Label>Signature String:</Label>
                  <pre className="p-4 bg-gray-50 border rounded text-xs overflow-x-auto">
                    {signatureInfo.signatureString}
                  </pre>
                </div>

                <div>
                  <Label>Generated Signature (HMAC-SHA256):</Label>
                  <pre className="p-4 bg-gray-50 border rounded text-xs overflow-x-auto break-all">
                    {signatureInfo.signature}
                  </pre>
                </div>

                <div>
                  <Label>Full Payment Data:</Label>
                  <pre className="p-4 bg-gray-50 border rounded text-xs overflow-x-auto">
                    {JSON.stringify(signatureInfo.paymentData, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-semibold mb-2">Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Get your Merchant Secret Key from WayForPay dashboard</li>
            <li>Enter it in the field above</li>
            <li>Click "Test Signature Generation"</li>
            <li>Copy the signature and test it with WayForPay API</li>
            <li>If it works, update the WAYFORPAY_MERCHANT_PASSWORD environment variable</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
