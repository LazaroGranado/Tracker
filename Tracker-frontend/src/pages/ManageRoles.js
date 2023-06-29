/* eslint-disable */
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import EnhancedTable from "../components/EnhancedTable.js";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import jwt from "jsonwebtoken";

function ManageRoles() {
  const navigate = useNavigate();

  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const userId = isAuthenticated && user.sub;
  const [auth0Id, setAuth0Id] = useState();

  const [tickets, setTickets] = useState();

  const [allMembers, setAllMembers] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [tableDisplay, setTableDisplay] = useState("block");

  useEffect(() => {
    let userId;

    getAccessTokenSilently({ detailedResponse: true })
      .then((r) => {
        const decodeIdToken = async () => {
          const decodedIdToken = jwt.decode(r.id_token);

          setAuth0Id(decodedIdToken.sub);
          userId = decodedIdToken.sub;

          if (userId) {
            axios
              .post(process.env.REACT_APP_SERVER + "/manageRoles", {})
              .then((r) => {
                setAllMembers(r.data);
                setIsLoading(false);

                setTimeout(() => {}, 3000);
              });
          }
        };

        decodeIdToken();
      })
      .catch((e) => {
        if (e.toString() === "Error: Login required") {
          navigate("/");
        }
      });
  }, []);

  function createData(firstName, lastName, email, MemberRoles) {
    return {
      firstName,
      lastName,
      email,
      MemberRoles,
    };
  }

  const headCells = [
    {
      id: "firstName",
      numeric: false,
      disablePadding: false,
      label: "First Name",
    },
    {
      id: "lastName",
      numeric: false,
      disablePadding: false,
      label: "Last Name",
    },
    {
      id: "email",
      numeric: false,
      disablePadding: false,
      label: "Email",
    },
    {
      id: "MemberRoles",
      numeric: false,
      disablePadding: false,
      label: "Role",
    },
  ];

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function TableHeader(props) {
    const {
      members,
      setMembers,
      setPage,
      currentPage,
      setCurrentPage,
      page,
      setSearching,
      searching,
    } = props;

    const [membersTableQuery, setMembersTableQuery] = useState();

    function handleSearch(event) {
      let newSearchQuery = event.target.value;

      let filteredMembers = [];

      setMembersTableQuery(newSearchQuery);

      allMembers &&
        allMembers.map((member) => {
          let memberName;
          let email;
          let roles = [];
          let queryMatchesRole = false;

          member.roles.map((role) => {
            roles.push(role.description.toLowerCase());
          });

          memberName =
            member.firstName.toLowerCase() +
            " " +
            member.lastName.toLowerCase();
          email = member.email.toLowerCase();

          roles.map((role) => {
            if (role.includes(newSearchQuery.toLowerCase()))
              queryMatchesRole = true;
          });

          if (
            memberName.includes(newSearchQuery.toLowerCase()) ||
            email.includes(newSearchQuery.toLowerCase()) ||
            queryMatchesRole
          ) {
            if (newSearchQuery !== "") {
              filteredMembers.push(member);
            }
          }
        });

      if (newSearchQuery === "") {
        setMembers(allMembers);
        setPage(currentPage);
        setSearching(false);
      } else {
        if (!searching) {
          setCurrentPage(page);
          setSearching(true);
        }

        setPage(0);
        setMembers(filteredMembers);
      }
    }

    return (
      <div className="row">
        <div className="col-6">
          <h2>
            <strong
              style={{
                fontStyle: "bold",
                fontSize: "1.875rem",
                color: "rgb(241, 241, 241)",
                fontWeight: "400",
              }}
            >
              Manage Member Roles
            </strong>
          </h2>
        </div>

        <div className="col-6 text-end">
          <TextField
            id="outlined-basic"
            label="Search"
            variant="outlined"
            inputProps={{ sx: { color: "rgb(255, 255, 255)" } }}
            value={membersTableQuery}
            onChange={handleSearch}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.23) !important",
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7) !important",
              },
              "& .MuiOutlinedInput-root.Mui-focused": {
                "& > fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.7) !important",
                },
              },

              position: "relative",
              bottom: ".3rem",
              paddingBottom: ".5rem",
            }}
          />
        </div>
      </div>
    );
  }

  let counter = 0;

  function MembersTable() {
    const [tableVisibility, setTableVisibility] = useState("visible");

    const [members, setMembers] = useState();

    const [searching, setSearching] = useState(false);

    useEffect(() => {
      setMembers(allMembers && allMembers);
    }, []);

    let rowsArray = [];

    const [currentPage, setCurrentPage] = useState();

    const isSelected = (name) => selected.indexOf(name) !== -1;

    const [selected, setSelected] = React.useState([]);
    const [order, setOrder] = React.useState("asc");
    const [orderBy, setOrderBy] = React.useState("calories");

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rows, setRows] = useState([]);
    const [personName, setPersonName] = React.useState([]);

    useEffect(() => {
      let names;
      members &&
        members.map((member, index) => {
          let roles = [];

          member.roles.map((role) => {
            const roleName = role.name;
            roles = [...roles, roleName];
          });

          const firstName = member.firstName;
          const lastName = member.lastName;
          const email = member.email;

          const ITEM_HEIGHT = 48;
          const ITEM_PADDING_TOP = 8;
          const MenuProps = {
            PaperProps: {
              style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
              },
            },
          };

          const rolesArray = [
            "Administrator",
            "Project Manager",
            "Developer",
            "User",
          ];

          function getStyles(role, selectedRoles, theme) {
            return {
              fontWeight:
                selectedRoles.indexOf(role) === -1
                  ? theme.typography.fontWeightRegular
                  : theme.typography.fontWeightMedium,
            };
          }

          function MemberRoles() {
            let onClick;
            const [selectedRoles, setSelectedRoles] = React.useState(roles);
            const theme = useTheme();

            const handleSelectRole = (event) => {
              event.preventDefault();
              const {
                target: { value },
              } = event;
              setSelectedRoles(
                typeof value === "string" ? value.split(",") : value
              );

              const selectedUsersAuth0Id = member.auth0Id;

              axios
                .post(process.env.REACT_APP_SERVER + "/updateRoles", {
                  auth0Id: auth0Id,
                  selectedUsersAuth0Id: selectedUsersAuth0Id,
                  selectedRoles: event.target.value,
                })
                .then((r) => {});
            };

            return (
              <div>
                <FormControl sx={{ m: 1, width: 300 }} className="select">
                  <InputLabel id="demo-multiple-chip-label">Role</InputLabel>
                  <Select
                    sx={{ svg: { color: "#707070" }, color: "#969292" }}
                    labelId="demo-multiple-chip-label"
                    id="demo-multiple-chip"
                    multiple
                    value={selectedRoles}
                    onClick={onClick}
                    onChange={handleSelectRole}
                    inputProps={{
                      MenuProps: {
                        MenuListProps: {
                          sx: {
                            backgroundColor: "rgb(131, 131, 131)",
                          },
                        },
                      },
                    }}
                    input={
                      <OutlinedInput
                        onClick={onClick}
                        id="select-multiple-chip"
                        label="Role"
                      />
                    }
                    fieldsetProps={{
                      style: { borderColor: "blue !important" },
                    }}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={value}
                            sx={{ backgroundColor: "#c5c5c5 !important" }}
                          />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {rolesArray.map((role) => {
                      return (
                        <MenuItem
                          key={role}
                          value={role}
                          style={getStyles(role, selectedRoles, theme)}
                        >
                          <Checkbox
                            checked={selectedRoles.indexOf(role) > -1}
                          />
                          <ListItemText primary={role} />
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </div>
            );
          }

          rowsArray = [
            ...rowsArray,
            createData(firstName, lastName, email, <MemberRoles />),
          ];
        });

      setRows(rowsArray);
    }, [members]);

    const rows2 = [
      createData(
        "Cupcake",
        307,
        3.7,
        67,
        <Checkbox
          sx={{ color: "rgba(255, 255, 255, 0.7)" }}
          MemberRoles="checkbox"
          color="primary"
        />
      ),
      createData("Eclair", 262, 16.0, 24, 6.0),
      createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
      createData("Gingerbread", 356, 16.0, 49, 3.9),
      createData("Honeycomb", 408, 3.2, 87, 6.5),
      createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
      createData("Jelly Bean", 375, 0.0, 94, 0.0),
      createData("KitKat", 518, 26.0, 65, 7.0),
      createData("Lollipop", 392, 0.2, 98, 0.0),
      createData("Marshmallow", 318, 0, 81, 2.0),
      createData("Nougat", 360, 19.0, 9, 37.0),
      createData("Oreo", 437, 18.0, 63, 4.0),
    ];

    return (
      <div className="tableWrapper" style={{ visibility: tableVisibility }}>
        <div className="row">
          <div className="col">
            <TableHeader
              setMembers={setMembers}
              setPage={setPage}
              setCurrentPage={setCurrentPage}
              page={page && page}
              currentPage={currentPage && currentPage}
              setSearching={setSearching}
              searching={searching}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <EnhancedTable
              tableDisplay={tableDisplay}
              rows={rows ? rows : rows2}
              selected={selected}
              setSelected={setSelected}
              order={order}
              setOrder={setOrder}
              orderBy={orderBy}
              rowsPerPageOptions={[5, 10, 25]}
              setOrderBy={setOrderBy}
              headCells={headCells}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              page={page}
              setPage={setPage}
              toolbarMinHeight={"0px"}
              bodyLogic={
                rows &&
                stableSort(rows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isItemSelected = isSelected(row.name);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={index}
                        selected={isItemSelected}
                        sx={{
                          borderBottom: "1px solid green",
                          color: "rgb(255, 255, 255)",
                        }}
                      >
                        <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          sx={{
                            color: "rgb(255, 255, 255)",
                            borderBottom: "1px solid rgb(81, 81, 81)",
                          }}
                        >
                          {row.firstName}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "rgb(255, 255, 255)",
                            borderBottom: "1px solid rgb(81, 81, 81)",
                          }}
                          align=""
                        >
                          {row.lastName}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "rgb(255, 255, 255)",
                            borderBottom: "1px solid rgb(81, 81, 81)",
                          }}
                          align=""
                        >
                          {row.email}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "rgb(255, 255, 255)",
                            borderBottom: "1px solid rgb(81, 81, 81)",
                          }}
                          align=""
                        >
                          {row.MemberRoles}
                        </TableCell>
                      </TableRow>
                    );
                  })
              }
            ></EnhancedTable>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div></div>;
  } else {
    return (
      <div className="width">
        <div className="container mt-3">
          <MembersTable />
        </div>
      </div>
    );
  }
}

export default ManageRoles;
