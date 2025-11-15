import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1e88ff", 
    },
    background: {
      default: "#f9fafb", 
    },
  },

  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  components: {
    MuiButton: {
    styleOverrides: {
        root: ({ ownerState }) => ({
        ...(ownerState.variant === "text"
            ? {}
            : {
                borderRadius: 25,
                paddingTop: 10,
                paddingBottom: 10,
                fontSize: "16px",
                backgroundColor: "#1e88ff",
                color: "white",
                "&:hover": {
                backgroundColor: "#1674da",
                },
            }),
        }),
    },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: "#fafafa",
          borderRadius: 12,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.elevation && ownerState.elevation > 0
            ? { borderRadius: 20 }
            : {}),
        }),
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: "none", 
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48,
        },
        indicator: {
          height: 3,
          borderRadius: 0, 
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 48,
          padding: "12px 24px",
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
