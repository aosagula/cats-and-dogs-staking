import { PublicKey } from "@solana/web3.js";
import { web3 } from "@project-serum/anchor";
import { programs } from "@metaplex/js";
import { GEO_NODE, NETWORK, USE_GEO } from "../config";

export const fastConnection = new web3.Connection(GEO_NODE!, {
  confirmTransactionInitialTimeout: 10 * 1000, // 10 Seconds
  commitment: "confirmed",
});
export const solConnection = USE_GEO
  ? fastConnection
  : new web3.Connection(web3.clusterApiUrl(NETWORK));
export const getNftMetaData = async (nftMintPk: PublicKey) => {
  let {
    metadata: { Metadata },
  } = programs;
  let metadataAccount = await Metadata.getPDA(nftMintPk);
  const metadata = await Metadata.load(solConnection, metadataAccount);
  return metadata.data.data.uri;
};
