import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import useAuth from "../hooks/useAuth";
import ReactIcon from "../assets/react.svg";
import Icon from "@mui/material/Icon";
import ButtonGroup from '@mui/material/ButtonGroup';
import LogoutModal from "./LogoutModal";
import Badge from '@mui/material/Badge';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ApiClient from "../services/ApiClient";

import { websocket_url } from '../utils/constant';
import useBazar from "../hooks/useBazar";

export default function NavBar() {
  const { user, openLogoutModal, handleOpenLogoutModal, handleCloseLogoutModal } = useAuth();
  const { 
    ongoingBazar,
    fetchBazarList,
  } = useBazar();

  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationMessage, setNotificationMessage] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handlePlayAudio = () => {
    const audio_player = new Audio('/assets/whatsapp_tone.mp3');
    audio_player.play()
      .then(() => { console.log('Audio played'); })
      .catch((error) => {
          console.log('Error playing audio:', error);
      });
  }

  const connectChatWebSocket = () => {
    let socket = null;
    if (user && ongoingBazar && user?.data?.id === ongoingBazar?.shopper) {
      const socket = new WebSocket(`${websocket_url}/notification/?shopper_id=${ongoingBazar?.shopper}`)

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data?.type === "message_notification") {
          if (data?.response_type === "initial_msg_notification") {
            setNotificationCount(data?.total_unread_notification)

          } else if (data?.response_type === "latest_msg_notification") {
            setNotificationCount(prevCount => prevCount + 1);
            fetchBazarList();
            
            if (document.hidden) {
              const audio_player = new Audio('/assets/whatsapp_tone.mp3');
              audio_player.play()
              .then(() => { console.log('Audio played'); })
              .catch((error) => {
                console.log("error", error)
                if (error.name === 'NotAllowedError') {
                  // Handle the error when play() is called without user interaction
                  const playButton = document.getElementById('playButton');
                  playButton.click();

                } else {
                  // Handle other errors
                  console.log('Error playing audio:', error);
                }
              });
            };
          }
        }
      };

      socket.onclose = () => {
        // Implement a reconnection strategy here
        setTimeout(() => {
          console.log('Attempting to reconnect chat socket...', socket);
          connectChatWebSocket();
        }, 2000); // Retry after 2 seconds
      }
    }
    return socket
  }

  // Websocket chat connection building
  useEffect(() => {
    if (!ongoingBazar?.shopper) return

    // Socket connection
    let socket = connectChatWebSocket()

    // Clean up the WebSocket connection on component unmount
    return () => {
      socket?.close();
    };
  }, [ongoingBazar, user])

  const handelNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
    handleGetNotifications();
  };

  const handelNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleGetNotifications = async () => {
    setIsNotificationLoading(true);

    await ApiClient.get(`/notifications/${user?.data?.id}/`)
      .then((res) => {
        setNotificationMessage(res.data);
        setNotificationCount(0);
        setNotificationError("");
      })
      .catch((err) => {
        setNotificationError("Something went wrong!");
      })
      .finally(() => setIsNotificationLoading(false));
  };


  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Icon sx={{ display: { xs: "none", md: "flex" }, mr: 1, width: "auto" }}>
            <img src={ReactIcon} alt="Logo" />
          </Icon>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            VTORY
          </Typography>

          <Icon sx={{ display: { xs: "flex", md: "none" }, mr: 1, width: "auto" }}>
            <img src={ReactIcon} alt="Logo" />
          </Icon>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            VTORY
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
            }}
          >
            <Button color="inherit" href="/how-to-use">
              How to Use?
            </Button>
          </Box>
          <Box sx={{ flexGrow: 0, mr: 2 }} className="auth-box">
            <Badge badgeContent={notificationCount} color="primary">
              <NotificationsNoneIcon onClick={handelNotificationClick} />
              <Button id="playButton" type="button" style={{ display: 'none' }} onClick={handlePlayAudio}>Play</Button>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handelNotificationClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                {notificationMessage?.notification_messages?.length > 0 ? (
                  notificationMessage?.notification_messages.map((notification, notificationIndex) => (
                    <MenuItem key={notificationIndex}>{notification}</MenuItem>
                  ))
                ) : null}
              </Menu>

            </Badge>
          </Box>
          <Box sx={{ flexGrow: 0 }} className="auth-box">
            {user?.isAuthenticated ? (
              <ButtonGroup orientation="vertical" aria-label="Vertical button group">
                <>{user?.data?.username ? "( " + user.data.username + " )" : ""}</>
                <Button className="logout-button" onClick={handleOpenLogoutModal}>
                  Logout
                </Button>
              </ButtonGroup>
            ) : (
              ""
            )}
          </Box>
        </Toolbar>

        {/* Log modal */}
        {openLogoutModal ? (
          <LogoutModal
            openLogoutModal={openLogoutModal}
            handleCloseLogoutModal={handleCloseLogoutModal}
          />
        ) : (
          ""
        )}
      </Container>
    </AppBar>
  );
}
