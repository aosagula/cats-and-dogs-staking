import * as anchor from "@project-serum/anchor";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  EPOCH,
  GLOBAL_AUTHORITY_SEED,
  METAPLEX,
  PROGRAM_ID,
  REWARD_TOKEN_DECIMAL,
  REWARD_TOKEN_MINT,
  USER_POOL_SIZE,
} from "../config";
import { solConnection } from "./utils";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { IDL } from "./staking";
import { GlobalPool, UserPool } from "./type";
import { successAlert } from "../services/toastGroup";
import { Promise } from "bluebird";
import { chunk, map, slice } from "lodash";

export const setAmount = async (
  wallet: WalletContextState,
  advAmount: number,
  sciAmount: number,
  docAmount: number,
  speAmount: number,
  comAmount: number,
  norAmount: number
) => {
  if (wallet.publicKey === null) return;
  const userAddress = wallet.publicKey;
  let cloneWindow: any = window;
  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );
  const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  try {
    const tx = await program.rpc.setAmount(
      bump,
      advAmount,
      sciAmount,
      docAmount,
      speAmount,
      comAmount,
      norAmount,
      {
        accounts: {
          admin: userAddress,
          globalAuthority,
        },
        signers: [],
      }
    );
    await solConnection.confirmTransaction(tx, "finalized");
    successAlert("Done");
  } catch (error) {
    console.log(error);
  }
};

export const calculateAllRewards = async (wallet: WalletContextState) => {
  if (wallet.publicKey === null) return 0;
  const globalPool: GlobalPool | null = await getGlobalState();
  if (globalPool === null) return 0;

  const userPool: UserPool | null = await getUserPoolState(wallet);
  if (userPool === null) return 0;

  let now = Math.floor(Date.now() / 1000);
  let total_reward = 0;

  for (let i = 0; i < userPool.itemCount.toNumber(); i++) {
    let lastRewardTime = userPool.rewardTime.toNumber();
    if (lastRewardTime < userPool.items[i].rewardTime.toNumber()) {
      lastRewardTime = userPool.items[i].rewardTime.toNumber();
    }
    let reward = 0;
    if (
      userPool.items[i].model.toNumber() === 1 &&
      userPool.items[i].lockTime.toNumber() > now
    ) {
      reward = Math.floor(
        ((now - lastRewardTime) / EPOCH) * userPool.items[i].rate.toNumber()
      );
    } else {
      reward = Math.floor(
        ((now - lastRewardTime) / EPOCH) * userPool.items[i].rate.toNumber()
      );
    }

    total_reward += reward;
  }

  total_reward += userPool.pendingReward.toNumber();

  return total_reward / REWARD_TOKEN_DECIMAL;
};

export const calculateReward = async (
  wallet: WalletContextState,
  nftMint: PublicKey
) => {
  if (wallet.publicKey === null) return 0;

  const globalPool: GlobalPool | null = await getGlobalState();
  if (globalPool === null) return 0;

  const userPool: UserPool | null = await getUserPoolState(wallet);
  if (userPool === null) return 0;

  let now = Math.floor(Date.now() / 1000);
  let reward = 0;

  for (let i = 0; i < userPool.itemCount.toNumber(); i++) {
    if (userPool.items[i].nftAddr === nftMint) {
      if (
        userPool.items[i].model.toNumber() === 1 &&
        userPool.items[i].lockTime.toNumber() > now
      ) {
        reward =
          Math.floor((now - userPool.items[i].rewardTime.toNumber()) / EPOCH) *
          userPool.items[i].rate.toNumber();
      } else {
        reward =
          Math.floor((now - userPool.items[i].rewardTime.toNumber()) / EPOCH) *
          userPool.items[i].rate.toNumber();
      }
    }
  }
  return reward / REWARD_TOKEN_DECIMAL;
};

