export const fields = [
  {
    label: "RATES.NORMAL",
    key: "normalRate",
  },
  {
    label: "RATES.TOTAL_AMOUNT",
    key: "totalAmount",
    base: 1,
  },
];
export const dashboard = {
  maxWidth: "xl",
  className: "dashboard-container",
  sx: {
    p: 4,
    backgroundColor: "background.default",
    color: "text.primary",
  },
  items: [
    {
      type: "paper",
      elevation: 0,
      items: [
        {
          type: "gridList",
          spacing: 2,
          breakpoints: {
            xs: 6,
            md: 3,
          },
          elevation: 1,
          items: fields,
          sx: {
            p: 2,
            display: { xs: "block", md: "flex" },
            justifyContent: "space-between",
          },
          extraItems: [
            {
              type: "gridItem",
              xs: 6,
              md: 3,
              items: [
                {
                  type: "paper",
                  elevation: 1,
                  sx: {
                    p: 2,
                    display: { xs: "block", md: "flex" },
                    justifyContent: "space-between",
                  },
                  items: [
                    {
                      type: "typography",
                      component: "h6",
                      label: "DASHBOARD.STAKED_NFT_COUNT",
                      noWrap: true,
                    },
                    {
                      type: "typography",
                      component: "p",
                      label: ({ userStakedCount }: any) => userStakedCount,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "paper",
      elevation: 0,
      items: [
        {
          type: "grid",
          sx: { justifyContent: "flex-end", py: 2 },
          items: [
            {
              type: "colorButton",
              colorname: "purple",
              variant: "contained",
              onClick: (event: any, { handleStakeAll }: any) =>
                handleStakeAll(), // Contract not yet support multiple instructions
              sx: {
                borderRadius: 5000,
                textTransform: "none",
                marginRight: "8px",
              },
              label: ({ t }: any) => t("ACTIONS.STAKE_ALL"),
            },
            {
              type: "colorButton",
              colorname: "red",
              variant: "contained",
              onClick: (event: any, { handleUnstakeAll }: any) =>
                handleUnstakeAll(), // Contract not yet support multiple instructions
              sx: {
                borderRadius: 5000,
                textTransform: "none",
                marginRight: "8px",
              },
              label: ({ t }: any) => t("ACTIONS.UNSTAKE_ALL"),
            },
            {
              type: "colorButton",
              colorname: "yellow",
              variant: "contained",
              onClick: (event: any, { handleClaimAll }: any) =>
                handleClaimAll(),
              sx: {
                borderRadius: 5000,
                textTransform: "none",
              },
              label: ({ t, rewardAmount }: any) =>
                `${t(
                  "ACTIONS.CLAIM_ALL"
                )} (${rewardAmount.toLocaleString()} ${t("TOKEN.NAME")})`,
            },
          ],
        },
      ],
    },
  ],
};
