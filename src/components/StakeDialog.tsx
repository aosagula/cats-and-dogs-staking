import { Dialog, useTheme } from "@mui/material";
import { useState } from "react";
import { DEFAULT_LOCKDAY, DEFAULT_MODEL } from "../config";
import { stakeDialog } from "../configs/stakeDialog";
import { TemplateItem } from "./TemplateItem";

export function StakeDialog(props: {
  opened: boolean;
  onClose: Function;
  dataModel: any,
  pipe: any;
}) {
  const {
    opened,
    onClose,
    dataModel,
    pipe,
  } = props;
  const {
    startLoading,
    closeLoading,
    onStake,
    t,
  } = pipe;
  const theme = useTheme();
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [lockDay, setLockDay] = useState(DEFAULT_LOCKDAY);

  const handleChange = (key: string, event: any) => {
    switch (key) {
      case 'model': setModel(event.target.value);
      break;
      case 'lockDay': setLockDay(event.target.value);
    }
  };

  return (
  <Dialog open={opened}>
    <TemplateItem key='stakeDialogItem' items={[stakeDialog]} pipe={{
      startLoading, closeLoading,
      t, theme, opened, onClose, dataModel, model, lockDay, handleChange, onStake
    }}></TemplateItem>
  </Dialog>)
}