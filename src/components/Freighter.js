import {
  isAllowed,
  setAllowed,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";

// ─── Network Configuration ────────────────────────────────────────────────────
const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const networkPassphrase = "Test SDF Network ; September 2015";

// ─── Connection Helpers ───────────────────────────────────────────────────────

export const checkConnection = async () => {
  try {
    const isConn = await isAllowed();
    return isConn;
  } catch (e) {
    return false;
  }
};

export const retrievePublicKey = async () => {
  try {
    const allowed = await setAllowed();
    if (allowed) {
      const { address } = await getAddress();
      return address;
    }
    return "";
  } catch (e) {
    console.error("Connection failed", e);
    return "";
  }
};

// ─── Balance ──────────────────────────────────────────────────────────────────

export const getBalance = async (address) => {
  try {
    const account = await server.loadAccount(address);
    const xlmBalance = account.balances.find((b) => b.asset_type === "native");
    return xlmBalance ? xlmBalance.balance : "0";
  } catch (e) {
    console.error("Account not found or error fetching balance.", e);
    return "0";
  }
};

// ─── Friendbot Funding ────────────────────────────────────────────────────────

export const fundWallet = async (address) => {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`
    );
    const responseJSON = await response.json();
    if (!response.ok) {
      throw new Error(responseJSON?.detail || "Friendbot request failed");
    }
    return responseJSON;
  } catch (e) {
    console.error("Error funding wallet:", e);
    throw e;
  }
};

// ─── Form Validation ──────────────────────────────────────────────────────────

export const validateTransactionInputs = (recipient, amount) => {
  const errors = [];

  // Validate recipient
  if (!recipient || recipient.trim() === "") {
    errors.push("Recipient address is required.");
  } else if (recipient.length !== 56) {
    errors.push("Recipient address must be exactly 56 characters.");
  } else if (!recipient.startsWith("G")) {
    errors.push("Recipient address must start with 'G'.");
  } else if (!StellarSdk.StrKey.isValidEd25519PublicKey(recipient)) {
    errors.push("Recipient address is not a valid Stellar public key.");
  }

  // Validate amount
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.push("Amount must be greater than 0.");
  } else if (parsedAmount < 0.0000001) {
    errors.push("Minimum amount is 0.0000001 XLM.");
  }

  return errors;
};

// ─── Core Transaction Logic ───────────────────────────────────────────────────

export const sendPayment = async (sourceAddress, destinationAddress, amount, memo) => {
  // ── Step A: Get Sender Address ──────────────────────────────────────────────
  // Verify Freighter is still connected and get the active public key
  let senderAddress;
  try {
    const addressResult = await getAddress();
    senderAddress = addressResult?.address || addressResult;
    if (!senderAddress) {
      throw new Error("Freighter wallet is not connected. Please reconnect.");
    }
  } catch (e) {
    throw new Error("Failed to get address from Freighter. Is the extension installed and unlocked?");
  }

  // Use the source address from the caller, but confirm it matches Freighter
  if (sourceAddress && senderAddress !== sourceAddress) {
    console.warn("Freighter active address differs from provided source. Using Freighter's address.");
  }
  const activeSender = senderAddress;

  // ── Step B: Load Account ────────────────────────────────────────────────────
  let account;
  try {
    account = await server.loadAccount(activeSender);
  } catch (e) {
    if (e?.response?.status === 404) {
      throw new Error(
        "Sender account not found on the network. It may be unfunded. Use Friendbot to fund it first."
      );
    }
    if (e?.response?.status === 400) {
      throw new Error("Invalid sender address format.");
    }
    throw new Error(`Failed to load account: ${e.message}`);
  }

  // ── Step C: Build Transaction ───────────────────────────────────────────────
  const transactionBuilder = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: networkPassphrase,
  });

  transactionBuilder.addOperation(
    StellarSdk.Operation.payment({
      destination: destinationAddress,
      asset: StellarSdk.Asset.native(),
      amount: parseFloat(amount).toFixed(7),
    })
  );

  // Add Memo if exists
  if (memo && memo.trim()) {
    transactionBuilder.addMemo(StellarSdk.Memo.text(memo.substring(0, 28)));
  }

  const transaction = transactionBuilder.setTimeout(180).build();

  // ── Step D: Convert to XDR and Sign with Freighter ──────────────────────────
  const xdr = transaction.toEnvelope().toXDR("base64");

  let result;
  try {
    result = await signTransaction(xdr, {
      networkPassphrase,
      publicKey: activeSender,
    });
  } catch (e) {
    if (e?.message?.includes("User declined")) {
      throw new Error("Transaction was rejected by the user in Freighter.");
    }
    throw new Error(`Freighter signing failed: ${e.message}`);
  }

  // ── Step E: Extract Signed XDR from Freighter Response ──────────────────────
  let signedXdr;
  if (typeof result === "string") {
    signedXdr = result;
  } else if (result?.signedTxXdr && typeof result.signedTxXdr === "string") {
    signedXdr = result.signedTxXdr;
  } else if (result?.xdr && typeof result.xdr === "string") {
    signedXdr = result.xdr;
  } else {
    throw new Error(
      "Unknown response format from Freighter. Could not extract signed transaction XDR."
    );
  }

  // ── Step F: Reconstruct Transaction from Signed XDR ─────────────────────────
  // Progressive fallbacks for SDK version compatibility
  let transactionToSubmit;
  try {
    if (typeof StellarSdk.TransactionBuilder?.fromXDR === "function") {
      transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        networkPassphrase
      );
    } else if (typeof StellarSdk.Envelope?.fromXDR === "function") {
      transactionToSubmit = StellarSdk.Envelope.fromXDR(
        signedXdr,
        networkPassphrase
      );
    } else {
      transactionToSubmit = new StellarSdk.Envelope(
        StellarSdk.xdr.TransactionEnvelope.fromXDR(signedXdr, "base64"),
        networkPassphrase
      );
    }
  } catch (e) {
    throw new Error(
      `Failed to reconstruct transaction from signed XDR: ${e.message}`
    );
  }

  // ── Step G: Submit to Stellar Network ───────────────────────────────────────
  try {
    const submitResult = await server.submitTransaction(transactionToSubmit);
    return submitResult; // submitResult.hash is the transaction hash
  } catch (e) {
    // Parse specific Horizon error responses
    const extras = e?.response?.data?.extras;
    const resultCodes = extras?.result_codes;

    if (resultCodes) {
      const txCode = resultCodes.transaction;
      const opCodes = resultCodes.operations || [];

      if (txCode === "tx_failed" && opCodes.includes("op_underfunded")) {
        throw new Error(
          "Insufficient balance. You don't have enough XLM to complete this transaction (remember the minimum balance reserve)."
        );
      }
      if (txCode === "tx_too_late") {
        throw new Error(
          "Transaction timed out. The transaction was submitted too late. Please try again."
        );
      }
      if (txCode === "tx_bad_seq") {
        throw new Error(
          "Bad sequence number. This usually means another transaction was submitted simultaneously. Please try again."
        );
      }
      if (opCodes.includes("op_no_destination")) {
        throw new Error(
          "Destination account does not exist on the network. The recipient must have a funded Stellar account."
        );
      }
      if (opCodes.includes("op_low_reserve")) {
        throw new Error(
          "This transaction would put the destination account below the minimum balance reserve."
        );
      }

      // Generic failure with codes
      const error = new Error(
        `Transaction failed. Code: ${txCode}. Operations: [${opCodes.join(", ")}]`
      );
      error.response = e.response;
      throw error;
    }

    // Network / timeout errors
    if (e.message?.includes("timeout") || e.message?.includes("ETIMEDOUT")) {
      throw new Error(
        "Network timeout while submitting transaction. The Stellar network may be congested. Please try again."
      );
    }

    const error = new Error(`Transaction submission failed: ${e.message}`);
    error.response = e?.response;
    throw error;
  }
};
