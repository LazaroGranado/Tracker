/* eslint-disable */
import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, Link } from "react-router-dom";
import {
  Sidebar,
  Menu,
  MenuItem,
  useProSidebar,
  SubMenu,
} from "react-pro-sidebar";
import MenuMui from "@mui/material/Menu";
import MenuItemMui from "@mui/material/MenuItem";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "rgb(18, 18, 18)",
  border: "2px solid #000",
  boxShadow: 25,
  p: 5,
  borderRadius: "10px",
};

const issueTrackerLogoutReturnTo =
  process.env.REACT_APP_ISSUETRACKERLOGOUTRETURNTO;

const issueTrackerClientId = process.env.REACT_APP_ISSUETRACKERCLIENTID;

export default function Header(props) {
  let toggleSidenav;
  const { collapseSidebar, toggleSidebar, toggled, collapsed, broken } =
    useProSidebar();
  const { logout, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);

  const [current, setCurrent] = useState();

  const [settingsDisplayMode, setSettingsDisplayMode] = useState("none");

  let currentRoute = window.location.pathname;

  let currentPage;

  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);

  const [windowWidth, setWindowWidth] = useState();

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  if (window.innerWidth < 768) {
    toggleSidenav = toggleSidebar;
  } else {
    toggleSidenav = collapseSidebar;
  }

  function signOut() {
    return logout({
      returnTo: issueTrackerLogoutReturnTo,
      clientID: issueTrackerClientId,
    });
  }

  function DisplaySettings() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = (e) => {
      setAnchorEl(null);
    };

    const [openSettingsModal, setOpenSettingsModal] = React.useState(false);
    const handleOpenSettingsModal = () => setOpenSettingsModal(true);
    const handleCloseSettingsModal = () => {
      handleClose();
      setOpenSettingsModal(false);
    };

    function SettingsModal() {
      return (
        <div>
          <Modal
            open={openSettingsModal}
            onClose={handleCloseSettingsModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            disableAutoFocus={true}
            slotProps={{
              backdrop: { style: { background: "rgba(0, 0, 0, .8)" } },
            }}
          >
            <Box sx={style} className="mainModal">
              <CloseRoundedIcon
                onClick={handleCloseSettingsModal}
                className="modalClose"
              />

              <div>
                <p className="text-center mb-0" style={{ color: "#c15353" }}>
                  Access restricted for demo accounts.
                </p>
              </div>
            </Box>
          </Modal>
        </div>
      );
    }

    return (
      <div>
        <SettingsRoundedIcon
          onClick={handleClick}
          className="settingsRoundedIcon"
        />

        <MenuMui
          sx={{ mt: "1.4rem", width: "12rem" }}
          PaperProps={{
            style: {
              backgroundColor: "rgb(21, 21, 21)",
            },
          }}
          inputProps={{ style: { backgroundColor: "rgb(21, 21, 21)" } }}
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <div value="Settings" onClick={handleOpenSettingsModal}>
            <MenuItemMui
              sx={{ width: "12rem", padding: 2, color: "rgb(255,255,255)" }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "rgba(72, 72, 72, 0.18)")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "rgb(21, 21, 21)")
              }
            >
              Settings
            </MenuItemMui>
          </div>

          <div onClick={signOut}>
            <MenuItemMui
              sx={{ width: "12rem", padding: 2, color: "#a33b3b" }}
              onClick={handleClose}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "rgba(72, 72, 72, 0.18)")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "rgb(21, 21, 21)")
              }
            >
              Sign out
            </MenuItemMui>
          </div>
        </MenuMui>

        <SettingsModal />
      </div>
    );
  }

  return (
    <div>
      <Navbar bg="light" style={props.style}>
        <Container className="mx-0 moveHamburgerToRight">
          <div class="sideNavToggleDiv">
            <Nav>
              <Navbar.Brand
                style={{ marginLeft: ".78rem", marginRight: ".78rem" }}
              >
                <MenuRoundedIcon
                  onClick={props.onClickToggle}
                  className="toggleIconLayoutHeader"
                />
              </Navbar.Brand>
            </Nav>
          </div>

          <Navbar.Toggle />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="marginLeft me-auto">
              <Link to={props.contactsHref}>{props.contacts}</Link>
            </Nav>

            <Nav></Nav>

            <div class="settingsToggleDiv">
              <Nav>
                <Navbar.Brand
                  style={{
                    marginLeft: ".65rem",
                    marginRight: ".78rem",
                    marginTop: ".15rem",
                  }}
                >
                  <DisplaySettings />
                </Navbar.Brand>
              </Nav>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}