export const initUserPool = async (wallet: WalletContextState) => {
  if (wallet.publicKey === null) return;
  let userAddress: PublicKey = wallet.publicKey;
  let cloneWindow: any = window;
  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );
  const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
  try {
    let userPoolKey = await PublicKey.createWithSeed(
      userAddress,
      "user-pool",
      program.programId
    );

    let ix = SystemProgram.createAccountWithSeed({
      fromPubkey: userAddress,
      basePubkey: userAddress,
      seed: "user-pool",
      newAccountPubkey: userPoolKey,
      lamports: await solConnection.getMinimumBalanceForRentExemption(
        USER_POOL_SIZE
      ),
      space: USER_POOL_SIZE,
      programId: program.programId,
    });

    let tx = new Transaction();
    tx.add(ix);
    tx.add(
      program.instruction.initializeFixedPool({
        accounts: {
          userFixedPool: userPoolKey,
          owner: userAddress,
        },
        instructions: [],
        signers: [],
      })
    );
    const anyTransaction = tx;
    const latestBlockHash = await solConnection.getLatestBlockhash();
    anyTransaction.recentBlockhash = latestBlockHash.blockhash;
    anyTransaction.lastValidBlockHeight = latestBlockHash.lastValidBlockHeight;
    const txId = await wallet.sendTransaction(tx, solConnection);
    await solConnection.confirmTransaction(
      {
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txId,
      },
      "finalized"
    );
  } catch (error) {
    console.log(error);
  }
};

export const stakeNft = async (
  wallet: WalletContextState,
  mint: PublicKey,
  lock_period: number,
  symbol: String,
  model: number
) => {
  if (wallet.publicKey === null) return;
  const userAddress = wallet.publicKey;
  let cloneWindow: any = window;
  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );
  const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

  let userTokenAccount = await getAssociatedTokenAccount(userAddress, mint);

  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
    solConnection,
    userAddress,
    globalAuthority,
    [mint]
  );

  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );

  let poolAccount = await solConnection.getAccountInfo(userPoolKey);
  if (poolAccount === null || poolAccount.data === null) {
    await initUserPool(wallet);
  }
  const metadata = await getMetadata(mint);

  let tx = new Transaction();
  if (instructions.length > 0) tx.add(instructions[0]);
  tx.add(
    program.instruction.stakeNftToFixed(
      bump,
      new anchor.BN(lock_period),
      symbol,
      new anchor.BN(model),
      {
        accounts: {
          owner: userAddress,
          userFixedPool: userPoolKey,
          globalAuthority,
          userTokenAccount,
          destNftTokenAccount: destinationAccounts[0],
          nftMint: mint,
          mintMetadata: metadata,
          tokenProgram: TOKEN_PROGRAM_ID,
          tokenMetadataProgram: METAPLEX,
        },
        instructions: [
          // ...instructions,
        ],
        signers: [],
      }
    )
  );
  const anyTransaction = tx;
  const latestBlockHash = await solConnection.getLatestBlockhash();
  anyTransaction.recentBlockhash = latestBlockHash.blockhash;
  anyTransaction.lastValidBlockHeight = latestBlockHash.lastValidBlockHeight;
  const txId = await wallet.sendTransaction(tx, solConnection);
  await solConnection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: txId,
    },
    "finalized"
  );
};

export const withdrawNft = async (
  wallet: WalletContextState,
  mint: PublicKey
) => {
  if (wallet.publicKey === null) return;
  const userAddress = wallet.publicKey;
  let cloneWindow: any = window;
  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );
  const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
  let userTokenAccount = await getAssociatedTokenAccount(userAddress, mint);
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
    solConnection,
    userAddress,
    globalAuthority,
    [mint]
  );

  console.log(instructions, "instructions..");
  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );

  let tx = new Transaction();
  if (instructions.length > 0) tx.add(...instructions);
  tx.add(
    program.instruction.withdrawNftFromFixed(bump, {
      accounts: {
        owner: userAddress,
        userFixedPool: userPoolKey,
        globalAuthority,
        userTokenAccount,
        destNftTokenAccount: destinationAccounts[0],
        nftMint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      instructions: [],
      signers: [],
    })
  );
  const anyTransaction = tx;
  const latestBlockHash = await solConnection.getLatestBlockhash();
  anyTransaction.recentBlockhash = latestBlockHash.blockhash;
  anyTransaction.lastValidBlockHeight = latestBlockHash.lastValidBlockHeight;
  const txId = await wallet.sendTransaction(tx, solConnection);
  await solConnection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: txId,
    },
    "finalized"
  );
  successAlert("Unstake has been successfully processed!");
};

