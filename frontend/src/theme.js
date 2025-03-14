import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00796B",
      dark: "#004D40",
      light: "#48A999",
    },
    secondary: {
      light: "#6FAF9F",
      main: "#4E9A89",
      dark: "#357A68",
    },
    background: {
      default: "#ECEFF1",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#212121",
      secondary: "#546E7A",
      light: "#FFFFFF",
    },
    success: {
      main: "#388E3C",
    },
    error: {
      main: "#D32F2F",
    },
    warning: {
      main: "#F57C00",
    },
    info: {
      main: "#0288D1",
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.6 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          textTransform: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});

export default theme;
