import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { find } from "lodash";
import moment from "moment";
import { ALLOWED_MODELS } from "../config";

export const nftCard = (
  { image, name, symbol, attributes }: any,
  { handleStake }: any
) => ({
  type: "card",
  alt: "",
  showLoading: true,
  image: image,
  src: image,
  title: name,
  sx: {
    borderRadius: 4,
  },
  description: symbol,
  canExpand: true,
  buttons: [
    {
      type: "button",
      label: "ACTIONS.STAKE",
      color: "success",
      variant: "outlined",
      sx: {
        marginLeft: "auto",
        borderRadius: 5000,
        fontWeight: 700,
        textTransform: "none",
      },
      onClick: () => handleStake(true),
    },
  ],
  expandItems: [
    {
      type: "collapse",
      items: [
        {
          type: "chipList",
          color: "default",
          variant: "outlined",
          sx: {
            mr: 1,
            my: 1,
          },
          data: attributes,
          label: ({ data }: any) => `${data.trait_type}: ${data.value}`,
        },
      ],
    },
  ],
});

export const stakedNftCard = (
  { name, image, model, rate, lockTime, stakedTime, attributes }: any,
  { handleUnstake, handleClaim }: any
) => ({
  type: "card",
  alt: "",
  showLoading: true,
  image: image,
  src: image,
  title: name,
  canExpand: true,
  description: [
    {
      type: "chip",
      color: "primary",
      sx: {
        mr: 1,
        my: 1,
      },
      hidden: true,
      label: ({ t }: any) =>
        `${t(find(ALLOWED_MODELS, ({ value }) => +value === model)?.label)}`,
    },
    {
      type: "chip",
      color: "secondary",
      sx: {
        mr: 1,
        my: 1,
      },
      label: ({ t }: any) =>
        `${t("TOKEN.NAME")} ${rate / LAMPORTS_PER_SOL}/${t("RATES.PER_DAY")}`,
    },
    {
      type: "chip",
      color: "info",
      sx: {
        mr: 1,
        my: 1,
      },
      hidden: true,
      label: ({ t }: any) => `${moment(lockTime * 1000).fromNow(true)}`,
    },
    {
      type: "typography",
      sx: {
        mr: 1,
        my: 1,
      },
      label: ({ t }: any) =>
        `${t("DESCRIPTION.STAKED_DURATION")}: ${moment(
          stakedTime * 1000
        ).fromNow(true)}`,
    },
  ],
  sx: {
    borderRadius: 4,
  },
  buttons: [
    {
      type: "button",
      label: "ACTIONS.UNSTAKE",
      color: "error",
      variant: "outlined",
      sx: {
        marginLeft: "auto",
        borderRadius: 5000,
        fontWeight: 700,
        textTransform: "none",
      },
      onClick: () => handleUnstake(),
    },
    {
      type: "button",
      label: "ACTIONS.CLAIM",
      color: "warning",
      variant: "outlined",
      sx: {
        borderRadius: 5000,
        fontWeight: 700,
        textTransform: "none",
      },
      onClick: () => handleClaim(),
    },
  ],
  expandItems: [
    {
      type: "collapse",
      items: [
        {
          type: "chipList",
          color: "default",
          variant: "outlined",
          sx: {
            mr: 1,
            my: 1,
          },
          data: attributes,
          label: ({ data }: any) => `${data.trait_type}: ${data.value}`,
        },
      ],
    },
  ],
});