export const stakeAllNft = async (
  wallet: WalletContextState,
  nftList: Array<{
    mint: PublicKey;
    symbol: String;
  }>,
  lock_period: number,
  model: number
) => {
  if (wallet.publicKey === null) return;
  const userAddress = wallet.publicKey;
  let cloneWindow: any = window;
  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );
  const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );
  let poolAccount = await solConnection.getAccountInfo(userPoolKey);
  if (poolAccount === null || poolAccount.data === null) {
    await initUserPool(wallet);
  }
  const pagedList = chunk(nftList, 4);
  await Promise.mapSeries(pagedList, async (arrayList: any) => {
    let { instructions, destinationAccounts } =
      await getATokenAccountsNeedCreate(
        solConnection,
        userAddress,
        globalAuthority,
        map(arrayList, ({ mint }) => mint)
      );
    const txnMulti = new anchor.web3.Transaction();
    if (instructions.length > 0) txnMulti.add(instructions[0]);
    console.log(instructions);
    await Promise.mapSeries(arrayList, async ({ mint, symbol }: any, idx: number) => {
      let userTokenAccount = await getAssociatedTokenAccount(userAddress, mint);

      const metadata = await getMetadata(mint);
      txnMulti.add(
        program.instruction.stakeNftToFixed(
          bump,
          new anchor.BN(lock_period),
          symbol,
          new anchor.BN(model),
          {
            accounts: {
              owner: userAddress,
              userFixedPool: userPoolKey,
              globalAuthority,
              userTokenAccount,
              destNftTokenAccount: destinationAccounts[idx],
              nftMint: mint,
              mintMetadata: metadata,
              tokenProgram: TOKEN_PROGRAM_ID,
              tokenMetadataProgram: METAPLEX,
            },
            instructions: [
              // ...instructions,
            ],
            signers: [],
          }
        )
      );
    });
    txnMulti.feePayer = userAddress;
    const anyTransaction = txnMulti;
    const latestBlockHash = await solConnection.getLatestBlockhash();
    anyTransaction.recentBlockhash = latestBlockHash.blockhash;
    anyTransaction.lastValidBlockHeight = latestBlockHash.lastValidBlockHeight;
    const txId = await wallet.sendTransaction(txnMulti, solConnection);
    await solConnection.confirmTransaction(
      {
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txId,
      },
      "finalized"
    );
  });
};

export const withdrawAllNft = async (
  wallet: WalletContextState,
  mintList: Array<PublicKey>
) => {
  if (wallet.publicKey === null) return;
  const userAddress = wallet.publicKey;
  let cloneWindow: any = window;
  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );
  const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
    solConnection,
    userAddress,
    globalAuthority,
    mintList
  );
  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );
  let txnMulti = new Transaction();
  if (instructions.length > 0) txnMulti.add(...instructions);
  await Promise.mapSeries(mintList, async (mint, idx) => {
    let userTokenAccount = await getAssociatedTokenAccount(userAddress, mint);
    txnMulti.add(
      program.instruction.withdrawNftFromFixed(bump, {
        accounts: {
          owner: userAddress,
          userFixedPool: userPoolKey,
          globalAuthority,
          userTokenAccount,
          destNftTokenAccount: destinationAccounts[idx],
          nftMint: mint,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        instructions: [],
        signers: [],
      })
    );
  });
  txnMulti.feePayer = userAddress;
  const anyTransaction = txnMulti;
  const latestBlockHash = await solConnection.getLatestBlockhash();
  anyTransaction.recentBlockhash = latestBlockHash.blockhash;
  anyTransaction.lastValidBlockHeight = latestBlockHash.lastValidBlockHeight;
  const txId = await wallet.sendTransaction(txnMulti, solConnection);
  await solConnection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: txId,
    },
    "finalized"
  );
  successAlert("Unstake all has been successfully processed!");
};

export const claimRewardAll = async (wallet: WalletContextState) => {
  if (wallet.publicKey === null) return;
  const userAddress = wallet.publicKey;
  let cloneWindow: any = window;
  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );
  const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );

  let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
    solConnection,
    userAddress,
    userAddress,
    [REWARD_TOKEN_MINT]
  );

  let rewardVault = await getAssociatedTokenAccount(
    globalAuthority,
    REWARD_TOKEN_MINT
  );
  // let tx = new Transaction();
  // if (instructions.length !== 0) tx.add(...instructions);
  // tx.add(program.instruction.claimRewardAll(
  //     bump, {
  //     accounts: {
  //         owner: userAddress,
  //         userFixedPool: userPoolKey,
  //         globalAuthority,
  //         rewardVault,
  //         userRewardAccount: destinationAccounts[0],
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //     },
  //     instructions: [],
  //     signers: []
  // }
  // ))

  // const txId = await wallet.sendTransaction(tx, solConnection);
  // await solConnection.confirmTransaction(txId, "finalized");
  const tx = await program.rpc.claimRewardAll(bump, {
    accounts: {
      owner: userAddress,
      userFixedPool: userPoolKey,
      globalAuthority,
      rewardVault,
      userRewardAccount: destinationAccounts[0],
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    instructions: [...instructions],
    signers: [],
  });

  console.log("Your transaction signature", tx);
  await solConnection.confirmTransaction(tx, "singleGossip");

  successAlert("Claim has been successfully processed!");
};

