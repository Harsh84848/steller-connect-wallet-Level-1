import { useState, useCallback } from "react";
import { sendPayment, validateTransactionInputs } from "../components/Freighter";

/**
 * useStellarTransaction
 * 
 * A reusable React hook that encapsulates the full Stellar transaction flow:
 *   1. Validates recipient & amount inputs
 *   2. Connects to Freighter to sign the transaction
 *   3. Reconstructs the signed XDR (with progressive SDK fallbacks)
 *   4. Submits the transaction to the Stellar Testnet
 *
 * Returns: { execute, loading, error, txHash, status, reset }
 */
const useStellarTransaction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | validating | signing | submitting | success | error

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setTxHash(null);
    setStatus("idle");
  }, []);

  /**
   * Execute a Stellar payment transaction.
   *
   * @param {string} senderAddress  - The sender's public key (from Freighter)
   * @param {string} recipient      - The destination Stellar public key
   * @param {string} amount         - Amount of XLM to send (as a string)
   * @param {string} [memo]         - Optional memo text (max 28 chars)
   * @returns {Promise<{hash: string}>} - The transaction result with hash
   * @throws Will set `error` state on failure
   */
  const execute = useCallback(async (senderAddress, recipient, amount, memo = "") => {
    // Reset previous state
    setError(null);
    setTxHash(null);
    setLoading(true);

    try {
      // ── Validation ──────────────────────────────────────────────────────
      setStatus("validating");
      const validationErrors = validateTransactionInputs(recipient, amount);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(" "));
      }

      // ── Signing ─────────────────────────────────────────────────────────
      setStatus("signing");
      // sendPayment handles: getAddress → loadAccount → buildTx → sign → reconstruct → submit

      // ── Submitting ──────────────────────────────────────────────────────
      setStatus("submitting");
      const result = await sendPayment(senderAddress, recipient, amount, memo);

      // ── Success ─────────────────────────────────────────────────────────
      setTxHash(result.hash);
      setStatus("success");
      return result;
    } catch (e) {
      setError(e.message || "An unknown error occurred.");
      setStatus("error");
      throw e; // Re-throw so the caller can also handle it
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    execute,
    loading,
    error,
    txHash,
    status,
    reset,
  };
};

export default useStellarTransaction;
