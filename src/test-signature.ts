// Test signature generation for WayForPay
import { createHmac } from 'node:crypto';

const MERCHANT_LOGIN = 'adventresurs_space';
const MERCHANT_SECRET_KEY = '99a97987a610ae0f7443d490a994e8c9fb211900';

// Example data
const merchantDomainName = 'advent-calendar.com';
const orderReference = 'advent-test-1234567890';
const orderDate = 1732022400;
const amount = 10;
const currency = 'EUR';
const productName = 'Світло';
const productCount = 1;
const productPrice = 10;

// According to WayForPay documentation for purchase request:
// merchantAccount;merchantDomainName;orderReference;orderDate;amount;currency;productName;productCount;productPrice

const signatureFields = [
  MERCHANT_LOGIN,
  merchantDomainName,
  orderReference,
  orderDate.toString(),
  amount.toString(),
  currency,
  productName,
  productCount.toString(),
  productPrice.toString()
];

const signatureString = signatureFields.join(';');
console.log('Signature string:', signatureString);

const signature = createHmac('md5', MERCHANT_SECRET_KEY)
  .update(signatureString)
  .digest('hex');

console.log('Generated signature:', signature);

// Output the full payment data that would be sent to WayForPay
console.log('\nPayment data:');
console.log({
  merchantAccount: MERCHANT_LOGIN,
  merchantDomainName,
  orderReference,
  orderDate,
  amount,
  currency,
  productName: [productName],
  productCount: [productCount],
  productPrice: [productPrice],
  merchantSignature: signature
});
