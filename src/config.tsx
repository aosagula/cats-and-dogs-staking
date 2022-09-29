import { web3 } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
export const NETWORK = "mainnet-beta";
export const GEO_NODE = "https://ssc-dao.genesysgo.net/";
export const USE_GEO = true;

export const USER_POOL_SIZE = 3664;
export const GLOBAL_AUTHORITY_SEED = "global-authority";
export const EPOCH = 86400;
export const REWARD_TOKEN_DECIMAL = 1000000000;
export const ADMIN_PUBKEY = new PublicKey(
  "eLnT174V5nwx76dg5qUkScgyModFFVhaBDsPddLpD6E"
);
export const REWARD_TOKEN_MINT = new PublicKey(
  "4N6UFpLKkxNwoH9x3pmmRk9duA9LgXWQP15QV4UAT4Vc"
);
export const PROGRAM_ID = "FkheWVH8878fGH34oKRsCHgbE17ZruMDvqB8u4oPjtEA";
export const NFT_CREATOR = "29635HJtNmQ8fSnNSukfsYDfaFNf3nfwRwLngKskvuz4";

export const METAPLEX = new web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const TWITTER = "https://www.twitter.com/CDOfficialNFTs";
export const DISCORD = "https://discord.com/invite/catsanddogs";

// 1 Model support
export const ALLOWED_MODELS: Array<any> = [
  {
    value: "1",
    label: "MODELS.1.LABEL",
    description: "MODELS.1.DESC",
  },
];
export const MODEL_CAN_SELECT_LOCKDAYS = "";
export const ALLOWED_LOCKDAYS: Array<any> = [];
export const DEFAULT_MODEL = "1";
export const DEFAULT_LOCKDAY = "7";
export const DEFAULT_PERIOD = 1;
export const MODEL_PERIOD_MAPPING: any = {
  "1": 15,
};
