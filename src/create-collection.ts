import dotenv from "dotenv";
dotenv.config();
import {
  airdropIfRequired,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

// loading keypair 
const user = await getKeypairFromFile();

const clusterNetwork =
  (process.env.CLUSTER_NETWORK as "devnet" | "testnet" | "mainnet-beta") ||
  "devnet";

const connection = new Connection(clusterApiUrl(clusterNetwork));

console.log("USER PUBLIC KEY::", user.publicKey.toString());

await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.5 * LAMPORTS_PER_SOL
);