import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import {
  checkConnection,
  retrievePublicKey,
  getBalance,
  fundWallet,
  validateTransactionInputs,
} from "./components/Freighter";
import useStellarTransaction from "./hooks/useStellarTransaction";

function App() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [copied, setCopied] = useState(false);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isFunding, setIsFunding] = useState(false);

  const [status, setStatus] = useState({ type: "", message: "" });

  const {
    execute: executeTx,
    loading: isSending,
    status: txStatus,
  } = useStellarTransaction();

  const updateBalance = useCallback(async (pubKey) => {
    try {
      const bal = await getBalance(pubKey);
      setBalance(bal);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await checkConnection();
    };
    init();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setStatus({ type: "", message: "" });
    try {
      const pubKey = await retrievePublicKey();
      if (pubKey) {
        setAddress(pubKey);
        await updateBalance(pubKey);
        setStatus({ type: "success", message: "Wallet connected successfully!" });
      } else {
        setStatus({ type: "error", message: "User declined connection or Freighter is not installed." });
      }
    } catch (e) {
      setStatus({ type: "error", message: "Failed to connect to Freighter." });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleFund = async () => {
    setIsFunding(true);
    setStatus({ type: "info", message: "Requesting testnet funds..." });
    try {
      await fundWallet(address);
      await updateBalance(address);
      setStatus({ type: "success", message: "Successfully funded wallet with Friendbot!" });
    } catch (e) {
      setStatus({ type: "error", message: "Failed to fund wallet (already funded or network error)." });
    } finally {
      setIsFunding(false);
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const getStepState = (step) => {
    if (!isSending && txStatus === "success") return "active";
    if (!isSending) return "";
    const steps = ["validating", "signing", "submitting"];
    const currentIdx = steps.indexOf(txStatus);
    const stepIdx = steps.indexOf(step);
    return stepIdx <= currentIdx ? "active" : "";
  };

  const getTxStatusMessage = (hookStatus) => {
    switch (hookStatus) {
      case "validating": return "Validating inputs...";
      case "signing": return "Sign in Freighter...";
      case "submitting": return "Submitting to network...";
      default: return "Processing...";
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    const validationErrors = validateTransactionInputs(destination, amount);
    if (validationErrors.length > 0) {
      setStatus({ type: "error", message: validationErrors.join(" ") });
      return;
    }

    setStatus({ type: "info", message: "Preparing transaction..." });

    try {
      const result = await executeTx(address, destination, amount, memo);
      setStatus({
        type: "success",
        message: `Transaction confirmed! Hash: ${result.hash.substring(0, 20)}...`,
      });
      setDestination("");
      setAmount("");
      setMemo("");
      await updateBalance(address);
    } catch (err) {
      let msg = err.message || "Transaction failed.";
      if (err.response?.data?.extras?.result_codes) {
        msg += ` Result Codes: ${JSON.stringify(err.response.data.extras.result_codes)}`;
      }
      setStatus({ type: "error", message: msg });
    }
  };

  useEffect(() => {
    if (isSending && ["validating", "signing", "submitting"].includes(txStatus)) {
      setStatus({ type: "info", message: getTxStatusMessage(txStatus) });
    }
  }, [txStatus, isSending]);

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="app-container">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <span className="navbar-title">Nova DEX</span>
        </div>
        <div className="navbar-right">
          <div className="badge-testnet">TESTNET</div>
          {address && (
            <div className="address-pill">
              {address.substring(0, 6)}...{address.slice(-4)}
              <div className="address-pill-avatar"></div>
            </div>
          )}
        </div>
      </nav>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <div className="main-content">
        {!address ? (
          /* ════════ CONNECT SCREEN ════════ */
          <div className="connect-wrapper">
            <div className="connect-card">
              <div className="connect-icon-wrapper">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                  <path d="M6 14h.01" />
                </svg>
              </div>

              <h1 className="connect-title">Connect Your Wallet</h1>
              <p className="connect-subtitle">
                Link your Freighter wallet to start sending and receiving XLM on the Stellar testnet.
              </p>

              <div className="connect-features">
                <div className="connect-feature">
                  <div className="connect-feature-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <span className="connect-feature-label">Secure</span>
                </div>
                <div className="connect-feature">
                  <div className="connect-feature-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <span className="connect-feature-label">Instant</span>
                </div>
                <div className="connect-feature">
                  <div className="connect-feature-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <span className="connect-feature-label">Testnet</span>
                </div>
              </div>

              <button
                id="connect-wallet-btn"
                className="btn-primary"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting && <span className="loader"></span>}
                {isConnecting ? "Connecting..." : "Connect Freighter"}
              </button>
            </div>

            {status.message && (
              <div className={`status-message ${status.type}`} style={{ marginTop: "1rem", width: "100%" }}>
                <StatusIcon type={status.type} />
                <span style={{ flex: 1, wordBreak: "break-word" }}>{status.message}</span>
              </div>
            )}
          </div>
        ) : (
          /* ════════ DASHBOARD ════════ */
          <div className="dashboard">
            {/* ── Portfolio Card ─────────────────────────────────────────── */}
            <div className="card">
              <div className="card-header">
                <div className="card-header-left">
                  <div className="card-header-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="6" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                      <path d="M6 14h.01" />
                    </svg>
                  </div>
                  <h2>Portfolio</h2>
                </div>
                <button
                  className="card-action-btn"
                  onClick={() => updateBalance(address)}
                  title="Refresh balance"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                </button>
              </div>

              <div className="balance-section">
                <div className="balance-label">Total Balance</div>
                <div className="balance-amount">
                  {Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 7 })}
                  <span className="balance-currency">XLM</span>
                </div>
                <div className="balance-network">Stellar Lumens • Testnet</div>
              </div>

              <div className="address-box">
                <span className="address-text">{address}</span>
                <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={handleCopyAddress} title="Copy address">
                  {copied ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="action-buttons">
                <button
                  id="fund-wallet-btn"
                  className="btn-outline"
                  onClick={handleFund}
                  disabled={isFunding}
                >
                  {isFunding ? (
                    <span className="loader"></span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  )}
                  Fund via Friendbot
                </button>
                <button
                  id="refresh-balance-btn"
                  className="btn-outline"
                  onClick={() => updateBalance(address)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  Refresh Balance
                </button>
              </div>
            </div>

            {/* ── Send XLM Card ─────────────────────────────────────────── */}
            <div className="card">
              <div className="card-header">
                <div className="card-header-left">
                  <div className="card-header-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </div>
                  <h2>Send XLM</h2>
                </div>
              </div>

              {/* Step Progress Bar */}
              <div className="step-progress">
                <div className="step-item">
                  <div className={`step-dot ${getStepState("validating")}`}></div>
                  <span className={`step-label ${getStepState("validating")}`}>Validate</span>
                </div>
                <div className={`step-line ${getStepState("signing")}`}></div>
                <div className="step-item">
                  <div className={`step-dot ${getStepState("signing")}`}></div>
                  <span className={`step-label ${getStepState("signing")}`}>Sign</span>
                </div>
                <div className={`step-line ${getStepState("submitting")}`}></div>
                <div className="step-item">
                  <div className={`step-dot ${getStepState("submitting")}`}></div>
                  <span className={`step-label ${getStepState("submitting")}`}>Submit</span>
                </div>
              </div>

              <form onSubmit={handleSend}>
                <div className="input-group">
                  <label htmlFor="destination-input">Destination Address</label>
                  <input
                    id="destination-input"
                    type="text"
                    className="input-field"
                    placeholder="G..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    disabled={isSending}
                  />
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="amount-input">Amount (XLM)</label>
                    <input
                      id="amount-input"
                      type="number"
                      step="0.0000001"
                      min="0"
                      className="input-field"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={isSending}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="memo-input">
                      Memo <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "0.8rem" }}>(optional)</span>
                    </label>
                    <input
                      id="memo-input"
                      type="text"
                      className="input-field"
                      placeholder="Payment for..."
                      value={memo}
                      onChange={(e) => setMemo(e.target.value.substring(0, 28))}
                      disabled={isSending}
                      maxLength={28}
                    />
                  </div>
                </div>

                <button
                  id="send-transaction-btn"
                  type="submit"
                  className="btn-primary"
                  disabled={isSending || !destination || !amount}
                >
                  {isSending ? (
                    <>
                      <span className="loader"></span>
                      {getTxStatusMessage(txStatus)}
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Send Transaction
                    </>
                  )}
                </button>

                <div className="info-banner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Transactions on Stellar testnet are free and for development purposes only.
                </div>
              </form>
            </div>

            {/* ── Status Message ─────────────────────────────────────────── */}
            {status.message && (
              <div className={`status-message ${status.type}`}>
                <StatusIcon type={status.type} />
                <span style={{ flex: 1, wordBreak: "break-word" }}>{status.message}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Status Icon Component ──────────────────────────────────────────────────── */
function StatusIcon({ type }) {
  if (type === "error") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
  if (type === "success") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }
  if (type === "info") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    );
  }
  return null;
}

export default App;
