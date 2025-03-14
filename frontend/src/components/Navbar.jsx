import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const theme = useTheme();
  const { loggedIn, logout, user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const userInitial =
    typeof user === "string" ? user.slice(0, 1).toUpperCase() : "";

  return (
    <AppBar
      position="static"
      sx={{
        background: theme.palette.primary.main,
        boxShadow: "none",
        paddingY: 1,
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            letterSpacing: 1.5,
            cursor: "pointer",
            color: theme.palette.text.light,
          }}
          onClick={() => (window.location.href = "/")}
        >
          MovieVault
        </Typography>

        <Box>
          {loggedIn ? (
            <>
              <IconButton
                onClick={handleMenuOpen}
                sx={{ color: theme.palette.text.light }}
              >
                <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                  {userInitial}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                sx={{
                  "& .MuiPaper-root": {
                    backgroundColor: theme.palette.primary.dark,
                    color: theme.palette.text.light,
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    window.location.href = "/profile";
                    handleMenuClose();
                  }}
                >
                  View Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              href="/login"
              sx={{
                backgroundColor: theme.palette.secondary.light,
                color: theme.palette.text.light,
                paddingX: 3,
                borderRadius: 2,
                "&:hover": { backgroundColor: theme.palette.secondary.main },
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
