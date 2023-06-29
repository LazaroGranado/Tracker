/* eslint-disable */
import React from "react";
import { useState } from "react";
import Header from "../components/Header.js";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import jwt from "jsonwebtoken";

function AccountPassword() {
  const navigate = useNavigate();

  const { user, isAuthenticated, logout, getAccessTokenSilently } = useAuth0();
  const [userEmail, setUserEmail] = useState();

  const [isInvalid, setIsInvalid] = useState();
  const [isInvalid4IncorrectPassword, setIsInvalid4IncorrectPassword] =
    useState();
  const [isInvalidForWeakPassword, setIsInvalidForWeakPassword] = useState();
  const [
    newPasswordInvalidFeedbackMessage,
    setNewPasswordInvalidFeedbackMessage,
  ] = useState();

  const [currentPassword, setCurrentPassword] = useState();
  const [newPassword, setNewPassword] = useState();
  const [newPasswordConfirm, setNewPasswordConfirm] = useState();
  const [auth0Id, setAuth0Id] = useState();

  const [passwordStrengthDisplay, setPasswordStrengthDisplay] =
    useState("none");

  function signOut() {
    return logout({ returnTo: window.location.origin });
  }

  const [contacts, setContacts] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let userId;

    getAccessTokenSilently({ detailedResponse: true })
      .then((r) => {
        const decodeIdToken = async () => {
          const decodedIdToken = jwt.decode(r.id_token);

          userId = decodedIdToken.sub;

          if (userId) {
            setAuth0Id(userId);

            setUserEmail(decodedIdToken.email);

            setIsLoading(false);
          }
        };

        if (r) {
          decodeIdToken();
        }
      })
      .catch((e) => {
        if (e.toString() === "Error: Login required") {
          navigate("/");
        }
      });
  }, []);

  const onClick = async (e) => {
    const data = {
      currentPassword: currentPassword,
      newPassword: newPassword,
      userEmail: userEmail && userEmail,
      id: auth0Id && auth0Id,
    };

    if (newPassword !== newPasswordConfirm) {
      setIsInvalid("is-invalid ");
      setNewPasswordInvalidFeedbackMessage("passwords do not match.");
    } else {
      await axios(process.env.REACT_APP_SERVER + "/Settings/Password", {
        method: "POST",
        data: data,
      }).then((r) => {
        if (r.data) {
          if (r.data === "success") {
            signOut();
          } else if (r.data === "password is too weak") {
            setIsInvalidForWeakPassword(" is-invalid");
            setNewPasswordInvalidFeedbackMessage("password is too weak");
          } else if (r.data === "password incorrect") {
            setIsInvalid4IncorrectPassword("is-invalid");
          }
        }
      });
    }
  };

  if (isLoading) {
    return <div></div>;
  } else {
    return (
      <div style={{ width: "100%" }}>
        <div className="container mt-3">
          <h2>account settings</h2>
          <hr />
          <div className="row mt-5">
            <div class="col-md-3 me-5">
              <ul className="ul-no-bullet-point ps-0">
                <Link to="/Settings">
                  <li className="nav-item">
                    <a class="nav-link fs-5" id="">
                      Profile
                    </a>
                  </li>
                </Link>
              </ul>
              <hr />
              <ul className="ul-no-bullet-point ps-0">
                <Link to="/Settings/Password">
                  <li>
                    <a class="nav-link fs-5" id="">
                      Password
                    </a>
                  </li>
                </Link>
              </ul>
              <hr />
              <ul className="ul-no-bullet-point ps-0">
                <Link to="/Settings/DeleteAccount">
                  <li>
                    <a class="nav-link fs-5" id="">
                      Delete account
                    </a>
                  </li>
                </Link>
              </ul>
            </div>

            <div class="col-md-4 ms-5">
              <label class="form-label">
                <h3>Change Password</h3>
              </label>

              <div className="form-floating mt-3">
                <input
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                  }}
                  id="currentPassword"
                  name="password"
                  required
                  type="password"
                  className={"form-control " + isInvalid4IncorrectPassword}
                />
                <div className="invalid-feedback">incorrect password. </div>
                <label>current password</label>
              </div>

              <div className="form-floating mt-3">
                <input
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordStrengthDisplay("block");
                  }}
                  name="newPassword"
                  required
                  type="password"
                  className="form-control"
                  id="password"
                />
                <label>new password</label>
              </div>

              <div className="form-floating mt-3">
                <input
                  key={setIsInvalidForWeakPassword}
                  onChange={(e) => {
                    setNewPasswordConfirm(e.target.value);
                  }}
                  type="password"
                  className={
                    "form-control " + isInvalid + isInvalidForWeakPassword
                  }
                  required
                  id="password_confirm"
                />

                <div className="invalid-feedback">
                  {newPasswordInvalidFeedbackMessage}
                </div>

                <label>confirm new password</label>
              </div>

              <div
                style={{ display: passwordStrengthDisplay }}
                className="form-floating border rounded mt-2"
              >
                <ul className="mt-3  ap-ul ul-no-bullet-point">
                  <li className="mb-1">Your password must contain: </li>
                  <ul className="ps-3 ">
                    {" "}
                    <li> At least 8 characters </li>
                    <li className="mb-1"> At least 3 of the following: </li>
                  </ul>

                  <ul className="ps-5 ">
                    {" "}
                    <li>Lower case letters (a-z)</li>
                    <li className="mb-1">Upper case letters (A-Z)</li>
                    <li className="mb-1">Numbers (0-9)</li>
                    <li className="mb-1">Special characters (e.g. !@#$%^&*)</li>
                  </ul>
                </ul>
              </div>

              <div className="row mt-5">
                <div className="col-6 mt-1">
                  <Link to="/Home">
                    {" "}
                    <a className="ps-0">Back to home</a>
                  </Link>
                </div>

                <div className="col-6 mt-1 text-end">
                  <button onClick={onClick} class="btn btn-primary">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AccountPassword;
