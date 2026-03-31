# Stellar Connect Wallet 🌟

A modern, premium web application for managing Stellar (XLM) assets with seamless Freighter wallet integration, built with React and custom CSS.

![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![Stellar SDK](https://img.shields.io/badge/Stellar%20SDK-15.0-black?logo=stellar)
![Freighter](https://img.shields.io/badge/Freighter-6.0-purple)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-success)

---

## ✨ Features

- **🔗 Wallet Connection**: Seamlessly connect your Freighter wallet with one click
- **💰 Balance Display**: Real-time XLM balance from the Stellar Network
- **📬 Send XLM**: Transfer XLM tokens to other Stellar addresses with memo support
- **📝 Memo Support**: Attach optional text memos (up to 28 characters) to transactions
- **📋 Address Management**: Copy your full public address to clipboard instantly
- **💧 Friendbot Funding**: Fund your testnet wallet directly from the app
- **🔐 Secure**: No private keys stored locally — all transactions signed by Freighter
- **📊 Step Progress**: Visual Validate → Sign → Submit progress bar during transactions
- **🎨 Premium UI**: Glassmorphic cards, grid background, smooth micro-animations
- **🌙 Dark Theme**: Professional dark navy design with indigo accents
- **⚡ XDR Fallbacks**: Progressive SDK compatibility for transaction reconstruction

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- [Freighter Wallet](https://www.freighter.app/) browser extension installed

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

The app will open at `https://localhost:3000`

### Build for Production

```bash
npm run build
```

---

## 📖 How to Use

### 1. **Connect Your Wallet**
   - Click the "Connect Freighter" button on the landing screen
   - Approve the connection in your Freighter wallet popup
   - Your portfolio dashboard will appear instantly

### 2. **View Your Portfolio**
   - Your XLM balance is displayed prominently in the Portfolio card
   - See your full Stellar address with one-click copy
   - Balance shows "Stellar Lumens • Testnet" network label

### 3. **Fund Your Wallet**
   - Click "Fund via Friendbot" to receive free testnet XLM
   - Click "Refresh Balance" to update your balance

### 4. **Send XLM**
   - Enter the destination Stellar address (starts with G, 56 characters)
   - Enter the amount and optional memo
   - Watch the step progress bar: Validate → Sign → Submit
   - Sign the transaction in the Freighter popup
   - See the confirmation with transaction hash

---

## 📸 Screenshots

### Landing Page
Connect screen with wallet icon, feature badges (Secure, Instant, Testnet), and Connect Freighter button.

![Landing Page](./public/Landing%20Page.png)

### Wallet Connected with Balance Display
Portfolio dashboard showing full address, XLM balance, and action buttons for Fund/Refresh.

![Wallet Connected](./public/Wallet%20connected.png)

### Successful Testnet Transaction
Send XLM form with step progress bar and transaction confirmed success toast.

![Successful Transaction](./public/transaction%20complete.png)

### Successful Testnet Transaction Proof
Stellar Expert explorer showing the verified transaction on the Stellar Testnet.

![Successful Transaction](./public/steeler%20expert.png)

---

# TRANSACTION PROOF

```
Transaction Id : d7137d4c92399febb580debf30af666589093d1e2eb1c07c2993162f8d038187
Processed      : 2026-03-31 16:28:22 UTC

```


---

## 🏗️ Project Structure

```
stellar-connect-wallet/
├── src/
│   ├── components/
│   │   └── Freighter.js              # Freighter API & Stellar SDK integration
│   ├── hooks/
│   │   └── useStellarTransaction.js  # Reusable transaction hook
│   ├── App.js                        # Main app component
│   ├── App.css                       # App styles & UI components
│   ├── App.test.js                   # Unit tests
│   ├── index.js                      # Entry point
│   ├── index.css                     # Global styles & design tokens
│   ├── logo.svg                      # App logo
│   ├── reportWebVitals.js            # Performance monitoring
│   └── setupTests.js                 # Test configuration
├── public/
│   ├── index.html                    # HTML template
│   ├── manifest.json                 # PWA manifest
│   ├── robots.txt                    # SEO config
│   ├── Landing Page.png              # Screenshot - landing page
│   ├── Wallet connected.png          # Screenshot - wallet connected
│   ├── transaction complete.png      # Screenshot - transaction complete
│   └── steeler expert.png            # Screenshot - Stellar Expert proof
├── package.json                      # Dependencies & scripts
├── package-lock.json                 # Locked dependency tree
└── README.md                         # This file
```

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19.2](https://react.dev/)
- **Styling**: Vanilla CSS with custom design tokens & glassmorphism
- **Blockchain Integration**: 
  - [@stellar/stellar-sdk 15.0](https://developers.stellar.org/docs/reference/sdk-reference)
  - [@stellar/freighter-api 6.0](https://www.freighter.app/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Polyfills**: `buffer`, `process` (for Stellar SDK browser compatibility)
- **Build Tool**: [Create React App](https://create-react-app.dev/) with `cross-env`

---

## 🔧 Key Components

### Freighter.js
Handles all blockchain interactions and transaction logic:
- `checkConnection()` — Verify Freighter extension is installed
- `retrievePublicKey()` — Get user's Stellar public key
- `getBalance()` — Fetch XLM balance from Horizon
- `fundWallet()` — Fund account via Stellar Friendbot
- `validateTransactionInputs()` — Validate recipient address & amount
- `sendPayment()` — Full transaction flow: build → sign → reconstruct XDR → submit

### useStellarTransaction.js (Hook)
Reusable React hook wrapping the transaction lifecycle:
- Granular status tracking: `idle` → `validating` → `signing` → `submitting` → `success`
- Returns `{ execute, loading, error, txHash, status, reset }`
- Drives the step progress bar UI in the Send XLM card

---

## 🌐 Network

This application runs on the **Stellar Test Network (Testnet)**.

- **Horizon API**: `https://horizon-testnet.stellar.org`
- **Network Passphrase**: `Test SDF Network ; September 2015`

⚠️ **Note**: No real XLM is used. For testnet lumens, visit the [Stellar Testnet Friendbot](https://laboratory.stellar.org/?network=test#friendbot)

---

## 🔐 Security

- **Private Keys**: Never stored or transmitted - Freighter handles signing
- **Network**: Uses HTTPS for all API calls
- **Testnet Only**: Safe for development and testing
- **No Backend**: All transactions happen directly on-chain

---

## 🎨 UI Features

- **Glassmorphic Cards**: Frosted glass effect with backdrop blur
- **Grid Background**: Subtle grid pattern for depth
- **Step Progress Bar**: Visual Validate → Sign → Submit flow
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Navy Theme**: Premium dark UI with indigo accent system
- **Micro-animations**: Slide-up toasts, shimmer effects, pulse dots
- **SVG Icon System**: Hand-crafted inline SVG icons throughout
- **Copy to Clipboard**: One-click address copy with checkmark feedback
- **Loading Spinners**: Context-aware spinners on all async operations
- **Error/Success Toasts**: Color-coded status messages with icons

---

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any browser supporting ES6+ and WebGL

---

## 🚦 Getting Started with Freighter

1. **Install Freighter**:
   - Visit [freighter.app](https://www.freighter.app/)
   - Install for Chrome, Firefox, or Edge

2. **Create/Import Account**:
   - Create a new account or import existing one
   - Save your secret key securely

3. **Add Testnet Account**:
   - Switch to Testnet in Freighter settings
   - Get testnet XLM from [Friendbot](https://laboratory.stellar.org/?network=test#friendbot)

4. **Connect to App**:
   - Open Stellar Connect Wallet
   - Click "Connect"
   - Approve in Freighter popup

---

## 🐛 Troubleshooting

### "Failed to connect wallet"
- Ensure Freighter extension is installed and active
- Check that you're on a supported browser (Chrome, Firefox, Edge)
- Make sure Freighter is unlocked
- Try refreshing the page

### "Invalid Stellar address"
- Verify the recipient address starts with "G"
- Make sure the address is exactly 56 characters
- Ensure it passes `StrKey.isValidEd25519PublicKey()` validation

### "Insufficient balance"
- Remember the minimum balance reserve (~1 XLM)
- Use "Fund via Friendbot" to get free testnet XLM

### "Transaction timed out"
- The Stellar network may be congested — try again
- Transactions have a 180-second timeout window

### "Unknown response format from Freighter"
- Update your Freighter extension to the latest version
- The app handles multiple Freighter API response formats automatically

---

## 📚 Resources

- **Stellar Documentation**: https://developers.stellar.org/
- **Freighter Docs**: https://www.freighter.app/
- **Horizon API**: https://developers.stellar.org/docs/data/horizon
- **Stellar Expert Explorer**: https://stellar.expert/
- **React Docs**: https://react.dev/

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

Created with ❤️ for the Stellar community

---

## ⭐ Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📢 Sharing with others

<div align="center">

**Made with React + Stellar ✨**

[Install Freighter](https://www.freighter.app/) • [Stellar Docs](https://developers.stellar.org/) • [Report Bug](https://github.com/Anmol-345/stellar-connect-wallet/issues)

</div>
