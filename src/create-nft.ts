import dotenv from "dotenv";
dotenv.config();
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";

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

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiKeypair));

const collectionPublickey = publicKey(
  process.env.CREATED_COLLECTION_ADDRESS || ""
);

const collectionMint = generateSigner(umi);

console.log("COLLECTION BEING USED::", collectionPublickey);

const tx = await createNft(umi, {
  mint: collectionMint,
  name: process.env.NFT_NAME || "",
  uri: process.env.NFT_URI || "",
  sellerFeeBasisPoints: percentAmount(0),
  collection: {
    key: collectionPublickey,
    verified: false,
  },
});

await tx.sendAndConfirm(umi);

const fetchedCollection = await fetchDigitalAsset(
  umi,
  collectionMint.publicKey
);

console.log(
  "NFT CREATED, Click to view on explorer::",
  getExplorerLink("address", fetchedCollection.mint.publicKey, clusterNetwork)
);
