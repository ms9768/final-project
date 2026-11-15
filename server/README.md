# Payment management configuration

Bank account details are encrypted with AES-256-GCM. Configure
`BANK_DETAILS_ENCRYPTION_KEY` as a 32-byte key encoded in Base64 or 64
hexadecimal characters. Generate a Base64 key locally with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Keep the key in the server's secret environment configuration, never in source
control. Back it up securely: existing encrypted bank details cannot be read if
the key is lost or changed without re-encrypting the data.

Facilitator registration also requires the existing Brevo settings
`BREVO_API_KEY` and `BREVO_SENDER_EMAIL`; set `CLIENT_URL` to the public
frontend URL so the single-use bank-details link points to the right app.
Set the client build variable `VITE_API_URL` to the HTTPS API origin when
deploying outside local development.
Serve the application and API over HTTPS outside local development so bank
details are protected in transit.

Create a separate payment-manager account from an interactive server terminal:

```sh
npm run create:payment-manager
```

The password is entered without terminal echo. Payment managers are not
registered through the public facilitator registration form.

Payment exports are internal preparation workbooks. The application does not
initiate bank transfers or connect to a payment provider. Payment state changes
are isolated in `services/paymentProcessingService.js` as the future integration
point for a transfer adapter.
