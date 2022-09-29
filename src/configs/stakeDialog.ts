// Decrepated
// Please ignore this file

import {
  ALLOWED_LOCKDAYS,
  ALLOWED_MODELS,
  MODEL_CAN_SELECT_LOCKDAYS,
} from "../config";

export const stakeDialog = {
  type: "dialog",
  items: [
    {
      type: "content",
      items: [
        {
          type: "iconButton",
          icon: "CloseIcon",
          iconColor: "#808080",
          sx: {
            position: "absolute",
            right: 10,
            top: 10,
          },
          onClick: (event: any, { onClose }: any) => onClose(),
        },
        {
          type: "box",
          sx: {
            display: "flex",
          },
          items: [
            {
              type: "image",
              image: ({ dataModel }: any) => dataModel.image,
              showLoading: true,
              width: 120,
              height: 120,
            },
            {
              type: "box",
              sx: { px: 2 },
              items: [
                {
                  type: "typography",
                  sx: { mb: 1 },
                  component: "h6",
                  label: ({ dataModel }: any) => dataModel.name,
                },
                {
                  type: "chip",
                  variant: "outlined",
                  label: ({ t, dataModel }: any) =>
                    `${t("DESCRIPTION.ROLE")}: ${dataModel.symbol}`,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "content",
      dividers: true,
      items: [
        {
          type: "box",
          items: [
            {
              type: "form",
              items: [
                {
                  type: "radioGroup",
                  dataPath: "model",
                  onChange: (event: any, { handleChange }: any) =>
                    handleChange("model", event),
                  options: ALLOWED_MODELS,
                },
              ],
            },
          ],
        },
        {
          type: "box",
          sx: {
            ml: 2,
          },
          hidden: ({ model }: any) => model !== MODEL_CAN_SELECT_LOCKDAYS,
          items: [
            {
              type: "form",
              sx: {
                marginLeft: 2,
              },
              items: [
                {
                  type: "radioGroup",
                  dataPath: "lockDay",
                  row: true,
                  radio: {
                    size: "small",
                  },
                  onChange: (event: any, { handleChange }: any) =>
                    handleChange("lockDay", event),
                  options: ALLOWED_LOCKDAYS,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  buttons: [
    {
      type: "button",
      label: "ACTIONS.STAKE_NOW",
      color: "success",
      variant: "outlined",
      sx: {
        mt: 2,
        borderRadius: 5000,
      },
      onClick: (event: any, { onStake, model, lockDay }: any) =>
        onStake(model, lockDay),
    },
  ],
};
