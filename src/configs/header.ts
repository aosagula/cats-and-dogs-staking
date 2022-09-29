const handleOpenNavMenu = (
  event: React.MouseEvent<HTMLElement>,
  { setAnchorElNav }: any
) => {
  setAnchorElNav(event.currentTarget);
};
const handleCloseNavMenu = (
  event: React.MouseEvent<HTMLElement>,
  { setAnchorElNav }: any
) => {
  setAnchorElNav(null);
};

const handleTwitterClick = (
  event: React.MouseEvent<HTMLElement>,
  { config }: any
) => {
  if (config && config.twitter) {
    window.open(config.twitter, "_blank");
  }
};
const handleDiscordClick = (
  event: React.MouseEvent<HTMLElement>,
  { config }: any
) => {
  if (config && config.discord) {
    window.open(config.discord, "_blank");
  }
};
export const header = {
  position: "static",
  maxWidth: "xl",
  disableGutters: true,
  color: "transparent",
  items: [
    {
      type: "box",
      sx: {
        flexGrow: 1,
        display: {
          xs: "flex",
          md: "none",
        },
      },
      items: [
        {
          type: "iconButton",
          size: "large",
          color: "inherit",
          iconColor: "#808080",
          icon: "MenuIcon",
          onClick: handleOpenNavMenu,
        },
        {
          type: "menu",
          id: "menu-appbar",
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          keepMounted: true,
          transformOrigin: {
            vertical: "top",
            horizontal: "left",
          },
          onClose: handleCloseNavMenu,
          sx: {
            display: { xs: "block", md: "none" },
          },
          items: [
            {
              type: "typography",
              label: "STAKING.TITLE",
              textAlign: "center",
              sx: {
                px: 2,
              },
            },
          ],
        },
      ],
    },
    {
      type: "grid",
      spacing: 2,
      sx: {
        justifyContent: "flex-end",
      },
      items: [
        {
          type: "gridItem",
          xs: 6,
          sx: {
            display: { xs: "none", md: "flex" },
            alignItems: "center",
          },
          items: [
            {
              type: "avatar",
              src: "images/logo.jpeg",
              sx: { mr: 1 },
            },
            {
              type: "typography",
              variant: "h6",
              noWrap: true,
              component: "a",
              href: "/",
              sx: {
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "text.primary",
                textDecoration: "none",
              },
              label: "TITLE",
            },
          ],
        },
        {
          type: "gridItem",
          xs: 6,
          sx: {
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          },
          items: [
            {
              type: "toggleColorButton",
              iconColor: "#808080",
              sx: {
                mr: 2,
              },
            },
            {
              type: "iconButton",
              icon: "TwitterIcon",
              iconColor: "#808080",
              sx: {
                mr: 2,
              },
              onClick: handleTwitterClick,
            },
            {
              type: "iconButton",
              icon: "DiscordIcon",
              iconColor: "#808080",
              sx: {
                mr: 2,
              },
              onClick: handleDiscordClick,
            },
            {
              type: "wallet",
              variant: "outlined",
              sx: {
                borderRadius: 5000,
              },
            },
          ],
        },
      ],
    },
  ],
};