export const claimReward = async (
  wallet: WalletContextState,
  mint: PublicKey
) => {
  if (wallet.publicKey === null) return;
  const userAddress = wallet.publicKey;
  let cloneWindow: any = window;
  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );
  const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );

  let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
    solConnection,
    userAddress,
    userAddress,
    [REWARD_TOKEN_MINT]
  );
  let rewardVault = await getAssociatedTokenAccount(
    globalAuthority,
    REWARD_TOKEN_MINT
  );
  let tx = new Transaction();
  if (instructions.length > 0) tx.add(...instructions);
  tx.add(
    program.instruction.claimReward(bump, {
      accounts: {
        owner: userAddress,
        userFixedPool: userPoolKey,
        globalAuthority,
        rewardVault,
        userRewardAccount: destinationAccounts[0],
        nftMint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      instructions: [],
      signers: [],
    })
  );
  const txId = await wallet.sendTransaction(tx, solConnection);
  await solConnection.confirmTransaction(txId, "finalized");
  successAlert("Claim has been successfully processed!");
};
export const getGlobalState = async (): Promise<GlobalPool | null> => {
  let cloneWindow: any = window;
  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );
  const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  try {
    let globalState = await program.account.globalPool.fetch(globalAuthority);
    return globalState as GlobalPool;
  } catch {
    return null;
  }
};

export const getUserPoolState = async (
  wallet: WalletContextState
): Promise<UserPool | null> => {
  if (wallet.publicKey === null) return null;
  const userAddress = wallet.publicKey;
  let cloneWindow: any = window;
  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );
  const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );
  try {
    let poolState = await program.account.userPool.fetch(userPoolKey);
    return poolState as UserPool;
  } catch {
    return null;
  }
};

const getAssociatedTokenAccount = async (
  ownerPubkey: PublicKey,
  mintPk: PublicKey
): Promise<PublicKey> => {
  let associatedTokenAccountPubkey = (
    await PublicKey.findProgramAddress(
      [
        ownerPubkey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mintPk.toBuffer(), // mint address
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0];
  return associatedTokenAccountPubkey;
};

export const getATokenAccountsNeedCreate = async (
  connection: anchor.web3.Connection,
  walletAddress: anchor.web3.PublicKey,
  owner: anchor.web3.PublicKey,
  nfts: anchor.web3.PublicKey[]
) => {
  let instructions = [],
    destinationAccounts = [];
  for (const mint of nfts) {
    const destinationPubkey = await getAssociatedTokenAccount(owner, mint);
    let response = await connection.getAccountInfo(destinationPubkey);
    if (!response) {
      const createATAIx = createAssociatedTokenAccountInstruction(
        destinationPubkey,
        walletAddress,
        owner,
        mint
      );
      instructions.push(createATAIx);
    }
    destinationAccounts.push(destinationPubkey);
    if (walletAddress != owner) {
      const userAccount = await getAssociatedTokenAccount(walletAddress, mint);
      response = await connection.getAccountInfo(userAccount);
      if (!response) {
        const createATAIx = createAssociatedTokenAccountInstruction(
          userAccount,
          walletAddress,
          walletAddress,
          mint
        );
        instructions.push(createATAIx);
      }
    }
  }
  return {
    instructions,
    destinationAccounts,
  };
};

export const createAssociatedTokenAccountInstruction = (
  associatedTokenAddress: anchor.web3.PublicKey,
  payer: anchor.web3.PublicKey,
  walletAddress: anchor.web3.PublicKey,
  splTokenMintAddress: anchor.web3.PublicKey
) => {
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
    { pubkey: walletAddress, isSigner: false, isWritable: false },
    { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  return new anchor.web3.TransactionInstruction({
    keys,
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.from([]),
  });
};

export const getMetadata = async (mint: PublicKey): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress(
      [Buffer.from("metadata"), METAPLEX.toBuffer(), mint.toBuffer()],
      METAPLEX
    )
  )[0];
};
