/* eslint-disable */

import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

import jwt from "jsonwebtoken";

function AccountSettings() {
  const navigate = useNavigate();

  const { user, getAccessTokenSilently } = useAuth0();
  const [userEmail, setUserEmail] = useState();
  const [userPhoneNumber, setUserPhoneNumber] = useState();

  const [updatedEmail, setUpdatedEmail] = useState();
  const [updatedPhoneNumber, setUpdatedPhoneNumber] = useState();

  const [auth0Id, setAuth0Id] = useState();

  const [isInvalid4EmailTaken, setIsInvalid4EmailTaken] = useState();
  const [isInvalid4EmailTakenFeedback, setIsInvalid4EmailTakenFeedback] =
    useState();

  const [isValid4EmailChanged, setIsValid4EmailChanged] = useState();
  const [isValid4EmailChangedFeedback, setIsValid4EmailChangedFeedback] =
    useState();

  const [isValid4PhoneNumberChanged, setIsValid4PhoneNumberChanged] =
    useState();
  const [
    isValid4PhoneNumberChangedFeedback,
    setIsValid4PhoneNumberChangedFeedback,
  ] = useState();

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

            const getUserInfo = () => {
              axios
                .post(process.env.REACT_APP_SERVER + "/Settings", { userId })
                .then((r) => {
                  if (r.data) {
                    setUserEmail(r.data.email);

                    if (
                      r.data.user_metadata &&
                      r.data.user_metadata.phoneNumber !== false
                    ) {
                      setUserPhoneNumber(r.data.user_metadata.phoneNumber);
                      setUpdatedPhoneNumber(r.data.user_metadata.phoneNumber);

                      setIsLoading(false);
                    } else {
                      setIsLoading(false);
                    }
                  }
                });
            };
            getUserInfo();
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

  const sendUpdatedInfo = (event) => {
    if (updatedPhoneNumber === userPhoneNumber) {
      update();
    } else if (updatedPhoneNumber !== undefined) {
      if (updatedPhoneNumber === "") {
        update();
      } else if (updatedPhoneNumber.match(new RegExp(/[^\d]/, "i"))) {
        setIsValid4PhoneNumberChanged("is-invalid");
        setIsValid4PhoneNumberChangedFeedback(
          "Incorrect format, enter only numbers."
        );
      } else {
        if (updatedPhoneNumber.match(new RegExp(/[\d]{5,15}/, "i"))) {
          setIsValid4PhoneNumberChanged("");
          setIsValid4PhoneNumberChangedFeedback("");

          update();
        } else {
          setIsValid4PhoneNumberChanged("is-invalid");
          setIsValid4PhoneNumberChangedFeedback(
            "Phone number must have between 5-15 digits."
          );
        }
      }
    } else {
      setIsValid4PhoneNumberChanged("");
      setIsValid4PhoneNumberChangedFeedback("");

      update();
    }

    function update() {
      setIsValid4PhoneNumberChanged("");

      axios(process.env.REACT_APP_SERVER + "/Settings/updatePhoneOrEmail", {
        method: "POST",
        data: {
          updatedEmail: updatedEmail,
          updatedPhoneNumber:
            updatedPhoneNumber !== userPhoneNumber ? updatedPhoneNumber : null,
          userId: auth0Id && auth0Id,
        },
      }).then((r) => {
        let bothEmailAndPhoneNumberUpdated = false;

        if (r.data.emailResponse && r.data.phoneNumberUpdated === true)
          bothEmailAndPhoneNumberUpdated = true;

        function displayEmailFeedback() {
          if (r.data.emailResponse.message) {
            if (
              r.data.emailResponse.message ===
              "The specified new email already exists"
            ) {
              setIsInvalid4EmailTakenFeedback(
                "Email already taken, please choose another."
              );
              setIsInvalid4EmailTaken("is-invalid");
            }
          } else if (r.data.emailResponse) {
            setUserEmail(r.data.emailResponse);

            setIsInvalid4EmailTaken("");
            setIsInvalid4EmailTakenFeedback("");

            setIsValid4EmailChangedFeedback(
              "Success! you will now be redirected to Sign in."
            );
            setIsValid4EmailChanged("is-valid");

            setTimeout(() => {
              navigate(0);
            }, 4400);
          }
        }

        function displayPhoneFeedback() {
          if (r.data.phoneNumberUpdated === true) {
            setUserPhoneNumber(r.data.phoneNumberResponse);
            setIsValid4PhoneNumberChanged("is-valid");
            setIsValid4PhoneNumberChangedFeedback("Success!");
            setTimeout(() => {
              setIsValid4PhoneNumberChanged("");
            }, 2500);
          }
        }

        if (r.data.emailResponse || bothEmailAndPhoneNumberUpdated === true) {
          displayEmailFeedback();
        } else if (r.data.phoneNumberUpdated === true) {
          displayPhoneFeedback();
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
                <h3>Profile</h3>
              </label>

              <div className="form-floating mt-3">
                <input
                  onChange={(e) => {
                    setUpdatedPhoneNumber(e.target.value);
                  }}
                  value={updatedPhoneNumber}
                  type="text"
                  className={"form-control " + isValid4PhoneNumberChanged}
                />
                <label>Phone number</label>
                <div className="valid-feedback">
                  {isValid4PhoneNumberChangedFeedback}
                </div>
                <div className="invalid-feedback">
                  {isValid4PhoneNumberChangedFeedback}
                </div>
              </div>

              <div className="form-floating mt-3">
                <input
                  onChange={(e) => {
                    setUpdatedEmail(e.target.value);
                  }}
                  defaultValue={userEmail}
                  type="text"
                  className={
                    "form-control " +
                    isInvalid4EmailTaken +
                    " " +
                    isValid4EmailChanged
                  }
                />
                <label>Email</label>

                <div className="invalid-feedback">
                  {isInvalid4EmailTakenFeedback}
                </div>

                <div className="valid-feedback">
                  {isValid4EmailChangedFeedback}
                </div>
              </div>

              <div className="row mt-5">
                <div className="col-6 mt-1">
                  <Link to="/Home">
                    <a className="ps-0">Back to home</a>
                  </Link>
                </div>

                <div className="col-6 mt-1 text-end">
                  <button
                    onClick={(event) => {
                      sendUpdatedInfo(event);
                    }}
                    class="btn btn-primary"
                  >
                    Save Changes
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

export default AccountSettings;
