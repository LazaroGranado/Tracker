/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  Menu,
  MenuItem,
  useProSidebar,
  SubMenu,
} from "react-pro-sidebar";
import Header from "../components/Header.js";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useAuth0 } from "@auth0/auth0-react";
import jwt from "jsonwebtoken";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

let collapsedSidenavManuallySet = false;

const userRolesKey = process.env.REACT_APP_ROLESKEY;

const Layout = (props) => {
  const { loading } = props;

  const navigate = useNavigate();

  const location = useLocation();
  const currentPage = location.pathname.toLowerCase();

  let routesToHideNav = [
    "/login",
    "/signup",
    "/passwordreset",
    "/demo/login",
    "/",
  ];

  let toggleSidenav;

  const { collapseSidebar, toggleSidebar, toggled, collapsed, broken } =
    useProSidebar();
  const [sideBarIconDivClass, setSideBarIconDivClass] = useState();
  const [sideBarIconText, setSideBarIconText] = useState();
  const [listBottomPosition, setListBottomPosition] = useState();

  const [marginLeftIcon, setMarginLeftIcon] = useState();
  const [expandIconDisplay, setExpandIconDisplay] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const { getAccessTokenSilently } = useAuth0();

  const [isCollapsed, setIsCollapsed] = useState();
  const [admin, setAdmin] = useState(false);
  const [projectManager, setProjectManager] = useState(false);
  const [sideBarDisplay, setSideBarDisplay] = useState("none");
  const [navBarDisplay, setNavBarDisplay] = useState("none");

  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);

  let width = windowSize[0];

  useEffect(() => {
    if (collapsed) {
      setListBottomPosition(".59rem");
      setSideBarIconDivClass("sideNavIconDivCollapsed");
      setMarginLeftIcon(".7rem");
      setExpandIconDisplay("none");
    } else {
      setListBottomPosition("-.1rem");
      setSideBarIconDivClass("sideNavIconDiv");
      setMarginLeftIcon("0rem");
      setExpandIconDisplay("inline-block");
    }
    setIsCollapsed(collapsed);

    setWindowWidth(window.innerWidth);

    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleWindowResize);

    let userId;

    getAccessTokenSilently({ detailedResponse: true, cacheMode: "cache-only" })
      .then((r) => {
        if (r) {
          const decodeIdToken = async () => {
            const decodedIdToken = jwt.decode(r.id_token);
            userId = decodedIdToken.sub;

            if (userId) {
              const userRoles = decodedIdToken[userRolesKey];

              if (userRoles.includes("Administrator")) {
                setAdmin(true);
              }
              if (userRoles.includes("Project Manager")) {
                setProjectManager(true);
              }

              setSideBarDisplay("block");
              setNavBarDisplay("flex");
              setIsLoading(false);
            } else {
            }
          };

          decodeIdToken();
        }
      })
      .catch((e) => {});

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  useEffect(() => {}, [loading]);

  if (window.innerWidth < 768) {
    toggleSidenav = toggleSidebar;
  } else {
    toggleSidenav = collapseSidebar;
  }

  let handleWindowResize = () => {
    if (windowSize[0] > 768) {
      if (toggled) toggleSidebar();
    }

    if (windowSize[0] < 1297 && collapsedSidenavManuallySet === false) {
      if (!broken) {
        if (!isCollapsed) {
          setListBottomPosition(".59rem");
          setSideBarIconDivClass("sideNavIconDivCollapsed");
          setMarginLeftIcon(".7rem");
          setExpandIconDisplay("none");

          setIsCollapsed(!isCollapsed);

          collapseSidebar();
        }
      }
    } else if (windowSize[0] > 1297 && collapsedSidenavManuallySet === false) {
      if (isCollapsed) {
        setListBottomPosition("-.1rem");
        setSideBarIconDivClass("sideNavIconDiv");
        setMarginLeftIcon("0rem");
        setExpandIconDisplay("inline-block");

        setIsCollapsed(!isCollapsed);

        collapseSidebar();
      }
    }
  };

  handleWindowResize();

  const [windowWidth, setWindowWidth] = useState();

  function handleCollapse() {
    if (windowWidth > 768) {
      if (isCollapsed) {
        setListBottomPosition("-.1rem");
        setSideBarIconDivClass("sideNavIconDiv");
        setMarginLeftIcon("0rem");
        setExpandIconDisplay("inline-block");
      } else {
        setListBottomPosition(".59rem");
        setSideBarIconDivClass("sideNavIconDivCollapsed");
        setMarginLeftIcon(".7rem");
        setExpandIconDisplay("none");
      }

      collapsedSidenavManuallySet = true;

      setIsCollapsed(!isCollapsed);

      collapseSidebar();
    } else {
      if (collapsed) {
        setListBottomPosition("-.1rem");
        setSideBarIconDivClass("sideNavIconDiv");
        setMarginLeftIcon("0rem");
        setExpandIconDisplay("inline-block");

        setIsCollapsed(!isCollapsed);

        collapseSidebar();
        toggleSidenav();
      } else {
        toggleSidenav();
      }
    }
  }

  function handleEnableLink(e) {
    !collapsed && e.preventDefault();
  }

  function NestedList() {
    const [open, setOpen] = React.useState();
    const [openTickets, setOpenTickets] = React.useState();
    const [openProjects, setOpenProjects] = React.useState();
    const [openAdmin, setOpenAdmin] = React.useState();

    const handleOpenTickets = () => {
      if (openProjects) setOpenProjects(!openProjects);
      if (openAdmin) setOpenAdmin(!openAdmin);

      setOpenTickets(!openTickets);
    };

    const handleOpenProjects = () => {
      if (openTickets) setOpenTickets(!openTickets);
      if (openAdmin) setOpenAdmin(!openAdmin);

      setOpenProjects(!openProjects);
    };

    const handleOpenAdmin = () => {
      if (openTickets) setOpenTickets(!openTickets);
      if (openProjects) setOpenProjects(!openProjects);

      setOpenAdmin(!openAdmin);
    };

    return (
      <List
        sx={{
          width: "100%",
          maxWidth: 360,
          bgcolor: "f1f1f1",
          bottom: listBottomPosition,
        }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      >
        <Link to="/Home">
          <div className={sideBarIconDivClass}>
            <ListItemButton
              className="sideNavMuiButton"
              disableRipple
              style={{ position: "static" }}
            >
              {isCollapsed ? (
                <HomeRoundedIcon className="homeRoundedIconCollapsed" />
              ) : (
                <HomeRoundedIcon className="homeRoundedIconOpen" />
              )}

              {!isCollapsed && (
                <span
                  className="homeTextOpen"
                  style={{
                    color: "#f1f1f1",
                    fontSize: ".9rem",
                  }}
                >
                  Home
                </span>
              )}
            </ListItemButton>
            {isCollapsed && (
              <p
                className="mb-0 mediumFont pt-1"
                style={{
                  color: "#f1f1f1",
                  right: ".59rem",
                  marginTop: ".33rem",
                  position: "relative",
                }}
              >
                Home
              </p>
            )}
          </div>
        </Link>

        {!isCollapsed && (
          <Link to="/Company">
            <div className={sideBarIconDivClass} key={collapsed} style={{}}>
              <ListItemButton className="sideNavMuiButton" disableRipple>
                <ApartmentRoundedIcon className="buildingRoundedIconOpen" />

                <span
                  className="homeTextOpen"
                  style={{
                    color: "#f1f1f1",
                    fontSize: ".9rem",
                  }}
                >
                  Company
                </span>
              </ListItemButton>
            </div>
          </Link>
        )}

        {!isCollapsed && <hr style={{ width: "90%", margin: ".72rem auto" }} />}

        <Link onClick={handleEnableLink} to="/Projects">
          <div className={sideBarIconDivClass} style={{}}>
            <ListItemButton
              className="sideNavMuiButton"
              disableRipple
              onClick={handleOpenProjects}
            >
              {isCollapsed ? (
                <FolderRoundedIcon className="folderRoundedIconCollapsed" />
              ) : (
                <FolderRoundedIcon className="folderRoundedIconOpen" />
              )}

              {!isCollapsed && (
                <span
                  className="homeTextOpen"
                  style={{
                    color: "#f1f1f1",
                    fontSize: ".9rem",
                  }}
                >
                  Projects
                </span>
              )}

              <div
                className="expandIconDiv"
                style={{ display: expandIconDisplay }}
              >
                {!isCollapsed && openProjects ? (
                  <ExpandLess className="expandIcon" />
                ) : (
                  <ExpandMore className="expandIcon" />
                )}
              </div>
            </ListItemButton>
            {isCollapsed && (
              <p
                className="mb-0 mediumFont pt-1"
                style={{
                  color: "#f1f1f1",
                  right: ".61rem",
                  marginTop: ".3rem",
                  position: "relative",
                }}
              >
                Projects
              </p>
            )}
          </div>
        </Link>

        {!isCollapsed && (
          <Collapse in={openProjects} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {admin ? (
                <Link to="/Projects/Create">
                  <div className="sideNavIconDivInnerText">
                    <ListItemButton sx={{ pl: 3 }}>
                      <a className="sideNavText">Create Project</a>
                    </ListItemButton>
                  </div>
                </Link>
              ) : (
                projectManager && (
                  <Link to="/Projects/Create">
                    <div className="sideNavIconDivInnerText">
                      <ListItemButton sx={{ pl: 3 }}>
                        <a className="sideNavText">Create Project</a>
                      </ListItemButton>
                    </div>
                  </Link>
                )
              )}

              {!admin && (
                <Link to="/Projects/MyProjects">
                  <div className="sideNavIconDivInnerText">
                    <ListItemButton sx={{ pl: 3 }}>
                      <a className="sideNavText">My Projects</a>
                    </ListItemButton>
                  </div>
                </Link>
              )}

              <Link to="/Projects">
                <div className="sideNavIconDivInnerText">
                  <ListItemButton sx={{ pl: 3 }}>
                    <a className="sideNavText">All Projects</a>
                  </ListItemButton>
                </div>
              </Link>

              <Link to="/Projects/Archived">
                <div className="sideNavIconDivInnerText">
                  <ListItemButton sx={{ pl: 3 }}>
                    <a className="sideNavText">Archived Projects</a>
                  </ListItemButton>
                </div>
              </Link>
              <Link to="/Projects/Unassigned">
                <div className="sideNavIconDivInnerText">
                  <ListItemButton sx={{ pl: 3 }}>
                    <a className="sideNavText">Unassigned Projects</a>
                  </ListItemButton>
                </div>
              </Link>
            </List>
          </Collapse>
        )}

        <Link onClick={handleEnableLink} to="/Tickets">
          <div className={sideBarIconDivClass}>
            <ListItemButton
              className="sideNavMuiButton"
              disableRipple
              onClick={handleOpenTickets}
            >
              {isCollapsed ? (
                <ConfirmationNumberRoundedIcon className="folderRoundedIconCollapsed" />
              ) : (
                <ConfirmationNumberRoundedIcon className="folderRoundedIconOpen" />
              )}

              {!isCollapsed && (
                <span
                  className="homeTextOpen"
                  style={{
                    color: "#f1f1f1",
                    fontSize: ".9rem",
                  }}
                >
                  Tickets
                </span>
              )}

              <div
                className="expandIconDiv"
                style={{ display: expandIconDisplay }}
              >
                {!isCollapsed && openTickets ? <ExpandLess /> : <ExpandMore />}
              </div>
            </ListItemButton>
            {isCollapsed && (
              <p
                className="mb-0 mediumFont pt-1"
                style={{
                  color: "#f1f1f1",
                  right: ".61rem",
                  marginTop: ".33rem",
                  position: "relative",
                }}
              >
                Tickets
              </p>
            )}
          </div>
        </Link>

        {!isCollapsed && (
          <Collapse in={openTickets} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <Link to="/Tickets/Create">
                <div className="sideNavIconDivInnerText">
                  <ListItemButton sx={{ pl: 3 }}>
                    <a className="sideNavText">Create Ticket</a>
                  </ListItemButton>
                </div>
              </Link>
              {!admin && (
                <Link to="Tickets/MyTickets">
                  <div className="sideNavIconDivInnerText">
                    <ListItemButton sx={{ pl: 3 }}>
                      <a className="sideNavText">My Tickets</a>
                    </ListItemButton>
                  </div>
                </Link>
              )}

              <Link to="/Tickets">
                <div className="sideNavIconDivInnerText">
                  <ListItemButton sx={{ pl: 3 }}>
                    <a className="sideNavText">All Tickets</a>
                  </ListItemButton>
                </div>
              </Link>

              <Link to="/Tickets/Archived">
                <div className="sideNavIconDivInnerText">
                  <ListItemButton sx={{ pl: 3 }}>
                    <a className="sideNavText">Archived Tickets</a>
                  </ListItemButton>
                </div>
              </Link>
              <Link to="/Tickets/Unassigned">
                <div className="sideNavIconDivInnerText">
                  <ListItemButton sx={{ pl: 3 }}>
                    <a className="sideNavText">Unassigned Tickets</a>
                  </ListItemButton>
                </div>
              </Link>
            </List>
          </Collapse>
        )}

        <Link onClick={handleEnableLink}>
          {!collapsed && admin && (
            <div className={sideBarIconDivClass}>
              <ListItemButton
                className="sideNavMuiButton"
                disableRipple
                onClick={handleOpenAdmin}
              >
                <ConstructionRoundedIcon className="folderRoundedIconOpen" />

                {collapsed && (
                  <p
                    className="mb-0 mediumFont pt-1"
                    style={{ color: "#f1f1f1", marginLeft: "0rem" }}
                  >
                    Admin Tools
                  </p>
                )}

                {!collapsed && (
                  <span
                    className="homeTextOpen"
                    style={{
                      color: "#f1f1f1",
                      fontSize: ".9rem",
                    }}
                  >
                    Admin Tools
                  </span>
                )}

                <div className="expandIconDiv">
                  {openAdmin ? <ExpandLess /> : <ExpandMore />}
                </div>
              </ListItemButton>
            </div>
          )}
        </Link>

        <Collapse in={openAdmin} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link to="/ManageRoles">
              <div className="sideNavIconDivInnerText">
                <ListItemButton sx={{ pl: 3 }}>
                  <a className="sideNavText">Manage Roles</a>
                </ListItemButton>
              </div>
            </Link>
          </List>
        </Collapse>
      </List>
    );
  }

  return (
    <>
      {!routesToHideNav.includes(currentPage) && (
        <Header
          style={{ display: navBarDisplay }}
          onClickToggle={handleCollapse}
        />
      )}
      <div style={{ display: "flex", height: "100vh" }}>
        {!routesToHideNav.includes(currentPage) && (
          <Sidebar
            backgroundColor={"#0d0d0d"}
            breakPoint={"md"}
            transitionDuration="0"
            className="cssSidebar"
            style={{ display: sideBarDisplay }}
          >
            {windowWidth < 768 && (
              <MenuRoundedIcon
                onClick={() => {
                  toggleSidenav();
                }}
                className="toggleIconSmallViewport"
              />
            )}

            <div className="row">
              <div className="col-md-12 mt-1">
                <Menu>
                  <NestedList />
                </Menu>
              </div>
            </div>
          </Sidebar>
        )}

        <Outlet />
      </div>
    </>
  );
};

export default Layout;
