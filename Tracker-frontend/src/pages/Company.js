/* eslint-disable */
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TextField from "@mui/material/TextField";
import EnhancedTable from "../components/EnhancedTable.js";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { CardHeader } from "@mui/material";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import jwt from "jsonwebtoken";
import InfoIcon from "@mui/icons-material/Info";

function Company() {
  const navigate = useNavigate();

  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const userId = isAuthenticated && user.sub;
  const [tickets, setTickets] = useState();
  const [ticketToEdit, setTicketToEdit] = useState();
  const [newCategoryName, setNewCategoryName] = useState();
  const [categoryToDelete, setCategoryToDelete] = useState();
  const [contacts, setContacts] = useState();
  const [contactsToemail, setContactsToemail] = useState();
  const [defaultImage, setDefaultImage] = useState();
  const [auth0Id, setAuth0Id] = useState();
  const [allMembers, setAllMembers] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [currentArchivedStatus, setCurrentArchivedStatus] = useState();

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

  function createData(firstName, lastName, email, memberRoles) {
    return {
      firstName,
      lastName,
      email,
      memberRoles,
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
      id: "memberRoles",
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

  function MemberRoles(props) {
    const { roles } = props;

    return (
      <div>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {roles.map((role) => {
            return (
              <Chip
                variant={"outlined"}
                label={role}
                sx={{ color: "#f1f1f1" }}
              />
            );
          })}
        </Box>
      </div>
    );
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
                color: "rgb(229, 229, 229)",
              }}
            >
              Members
            </strong>
          </h2>
        </div>

        <div className="col-6 text-end">
          <Link to="/manageRoles">
            <Button
              size="large"
              className="me-3"
              sx={{ height: "3.53rem", bottom: ".3rem" }}
            >
              Manage Roles
            </Button>
          </Link>

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

  function MembersTable() {
    const [members, setMembers] = useState();

    let rowsArray = [];

    const [currentPage, setCurrentPage] = useState();
    const [searching, setSearching] = useState(false);

    const [selected, setSelected] = React.useState([]);
    const [order, setOrder] = React.useState("asc");
    const [orderBy, setOrderBy] = React.useState("calories");

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [personName, setPersonName] = React.useState([]);

    const isSelected = (name) => selected.indexOf(name) !== -1;

    useEffect(() => {
      setMembers(allMembers && allMembers);
    }, []);

    const [rows, setRows] = useState([]);

    useEffect(() => {
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

          rowsArray = [
            ...rowsArray,
            createData(
              firstName,
              lastName,
              email,
              <MemberRoles roles={roles} />
            ),
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
      <div className="tableWrapper mt-5">
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
              rows={rows ? rows : rows2}
              selected={selected}
              setSelected={setSelected}
              order={order}
              setOrder={setOrder}
              orderBy={orderBy}
              setOrderBy={setOrderBy}
              rowsPerPageOptions={[5, 10, 25]}
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
                          {row.memberRoles}
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
          <div className="row">
            <div className="col-md-12">
              <Card
                sx={{
                  backgroundColor: "rgb(23, 23, 23)",
                  color: "rgb(255, 255, 255)",
                }}
              >
                <CardHeader
                  title={
                    <div>
                      <InfoIcon className="infoIconCompanyPage pe-2" />
                      Details
                    </div>
                  }
                />
                <CardContent>
                  <ul className="list-unstyled mb-0">
                    <li className="">
                      <strong
                        className="card-text mt-0 mb-0"
                        style={{ fontWeight: "bold" }}
                      >
                        {"Company    "}
                      </strong>

                      <span>
                        <span style={{ paddingLeft: "4rem" }}> LG Dev</span>
                      </span>
                    </li>
                    <li className="mb-1">
                      <p
                        className="card-text mt-0 mb-0"
                        style={{ maxWidth: "5rem", fontWeight: "bold" }}
                      >
                        {" Name    "}
                      </p>
                    </li>

                    <li className="pt-3">
                      <strong
                        className="card-text mt-0 mb-0"
                        style={{ fontWeight: "bold" }}
                      >
                        {"Company    "}
                      </strong>

                      <span>
                        <span style={{ paddingLeft: "4rem" }}>
                          {" "}
                          Software Development
                        </span>
                      </span>
                    </li>
                    <li className="mb-1">
                      <p
                        className="card-text mt-0 mb-0"
                        style={{ maxWidth: "5rem", fontWeight: "bold" }}
                      >
                        {" Description    "}
                      </p>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <MembersTable />
        </div>
      </div>
    );
  }
}

export default Company;
