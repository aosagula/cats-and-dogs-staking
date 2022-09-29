import { AppBar, Breakpoint, Container, Toolbar } from "@mui/material";
import { useState } from "react";
import { TFunction } from "react-i18next";
import { TemplateItem } from "./TemplateItem";

export default function Header(props: {
  position?: "fixed" | "absolute" | "sticky" | "static" | "relative";
  color?: "inherit" | "primary" | "secondary" | "default" | "transparent";
  maxWidth?: Breakpoint;
  disableGutters?: boolean;
  items: any;
  t: TFunction;
  theme: any;
  colorMode: any;
  config: any;
}) {
  const {
    position,
    color,
    maxWidth,
    disableGutters,
    items,
    t,
    theme,
    colorMode,
    config,
  } = props;
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  return (
    <AppBar
      position={position}
      color={color}
      sx={{
        backgroundColor: "background.default",
        color: "text.primary",
      }}
    >
      <Container maxWidth={maxWidth}>
        <Toolbar disableGutters={disableGutters}>
          <TemplateItem
            items={items}
            pipe={{ anchorElNav, setAnchorElNav, t, theme, colorMode, config }}
          ></TemplateItem>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
