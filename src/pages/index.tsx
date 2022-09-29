import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import NFTCard from "../components/NFTCard";
import StakedNFTCard from "../components/StakedNFTCard";
import {
  claimRewardAll,
  stakeAllNft,
  withdrawAllNft,
} from "../contexts/transaction";
import {
  getGlobalData,
  getUnstakedNFTs,
  getUserPoolData,
} from "../services/fetchData";
import { TFunction } from "react-i18next";
import { Box, Breakpoint, Container, Grid } from "@mui/material";
import { TemplateItem } from "../components/TemplateItem";
import { fields } from "../configs/dashboard";
import { map, sortBy } from "lodash";
import { PublicKey } from "@solana/web3.js";
import { DEFAULT_LOCKDAY, DEFAULT_MODEL } from "../config";
import { useToasts } from "../hooks/useToasts";

export default function HomePage(props: {
  startLoading: Function;
  closeLoading: Function;
  t: TFunction;
  theme: any;
  maxWidth: Breakpoint;
  className: string;
  sx: any;
  items: Array<any>;
}) {
  const {
    startLoading,
    closeLoading,
    t,
    theme,
    maxWidth,
    className,
    sx,
    items,
  } = props;
  const wallet = useWallet();
  const [nftList, setNftList] = useState<any>();

  // global Data values
  const [dataModel, setDataModel] = useState<any>({});

  const [stakedNfts, setStakedNfts] = useState<any>();
  const [userStakedCount, setUserStakedCount] = useState(0);

  const [rewardAmount, setRewardAmount] = useState(0);
  const { showInfoToast, showErrorToast } = useToasts();

  const handleClaimAll = async () => {
    try {
      startLoading();
      await claimRewardAll(wallet);
      showInfoToast(`You have claimed all of your $${t("TOKEN.NAME")}.`);
    } catch (error) {
      showInfoToast(
        "Transaction may delay due to Solana congestion. Please wait for a moment."
      );
      console.error(error);
    } finally {
      updatePage();
      closeLoading();
    }
  };

  const handleStakeAll = async () => {
    if (!nftList || !nftList.length) return;
    try {
      startLoading();

      await stakeAllNft(
        wallet,
        map(nftList, (nft) => ({
          mint: new PublicKey(nft.mintAddress),
          symbol: nft.symbol,
        })),
        +DEFAULT_LOCKDAY,
        +DEFAULT_MODEL
      );
      showInfoToast("You have staked all of your NFTs.");
    } catch (error) {
      showInfoToast(
        "Transaction may delay due to Solana congestion. Please wait for a moment."
      );
      console.error(error);
    } finally {
      updatePage();
      closeLoading();
    }
  };

  const handleUnstakeAll = async () => {
    if (!stakedNfts || !stakedNfts.length) return;
    try {
      startLoading();
      await withdrawAllNft(
        wallet,
        map(stakedNfts, (nft) => new PublicKey(nft.nftAddress))
      );
      showInfoToast("You have unstaked all of your NFTs.");
    } catch (error) {
      showInfoToast(
        "Transaction may delay due to Solana congestion. Please wait for a moment."
      );
      console.error(error);
    } finally {
      updatePage();
      closeLoading();
    }
  };

  const updatePage = async () => {
    try {
      startLoading();
      const list = await getUnstakedNFTs({ wallet });
      setNftList(sortBy(list, "name"));
      const respData = await getGlobalData({ fields });
      setDataModel(respData);
      const {
        count = 0,
        claimReward = 0,
        staked,
      } = await getUserPoolData({ wallet });
      setUserStakedCount(count);
      setRewardAmount(claimReward);
      setStakedNfts(sortBy(staked, "name"));
    } catch (error) {
      console.error(error);
    } finally {
      closeLoading();
    }
  };

  useEffect(() => {
    updatePage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.connected]);

  useEffect(() => {
    if (!wallet || wallet.publicKey === null) {
      return;
    }
    let timerId = 0;
    const queryClaimAmount = async () => {
      const { claimReward = 0 } = await getUserPoolData({ wallet });
      setRewardAmount(claimReward);

      startTimer();
    };

    const startTimer = () => {
      timerId = window.setTimeout(async () => {
        await queryClaimAmount();
      }, 1000);
    };

    queryClaimAmount();
    return () => {
      clearTimeout(timerId);
    };
  }, [wallet.connected]);
  return (
    <Box className={className} sx={sx}>
      <Container maxWidth={maxWidth}>
        <TemplateItem
          key="dashboard_item"
          items={items}
          pipe={{
            startLoading,
            closeLoading,
            t,
            theme,
            dataModel,
            userStakedCount,
            rewardAmount,
            handleClaimAll,
            handleStakeAll,
            handleUnstakeAll,
          }}
        ></TemplateItem>
        {nftList && nftList.length > 0 && (
          <Grid container spacing={2}>
            {map(nftList, (item: any, key: number) => (
              <Grid key={`nft_grid_${key}`} item xs={12} md={6} lg={3}>
                <NFTCard
                  mint={item.mintAddress}
                  symbol={item.symbol}
                  key={`nft_card#${item.mintAddress}`}
                  startLoading={() => startLoading()}
                  closeLoading={() => closeLoading()}
                  updatePage={() => updatePage()}
                  t={t}
                />
              </Grid>
            ))}
          </Grid>
        )}
        {stakedNfts && stakedNfts.length > 0 && (
          <Grid container spacing={2} sx={{ my: 2 }}>
            {map(stakedNfts, (item: StakedNFT, key: number) => (
              <Grid key={`staked_nft_grid_${key}`} item xs={12} md={6} lg={3}>
                <StakedNFTCard
                  key={`staked_nft_card#${item.nftAddress}`}
                  lockTime={item.lockTime}
                  model={item.model}
                  mint={item.nftAddress}
                  rate={item.rate}
                  rewardTime={item.rewardTime}
                  stakedTime={item.stakedTime}
                  startLoading={() => startLoading()}
                  closeLoading={() => closeLoading()}
                  updatePage={() => updatePage()}
                  t={t}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

interface StakedNFT {
  lockTime: number;
  model: number;
  nftAddress: string;
  rate: number;
  rewardTime: number;
  stakedTime: number;
}
