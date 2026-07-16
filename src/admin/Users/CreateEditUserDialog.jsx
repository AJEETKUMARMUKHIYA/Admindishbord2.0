import React, { useState, useEffect, useContext } from "react";
import { useTheme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Input from "@mui/material/Input";
import Switch from "@mui/material/Switch";
// import { useMutation } from "@apollo/client";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
 import Auth from "../../Auth";
// import { UserContext } from "../Context/UserContext";
// import { ADD_USER, EDIT_USER } from "../../GraphQL/Mutations";
import Settings from "../Common/Setting";
import { update } from "lodash";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: 26,
    marginTop: theme.spacing(2),
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
}));

export default function CreateEditUserDialog({
  open,
  setOpen,
  mode,
  user,
  accounts,
  subAccounts,
  businessUnits,
  roles,
  currencies,
  countries,
  onAddUser,
  onEditUser,
}) {
  const classes = useStyles();
  const theme = useTheme();
  const [username, setUsername] = useState();
  const [userId, setUserId] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  // const [selectedAccount, setSelectedAccount] = useState(-1);
  const [active, setActive] = useState(true);
  const [accountBusinessUnits, setAccountBusinessUnits] = useState([]);
  const [selectedBusinessUnits, setSelectedBusinessUnits] = useState([]);
  const [selectedSubAccounts, setSelectedSubAccounts] = useState([]);
  const[subAccountsMC,setSubAccountsMC]=useState([]);
  const [selectedRole, setSelectedRole] = useState();
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("2");
  const [selectedCountries, setSelectedCountries] = useState([]);
   const [currentUser] = useContext('');
  const [formErrors, setFormErrors] = useState([]);
  const [accountBUAllAccess, setAccountBUAllAccess] = useState(true);
  const [disableSaveButton, setDisableSaveButton] = useState(false);

  const validateEmail = (email) => {
    var split = email.split(",");
    for (var i = 0; i < split.length; i++) {
      if (!/^\w+([.-]\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(split[i])) {
        return false;
      }
    }
    return true;
  };

  const validateForm = () => {
    let temp = {};
    temp.username = username ? "" : "This field is required.";
    temp.firstName = firstName ? "" : "This field is required.";
    temp.lastName = lastName ? "" : "This field is required.";
    temp.email = email ? "" : "This field is required.";
    if (email !== "") {
      var result = validateEmail(email);
      if (!result) temp.email = "Invalid email format.";
    }
    temp.selectedRole = selectedRole ? "" : "This field is required.";
    if (selectedRole) {
      var selectedRoleName = roles.filter((a) => a.roleId === selectedRole);
      if (selectedRoleName[0].roleName === Settings.ROLE_SITE_USER) {
        if (!accountBUAllAccess && selectedBusinessUnits.length === 0) {
          temp.selectedBusinessUnits = "This field is required";
        } else {
          temp.selectedBusinessUnits = "";
        }
        //temp.selectedAccount =
        //  selectedAccount !== -1 ? "" : "This field is required.";
        temp.selectedCurrency = selectedCurrency
          ? ""
          : "This field is required.";
      }

      if (
        selectedRoleName[0].roleName === Settings.ROLE_ACCOUNT_MANAGER ||
        selectedRoleName[0].roleName === Settings.ROLE_CLIENT_FINANCE ||
        selectedRoleName[0].roleName === Settings.ROLE_SITE_USER
      ) {
        if (selectedSubAccounts.length === 0) {
          temp.selectedSubAccounts = "This field is required";
        } else {
          temp.selectedSubAccounts = "";
        }
      }
    }
    //temp.selectedCountry = selectedCountry ? "" : "This field is required.";
   // temp.selectedCountry = selectedCountries.toLocaleString() ? "" : "This field is required.";
     temp.selectedCountry = selectedCountry ? "" : "This field is required.";
    temp.selectedCurrency = selectedCurrency ? "" : "This field is required.";

    setFormErrors({ ...temp });
    return Object.values(temp).every((x) => x === "");
  };

  const updateCurrency = (value) => {
    const country = countries.filter((a) => a.countryId === value);
    var currencyCode = "SGD";
    if (country.length === 1) {
      if (country[0].countryName === "Singapore") {
        currencyCode = "SGD";
      } else if (country[0].countryName === "Philippines") {
        currencyCode = "PHP";
      } else if (country[0].countryName === "Vietnam") {
        currencyCode = "VND";
      } else if (country[0].countryName === "Thailand") {
        currencyCode = "THB";
      } else if (country[0].countryName === "Malaysia") {
        currencyCode = "MYR";
      } else if (country[0].countryName === "Indonesia") {
        currencyCode = "IDR";
      }

      const currency = currencies.filter(
        (a) => a.currencyCode === currencyCode
      );
      if (currency.length === 1) {
        setSelectedCurrency(currency[0].currencyId);
      }
    }
  };
  const handleOnChangeCountry = (e) => {
    const { value } = e.target;
    setSelectedCountry(value);
    updateCurrency(value);
  };

//   const [addUser] = useMutation(ADD_USER, {
//     onCompleted: ({ addUser }) => {
//       clearForm();
//       setOpen(false);
//       onAddUser(addUser);
//       setMessage("User added");
//       setOpenSnack(true);
//       setDisableSaveButton(false);
//     },
//     onError: (errors) => {
//       const error = `${errors}`.split(":").reverse()[0];
//       let temp = {};
//       if (error.includes("Email")) temp.email = error;
//       else temp.username = error;
//       setFormErrors({ ...temp });
//       setDisableSaveButton(false);
//     },
//   });

//   const [editUser] = useMutation(EDIT_USER, {
//     onCompleted: ({ editUser }) => {
//       clearForm();
//       setOpen(false);
//       onEditUser(editUser);
//       setMessage("User updated");
//       setOpenSnack(true);
//       setDisableSaveButton(false);
//     },
//     onError: (errors) => {
//       const error = `${errors}`.split(":").reverse()[0];
//       let temp = {};
//       temp.email = error;
//       setFormErrors({ ...temp });
//       setDisableSaveButton(false);
//     },
//   });

  const process = (user) => {
    setDisableSaveButton(true);
//     if (mode === "Add") {
//       addUser({
//         variables: {
//           username: user.username,
//           active: user.active,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           email: user.email,
//           //subAccountId: user.subAccountId,
//           defaultCurrencyId: user.defaultCurrencyId,
//           defaultCountryIds: user.defaultCountryIds,
//           defaultCountryId: user.defaultCountryId,
//           roles: user.roles,
//           businessUnits: user.businessUnits,
//           accountBUAllAccess: user.accountBUAllAccess,
//           subAccounts: user.subAccounts,
//         },
//       });
//     } else {
//       editUser({
//         variables: {
//           userId: user.userId,
//           username: user.username,
//           active: user.active,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           email: user.email,
//           //subAccountId: user.subAccountId,
//           defaultCurrencyId: user.defaultCurrencyId,
//           defaultCountryIds: user.defaultCountryIds,
//           defaultCountryId: parseInt(user.defaultCountryId) ,
//           roles: user.roles,
//           businessUnits: user.businessUnits,
//           accountBUAllAccess: user.accountBUAllAccess,
//           subAccounts: user.subAccounts,
//         },
//       });
//     }
  };

  const onClose = () => {
    clearForm();
    setOpen(false);
  };

  const onSave = (e) => {
    if (validateForm()) {
      user = {};
      user.userId = userId;
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.username = username;
      //user.subAccountId = selectedAccount;
      user.active = active;
      user.accountBUAllAccess = false;
      if (selectedRole) {
        var selectedRoleName = roles.filter((a) => a.roleId === selectedRole);
        if (
          selectedRoleName[0].roleName !== Settings.ROLE_ACCOUNT_MANAGER &&
          selectedRoleName[0].roleName !== Settings.ROLE_CLIENT_FINANCE &&
          selectedRoleName[0].roleName !== Settings.ROLE_SITE_USER
        ) {
          user.selectedSubAccounts = [];
        } else {
          if (selectedSubAccounts && selectedSubAccounts.length > 0) {
            user.subAccounts = subAccounts
              .filter((a) => selectedSubAccounts.includes(a.subAccountName))
              .map((a) => ({
                subAccountId: a.subAccountId,
              }));
          }
        }
        if (selectedRoleName[0].roleName !== Settings.ROLE_SITE_USER) {
          user.accountBUAllAccess = true;
          user.subAccountId = -1;
        } else {
          user.accountBUAllAccess = accountBUAllAccess;
          if (selectedBusinessUnits && selectedBusinessUnits.length > 0) {
            user.businessUnits = accountBusinessUnits
              .filter((a) => selectedBusinessUnits.includes(a.businessUnitCode))
              .map((a) => ({
                businessUnitId: a.businessUnitId,
              }));
          }
        }
      }
      user.roles = [{ roleId: selectedRole }];
      user.defaultCurrencyId = selectedCurrency;
      //user.defaultCountryId = selectedCountry;
      user.defaultCountryId = parseInt(selectedCountry);
      user.defaultCountryIds = selectedCountries.join();
      process(user);
    }
  };

  const clearForm = () => {
    setUserId(0);
    setUsername("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setSelectedSubAccounts([]);
    setSelectedBusinessUnits([]);
    setSelectedRole("");
    if (mode !== "Add") {
      //setSelectedCurrency("");
      setSelectedCountries([])
      setSelectedCountry("");

    }
    setActive(true);
    //setSelectedAccount("");
    //setAccountBUAllAccess(true);
    setFormErrors([]);
  };

  const onChangeAccount = (e) => {
    //setSelectedAccount(e.target.value);
    setAccountBusinessUnits(
      businessUnits.filter((a) => a.subAccountId === e.target.value)
    );
    setSelectedBusinessUnits([]);
  };

  const onChangeRole = (e) => {
    setSelectedRole(e.target.value);
  };

  function getStyles(name, theme) {
    return {
      fontWeight:
        selectedBusinessUnits.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightBold,
    };
  }

  function getStyles2(name, theme) {
    return {
      fontWeight:
        selectedSubAccounts.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightBold,
    };
  }

  const onChangeSelectedBusinessUnits = (event) => {
    setSelectedBusinessUnits(event.target.value);
  };

  const onChangeSelectedSubAccounts = (event) => {
    setSelectedSubAccounts(event.target.value);
    setAccountBusinessUnits(
      businessUnits.filter((a) =>
        event.target.value.includes(a.subAccount.subAccountName)
      )
    );
    setSelectedBusinessUnits([]);
  };

  const onAccountBUAllAccessChange = (e) => {
    setAccountBUAllAccess(e.target.checked);
  };

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
useEffect(()=>{

   
  if(selectedCountries && selectedCountries.length>0)
  {
    
  var data=  filterCountry(subAccounts, selectedCountries);
  setSubAccountsMC(data);
  }
  if(user != null && user.subAccounts && selectedCountries)
      {
        
          
        var filterAccountsData=  filterSubAccounts(selectedCountries, user.subAccounts);
        setSelectedSubAccounts((filterAccountsData.map((a) => a.subAccount.subAccountName)))
          
        
      }

},[selectedCountries]);
  useEffect(() => {
    if (accounts && accounts.length > 0) {
      //setSelectedAccount(currentUser.subAccount?.subAccountId);
      if (Auth.isAccountManager) {
        var p = currentUser.businessUnits.map((e) => {
          return {
            businessUnitId: e.businessUnit.businessUnitId,
            businessUnitCode: e.businessUnit.businessUnitCode,
            address1: e.businessUnit.address1,
          };
        });

        setAccountBusinessUnits(
          currentUser.businessUnits.map((e) => {
            return {
              businessUnitCode: e.businessUnit.businessUnitCode,
              address1: e.businessUnit.address1,
            };
          })
        );
      } else {
        var subAccountIds = currentUser.subAccounts.map((a) => {
          return a.subAccount.subAccountId;
        });
        setAccountBusinessUnits(
          businessUnits.filter((a) => subAccountIds.includes(a.subAccountId))
        );
      }
    }
  }, [accounts, businessUnits, currentUser]);

  useEffect(() => {
    if (user) {
      setUserId(user.userId);
      setUsername(user.username);

      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      //setSelectedAccount(user.subAccountId);
      if (user.businessUnits) {
        setSelectedBusinessUnits(
          user.businessUnits.map((a) => a.businessUnit.businessUnitCode)
        );
      }
      if (user.subAccounts && selectedCountry) {
        // setSelectedSubAccounts(
        //   user.subAccounts.map((a) => a.subAccount.subAccountName)
        // );
         setSelectedSubAccounts(filterSubAccounts(selectedCountries, user.subAccounts) )
          
      }
      else if(user.subAccounts && user.countryCode)
      {
        
          
        var filterAccountsData=  filterSubAccounts(convertIntoInt(user.countryCode), user.subAccounts);
        setSelectedSubAccounts((filterAccountsData.map((a) => a.subAccount.subAccountName)))
          
        
      }
      if (Auth.isAccountManager) {
        setAccountBusinessUnits(
          currentUser.businessUnits.map((e) => {
            return {
              businessUnitId: e.businessUnit.businessUnitId,
              businessUnitCode: e.businessUnit.businessUnitCode,
              address1: e.businessUnit.address1,
            };
          })
        );
      } else {
        var subAccountIds = user.subAccounts.map((a) => {
          return a.subAccount.subAccountId;
        });
        setAccountBusinessUnits(
          businessUnits.filter((a) => subAccountIds.includes(a.subAccountId))
        );
      }
      setSelectedRole(user.roles[0].role.roleId);
      setSelectedCountry(user.defaultCountry.countryId);
      //setSelectedCountries(user.countryCode.split(',');
       setSelectedCountries(convertIntoInt(user.countryCode));
      setSelectedCurrency(user.defaultCurrency.currencyId);
      setActive(user.active);
      setAccountBUAllAccess(user.accountBUAllAccess);
    } else {
      if (mode === "Add") {
        if (countries.length === 1) {
          setSelectedCountry(countries[0].countryId);
          updateCurrency(countries[0].countryId);
        }
      }
    }
  }, [businessUnits, user]);
  const filterCountry = (subAcc, selectedcont) => {
    let res = [];
    res = subAcc.filter(el => {
       return selectedcont.find(element => {
          return parseInt(element) === el.countryId;
       });
    });
    return res;
 }
 const filterSubAccounts = (sCoutry, subAcc1) => {
  let res1 = [];
  res1 = subAcc1.filter(el => {
     return sCoutry.find(element => {
        return parseInt(element) === el.subAccount.countryId;
     });
  });
  return res1;
}
 const convertIntoInt=(arraylist )=>{
 return  arraylist.split(",").map(Number);
 }
  const [openSnack, setOpenSnack] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const handleCloseSnack = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnack(false);
  };

  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        open={openSnack}
        autoHideDuration={5000}
        onClose={handleCloseSnack}
        message={message}
        action={
          <React.Fragment>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnack}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />

      <Dialog
        style={{ height: "600px" }}
        open={open}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">
          {user ? "Edit" : "Add"} User
        </DialogTitle>
        <DialogContent>
          <Grid container justify="space-around" spacing={1}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                size="small"
                id="username"
                label="User Name*"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                {...(formErrors.username && {
                  error: true,
                  helperText: formErrors.username,
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                size="small"
                id="email"
                label="Email*"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                {...(formErrors.email && {
                  error: true,
                  helperText: formErrors.email,
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                size="small"
                autoFocus
                id="firstName"
                label="First Name*"
                fullWidth
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                {...(formErrors.firstName && {
                  error: true,
                  helperText: formErrors.firstName,
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                size="small"
                id="lastName"
                label="Last Name*"
                fullWidth
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                {...(formErrors.lastName && {
                  error: true,
                  helperText: formErrors.lastName,
                })}
              />
            </Grid>

            <Grid item xs={6}>

              <TextField
                select
                size="small"
                value={selectedCountries}
                label="Country"
                onChange={(e) => setSelectedCountries(e.target.value)}
                fullWidth
                SelectProps={{
                  multiple: true,
                  MenuProps: { className: classes.menu },
                }}
              >
                {countries &&
                  countries.length > 0 &&
                  countries.map(({ countryId, countryName }, index) => (
                    <MenuItem key={countryId} value={countryId}>
                      {countryName}
                    </MenuItem>
                  ))}
              </TextField>
              {/* <TextField
                select
                size="small"
                margin="dense"
                id="name"
                label="Country*"
                name="selectedCountry"
                value={selectedCountry}
                onChange={handleOnChangeCountry}
                fullWidth
                {...(formErrors.selectedCountry && {
                  error: true,
                  helperText: formErrors.selectedCountry,
                })}
                SelectProps={{ MenuProps: { className: classes.menu } }}
              >
                {countries &&
                  countries.map(({ countryId, countryName }, index) => (
                    <MenuItem key={countryId} value={countryId}>
                      {countryName}
                    </MenuItem>
                  ))}
              </TextField> */}
            </Grid>

            <Grid item xs={6}>
              <TextField
                select
                size="small"
                margin="dense"
                id="name"
                label="Default Currency*"
                name="selectedCurrency"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                fullWidth
                {...(formErrors.selectedCurrency && {
                  error: true,
                  helperText: formErrors.selectedCurrency,
                })}
                SelectProps={{ MenuProps: { className: classes.menu } }}
              >
                {currencies &&
                  currencies.map(
                    (
                      { currencyId, currencyCode, currencyDescription },
                      index
                    ) => (
                      <MenuItem key={currencyId} value={currencyId}>
                        {currencyCode}
                      </MenuItem>
                    )
                  )}
              </TextField>
            </Grid>

            {roles && (
              <Grid item xs={12}>
                <TextField
                  select
                  margin="dense"
                  size="small"
                  value={selectedRole}
                  label="Role*"
                  onChange={onChangeRole}
                  fullWidth
                  variant="outlined"
                  {...(formErrors.selectedRole && {
                    error: true,
                    helperText: formErrors.selectedRole,
                  })}
                  SelectProps={{ MenuProps: { className: classes.menu } }}
                >
                  {roles &&
                    (Auth.isAdmin || Auth.isFSC) &&
                    roles.map(({ roleId, roleName }, index) => (
                      <MenuItem key={roleId} value={roleId}>
                        {roleName}
                      </MenuItem>
                    ))}
                  {roles &&
                    Auth.isAccountManager &&
                    roles
                      .filter(
                        (a) =>
                          a.roleName === Settings.ROLE_SITE_USER ||
                          a.roleName === Settings.ROLE_ACCOUNT_MANAGER
                      )
                      .map(({ roleId, roleName }, index) => (
                        <MenuItem key={roleId} value={roleId}>
                          {roleName}
                        </MenuItem>
                      ))}
                </TextField>
              </Grid>
            )}

            {(selectedRole == 1 ||
              selectedRole === 3 ||
              selectedRole === 6) && (
                <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    {...(formErrors.selectedSubAccounts && { error: true })}
                  >
                    <InputLabel id="demo-subaccounts-chip-label">
                      Accounts
                    </InputLabel>
                    <Select
                      size="small"
                      labelId="demo-subaccounts-chip-label"
                      id="demo-subaccounts-chip"
                      multiple
                      value={selectedSubAccounts}
                      onChange={onChangeSelectedSubAccounts}
                      input={<Input id="select-subaccounts-chip" />}
                      renderValue={(selected) => (
                        <div className={classes.chips}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              className={classes.chip}
                            />
                          ))}
                        </div>
                      )}
                      MenuProps={MenuProps}
                    >
                      {subAccountsMC &&
                        subAccountsMC.map(
                          ({ subAccountId, subAccountName }, index) => (
                            <MenuItem
                              key={subAccountId}
                              value={subAccountName}
                              style={getStyles2(subAccountName, theme)}
                            >
                              {subAccountName}
                            </MenuItem>
                          )
                        )}
                    </Select>
                    {formErrors.selectedSubAccounts && (
                      <FormHelperText>
                        {formErrors.selectedSubAccounts}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              )}

            {selectedRole === 1 && (
              <Grid item xs={12}>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={accountBUAllAccess}
                        onChange={onAccountBUAllAccessChange}
                        name="accountBUAllAccess"
                        color="primary"
                      />
                    }
                    label="Access to All BU in Account"
                  />
                </FormGroup>
              </Grid>
            )}
            {!accountBUAllAccess && selectedRole === 1 && (
              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  {...(formErrors.selectedBusinessUnits && { error: true })}
                >
                  <InputLabel id="demo-mutiple-chip-label">
                    Business Units
                  </InputLabel>
                  <Select
                    size="small"
                    labelId="demo-mutiple-chip-label"
                    id="demo-mutiple-chip"
                    multiple
                    value={selectedBusinessUnits}
                    onChange={onChangeSelectedBusinessUnits}
                    input={<Input id="select-multiple-chip" />}
                    renderValue={(selected) => (
                      <div className={classes.chips}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={value}
                            className={classes.chip}
                          />
                        ))}
                      </div>
                    )}
                    MenuProps={MenuProps}
                  >
                    {accountBusinessUnits &&
                      accountBusinessUnits.map(
                        (
                          { businessUnitId, businessUnitCode, address1 },
                          index
                        ) => (
                          <MenuItem
                            key={businessUnitCode}
                            value={businessUnitCode}
                            style={getStyles(businessUnitCode, theme)}
                          >
                            {businessUnitCode} - {address1}
                          </MenuItem>
                        )
                      )}
                  </Select>
                  {formErrors.selectedBusinessUnits && (
                    <FormHelperText>
                      {formErrors.selectedBusinessUnits}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            {mode === "Edit" && (
              <Grid item xs={12}>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        name="active"
                        color="primary"
                      />
                    }
                    label="Active"
                  />
                </FormGroup>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            onClick={onClose}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={disableSaveButton}
            onClick={onSave}
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}