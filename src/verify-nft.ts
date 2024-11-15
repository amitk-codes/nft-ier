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
  findMetadataPda,
  mplTokenMetadata,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";

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

const nftPublickey = publicKey(process.env.CREATED_NFT_ADDRESS || "");

console.log("COLLECTION BEING USED::", collectionPublickey);

console.log("NFT BEING USED::", nftPublickey);

const tx = await verifyCollectionV1(umi, {
  metadata: findMetadataPda(umi, { mint: nftPublickey }),
  collectionMint: collectionPublickey,
  authority: umi.identity,
});

await tx.sendAndConfirm(umi);

console.log(
  `NFT ${nftPublickey} is successfully verified by collection ${collectionPublickey}. Click to view on Explorer::`,
  getExplorerLink("address", nftPublickey, clusterNetwork)
);
