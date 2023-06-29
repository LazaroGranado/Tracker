/* eslint-disable */
import { useAuth0 } from "@auth0/auth0-react";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import jwt from "jsonwebtoken";

import { webAuth, webAuthLogin, webAuthLoginWithRoles } from "../index.js";

const CustomTextField = styled(TextField, {
  shouldForwardProp: (props) => props !== "focusColor",
})((p) => ({
  "& .MuiInputLabel-root": { color: "rgb(118, 114, 105)" },
  "& .MuiOutlinedInput-root": {
    "& > fieldset": { borderColor: "#292b2d" },
  },
  "& .MuiOutlinedInput-root.Mui-focused": {
    "& > fieldset": {
      borderColor: "#1976d2",
    },
  },
  "& .MuiOutlinedInput-root:hover": {
    "& > fieldset": {
      borderColor: "#252525",
    },
  },
  "& .MuiOutlinedInput-root.Mui-focused:hover": {
    "& > fieldset": {
      borderColor: "#1976d2",
    },
  },
}));

const demoPmAccount = process.env.REACT_APP_PMLOGIN;
const demoAdminAccount = process.env.REACT_APP_ADMINLOGIN;
const demoDeveloperAccount = process.env.REACT_APP_DEVELOPERLOGIN;
const demoP = process.env.REACT_APP_DEMOP;
const trackerRealm = process.env.REACT_APP_ISSUETRACKERLOGINREALM;

function DemoLogin() {
  const { loginWithRedirect, isAuthenticated, getAccessTokenSilently } =
    useAuth0();

  const [isInvalid4WrongEmailOrPassword, setIsInvalid4WrongEmailOrPassword] =
    useState();
  const [
    wrongEmailOrPasswordInvalidFeedback,
    setWrongEmailOrPasswordInvalidFeedback,
  ] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let userId;

    getAccessTokenSilently({ detailedResponse: true })
      .then((r) => {
        const decodeIdToken = async () => {
          const decodedIdToken = jwt.decode(r.id_token);

          userId = decodedIdToken.sub;

          if (userId) {
            navigate("/");
          } else {
            setIsLoading(false);
          }
        };

        if (r) {
          decodeIdToken();
        } else {
          setIsLoading(false);
        }
      })
      .catch((e) => {
        setIsLoading(false);

        if (e.toString() === "Error: Login required") {
          setIsLoading(false);
        }
      });
  }, []);

  function handleDemoDevLogin() {
    let email = demoDeveloperAccount;
    let password = demoP;

    webAuthLoginWithRoles.login(
      {
        realm: trackerRealm,
        username: email,
        password: password,
      },
      (err, result) => {
        if (result) {
        }
        if (err) {
          if (err.description === "Wrong email or password.") {
            setIsInvalid4WrongEmailOrPassword("is-invalid");
            setWrongEmailOrPasswordInvalidFeedback(
              "Email or password is incorrect"
            );
          }
        }
      }
    );
  }

  function handleDemoPmLogin() {
    let email = demoPmAccount;
    let password = demoP;

    webAuthLoginWithRoles.login(
      {
        realm: trackerRealm,
        username: email,
        password: password,
      },
      (err, result) => {
        if (result) {
        }
        if (err) {
          if (err.description === "Wrong email or password.") {
            setIsInvalid4WrongEmailOrPassword("is-invalid");
            setWrongEmailOrPasswordInvalidFeedback(
              "Email or password is incorrect"
            );
          }
        }
      }
    );
  }

  function handleDemoAdminLogin() {
    let email = demoAdminAccount;
    let password = demoP;

    webAuthLoginWithRoles.login(
      {
        realm: trackerRealm,
        username: email,
        password: password,
      },
      (err, result) => {
        if (result) {
        }
        if (err) {
          if (err.description === "Wrong email or password.") {
            setIsInvalid4WrongEmailOrPassword("is-invalid");
            setWrongEmailOrPasswordInvalidFeedback(
              "Email or password is incorrect"
            );
          }
        }
      }
    );
  }

  // function handleMyLogin() {

  //     let password = demoP

  //     webAuthLoginWithRoles.login({
  //         realm: trackerRealm,
  //         username: '',
  //         password: password,

  //     }, (err, result) => {
  //         if (result) {
  //         }
  //         if (err) {
  //             if (err.description === 'Wrong email or password.') {
  //                 setIsInvalid4WrongEmailOrPassword('is-invalid')
  //                 setWrongEmailOrPasswordInvalidFeedback('Email or password is incorrect')

  //             }

  //         }

  //     })

  // }

  if (isLoading) {
    return <div></div>;
  } else {
    return (
      <div className="width">
        <div className="container " style={{ marginTop: "9rem" }}>
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8 col-xl-5">
              <div className="demoLoginPageDiv" style={{}}>
                <h4
                  className=""
                  style={{ fontWeight: 300, marginBottom: "2rem" }}
                >
                  Demo Account Login
                </h4>

                <div className="row">
                  <div class="text-center pt-4">
                    <Stack spacing={3}>
                      <Button
                        variant="contained"
                        size="large"
                        className="adminLoginButton"
                        onClick={handleDemoAdminLogin}
                      >
                        admin
                      </Button>

                      <Button
                        variant="contained"
                        size="large"
                        style={{ backgroundColor: "#a4a32ceb" }}
                        className="demoLoginButton"
                        onClick={handleDemoPmLogin}
                      >
                        project manager
                      </Button>

                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleDemoDevLogin}
                      >
                        developer
                      </Button>

                      {/* <Button
                                                variant='contained'
                                                size='large'

                                                onClick={handleMyLogin}

                                            >

                                                login</Button> */}
                    </Stack>

                    <div class="text-start pt-5">
                      <Link to="/">
                        <Button sx={{ textTransform: "none", paddingLeft: 0 }}>
                          Back to account Sign in
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DemoLogin;
