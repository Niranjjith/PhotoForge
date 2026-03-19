# PayPal Payment Integration Guide

## Overview
Provider registration requires a one-time payment of ₹10 (approximately $0.15 USD) via PayPal. After successful payment, providers receive a premium PDF bill and full access to the provider dashboard.

## Setup Instructions

### 1. PayPal Credentials
The PayPal Client ID and Secret are already configured in `config/paypal.js`:
- Client ID: `AXJNJlnWdCi3zsB4ABAu4JvjZk_8sIK_jGXKeUP2CLr8_ZkG6yNXSGYn1VvrBOwvFfZNFVuRECwOfDh7`
- Client Secret: `EMcPbxzxggFxhor2oBOx1VjF9_NUnkmyRDcLAzwWZp5CpD5XzM-CvHK1J9HEyV7jUCh5NuYeBWx4pKWo`

**Note:** These are sandbox credentials. For production, update them in your `.env` file:
```env
PAYPAL_CLIENT_ID=your_production_client_id
PAYPAL_CLIENT_SECRET=your_production_client_secret
```

### 2. Environment Variables
Add to your `.env` file (optional, defaults are already set):
```env
PAYPAL_CLIENT_ID=AXJNJlnWdCi3zsB4ABAu4JvjZk_8sIK_jGXKeUP2CLr8_ZkG6yNXSGYn1VvrBOwvFfZNFVuRECwOfDh7
PAYPAL_CLIENT_SECRET=EMcPbxzxggFxhor2oBOx1VjF9_NUnkmyRDcLAzwWZp5CpD5XzM-CvHK1J9HEyV7jUCh5NuYeBWx4pKWo
```

### 3. Dependencies
All required packages are installed:
- `@paypal/checkout-server-sdk` - PayPal server-side SDK
- `pdfkit` - PDF generation for bills

## Payment Flow

### For Providers:
1. **Registration**: User selects "Catering Provider" during registration
2. **Account Creation**: User account is created but role is set to "customer" initially
3. **Payment Page**: User is redirected to `/auth/provider-payment`
4. **PayPal Payment**: User completes payment via PayPal
5. **Payment Verification**: Server verifies and captures payment
6. **PDF Generation**: Premium PDF bill is automatically generated
7. **Account Activation**: User role is upgraded to "provider"
8. **Success Page**: User sees success page with PDF download link
9. **Dashboard Access**: User is redirected to provider dashboard

### Payment Routes:
- `POST /payments/create-order` - Creates PayPal order
- `GET /payments/success` - Handles successful payment
- `GET /payments/cancel` - Handles cancelled payment
- `GET /payments/success-page` - Shows success page with PDF download
- `GET /payments/bill/:paymentId` - Downloads PDF bill

## PDF Bill Features

The generated PDF bill includes:
- Bill number and date
- Customer details (name, email)
- Payment details (Payment ID, PayPal Order ID, amount)
- Service description
- Professional formatting
- Downloadable from success page

## Testing

### Sandbox Testing:
1. Use PayPal sandbox test accounts
2. Payment amount: $0.15 USD (₹10 INR)
3. Test with different payment scenarios:
   - Successful payment
   - Cancelled payment
   - Failed payment

### Test Accounts:
Create test accounts at: https://developer.paypal.com/dashboard/

## Production Deployment

1. **Update PayPal Credentials**: Replace sandbox credentials with production credentials
2. **Update Environment**: Change to `LiveEnvironment` in `config/paypal.js`
3. **Update Client ID**: Update PayPal SDK client ID in `views/auth/provider-payment.ejs`
4. **Test Thoroughly**: Test payment flow in production mode

## Troubleshooting

### Payment Not Completing:
- Check PayPal credentials are correct
- Verify session is maintained during payment flow
- Check server logs for errors

### PDF Not Generating:
- Ensure `public/bills` directory exists and is writable
- Check file permissions
- Verify PDF generation library is installed

### User Not Upgraded to Provider:
- Check payment status in database
- Verify payment completion callback is working
- Check user role update logic

## Database Schema

### Payment Model:
```javascript
{
  user: ObjectId (ref: User),
  orderId: String (unique),
  paymentId: String,
  amount: Number,
  currency: String (default: "INR"),
  status: String (pending|completed|failed|cancelled),
  paypalOrderId: String,
  billPdf: String (path to PDF),
  createdAt: Date,
  completedAt: Date
}
```

## Security Notes

- Payment verification happens server-side
- PayPal order IDs are stored for verification
- PDF bills are stored in `public/bills` directory
- Session-based payment tracking prevents duplicate payments
- All payment operations are logged

