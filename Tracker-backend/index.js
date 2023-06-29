const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");
const PORT = process.env.PORT;
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const cors = require("cors");
const { post } = require("request");
const { STRING } = require("sequelize");
const axios = require("axios").default;
const fs = require("fs");
const _ = require("lodash");
require("dotenv").config();

const app = express();

app.use(cors({ origin: "https://lazaro-tracker.com" }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

const issueTrackerDomain = process.env.ISSUETRACKERDOMAIN;

const issueTrackerManagementClientId =
  process.env.ISSUETRACKERMANAGEMENTCLIENTID;
const issueTrackerManagementClientSecret =
  process.env.ISSUETRACKERMANAGEMENTCLIENTSECRET;
const issueTrackerManagementClientScope =
  process.env.ISSUETRACKERMANAGEMENTCLIENTSCOPE;

const issueTrackerAuthenticationClientId =
  process.env.ISSUETRACKERAUTHENTICATIONCLIENTID;
const issueTrackerAuthenticationClientSecret =
  process.env.ISSUETRACKERAUTHENTICATIONCLIENTSECRET;

const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: process.env.PGUSER,
    logging: false,
    port: process.env.PGPORT,
  }
);

var ManagementClient = require("auth0").ManagementClient;
var auth0 = new ManagementClient({
  domain: issueTrackerDomain,
  clientId: issueTrackerManagementClientId,
  clientSecret: issueTrackerManagementClientSecret,
  scope: issueTrackerManagementClientScope,
});

var AuthenticationClient = require("auth0").AuthenticationClient;

var auth0authentication = new AuthenticationClient({
  domain: issueTrackerDomain,
  clientId: issueTrackerAuthenticationClientId,
  clientSecret: issueTrackerAuthenticationClientSecret,
});

var accountInfo = {};

const Project = sequelize.define(
  "Project",
  {
    projectName: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    startDate: { type: DataTypes.STRING },
    endDate: { type: DataTypes.STRING },
    priority: { type: DataTypes.STRING },
    archived: { type: DataTypes.BOOLEAN },
    projectImage: { type: DataTypes.TEXT },
    projectManager: { type: DataTypes.STRING },
    auth0Id: { type: DataTypes.STRING },
    projectManagerEmail: { type: DataTypes.STRING },
    teamMembers: { type: DataTypes.ARRAY(DataTypes.JSON) },
  },
  { timestamps: false }
);

Project.sync({ alter: true });

const Ticket = sequelize.define(
  "Ticket",
  {
    title: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    project: { type: DataTypes.STRING },
    ticketType: { type: DataTypes.STRING },
    priority: { type: DataTypes.STRING },
    auth0Id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
    developer: { type: DataTypes.STRING },
    archived: { type: DataTypes.BOOLEAN },
    projectId: { type: DataTypes.STRING },
    projectManager: { type: DataTypes.STRING },
    created: { type: DataTypes.STRING },
    lastUpdated: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
  },
  { timestamps: false }
);
Ticket.sync({ alter: true });

const TicketActivity = sequelize.define(
  "TicketActivity",
  {
    newTitle: { type: DataTypes.STRING },
    previousTitle: { type: DataTypes.STRING },
    newStatus: { type: DataTypes.STRING },
    previousStatus: { type: DataTypes.STRING },
    newPriority: { type: DataTypes.STRING },
    previousPriority: { type: DataTypes.STRING },
    typeOfActivity: { type: DataTypes.STRING },
    ticketId: { type: DataTypes.STRING },
    projectId: { type: DataTypes.INTEGER },
    dateOfActivity: { type: DataTypes.STRING },
    newDeveloper: { type: DataTypes.STRING },
    previousDeveloper: { type: DataTypes.STRING },
    ticketTitle: { type: DataTypes.STRING },
    auth0Id: { type: DataTypes.STRING },
    user: { type: DataTypes.STRING },
  },
  { timestamps: false }
);
TicketActivity.sync({ alter: true });

const Comment = sequelize.define(
  "Comment",
  {
    comment: { type: DataTypes.STRING },
    dateOfComment: { type: DataTypes.STRING },
    user: { type: DataTypes.STRING },
    ticketId: { type: DataTypes.STRING },
    auth0Id: { type: DataTypes.STRING },
  },
  { timestamps: false }
);
Comment.sync({ alter: true });

const Attachment = sequelize.define(
  "Attachment",
  {
    attachment: { type: DataTypes.JSON },
    description: { type: DataTypes.STRING },
    user: { type: DataTypes.STRING },
    ticketId: { type: DataTypes.INTEGER },
    auth0Id: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
  },
  { timestamps: false }
);
Attachment.sync({ alter: true });

let ticketInfoFromDetails4Edit;
let ticketInfoFromTicketsTableForEdit;
let projectInfoFromProjectsTableForEdit;
let projectInfoFromDetails4Edit;

app.post("/Settings", (req, res) => {
  const userID = req.body.userId;
  auth0.getUser({ id: userID }, (err, user) => {
    accountInfo = user;
    res.send(accountInfo);
  });
});

app.post("/Settings/updatePhoneOrEmail", (req, res) => {
  const userId = req.body.userId;
  const updatedEmail = req.body.updatedEmail;
  const updatedPhoneNumber = req.body.updatedPhoneNumber;

  let isUpdatingOnlyPhoneNumber = false;
  let isUpdatingOnlyEmail = false;
  let updateBoth = false;

  let userInfo = {
    emailResponse: null,
    phoneNumberResponse: null,
    phoneNumberUpdated: false,
  };

  if (updatedEmail && updatedPhoneNumber !== null) {
    updateBoth = true;

    updateUserData();
  } else {
    if (updatedEmail) isUpdatingOnlyEmail = true;
    if (updatedPhoneNumber !== null) isUpdatingOnlyPhoneNumber = true;
    updateUserData();
  }

  function updateUserData() {
    function updateOnlyEmail() {
      auth0.updateUser({ id: userId }, { email: updatedEmail }, (err, user) => {
        if (err) {
          userInfo.emailResponse = err;
          res.send(userInfo);
        } else {
          userInfo.emailResponse = user.email;
          res.send(userInfo);
        }
      });
    }

    function updateOnlyPhoneNumber() {
      auth0.updateUserMetadata(
        { id: userId },
        { phoneNumber: updatedPhoneNumber },
        (err, user) => {
          if (err) {
            userInfo.phoneNumberResponse = err;
            res.send(userInfo);
          } else {
            userInfo.phoneNumberResponse = user.user_metadata.phoneNumber;

            userInfo.phoneNumberUpdated = true;

            res.send(userInfo);
          }
        }
      );
    }

    function updateEmailAndPhoneNumber() {
      auth0.updateUser({ id: userId }, { email: updatedEmail }, (err, user) => {
        if (err) {
          userInfo.emailResponse = err;
        } else {
          userInfo.emailResponse = user.email;
        }

        auth0.updateUserMetadata(
          { id: userId },
          { phoneNumber: updatedPhoneNumber },
          (err, user) => {
            if (err) {
              userInfo.phoneNumberResponse = err;
            } else {
              userInfo.phoneNumberResponse = user.user_metadata.phoneNumber;

              userInfo.phoneNumberUpdated = true;
            }

            res.send(userInfo);
          }
        );
      });
    }

    if (isUpdatingOnlyEmail === true) {
      updateOnlyEmail();
    }

    if (isUpdatingOnlyPhoneNumber === true) {
      updateOnlyPhoneNumber();
    }

    if (updateBoth === true) {
      updateEmailAndPhoneNumber();
    }
  }
});

app.post("/ManageTeam", (req, res) => {
  let projectId = req.body.projectId;

  let teamMembers = req.body.teamMembers;

  Project.update(
    {
      teamMembers: teamMembers,
    },
    { where: { id: projectId } }
  ).then(() => {
    Project.findOne({ where: { id: projectId } }).then((r) => {
      res.send(r);
    });
  });
});

app.post("/Tickets/Details/CreateComment", (req, res) => {
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let time = date.toLocaleTimeString();
  time = time.toString().replace(new RegExp(/\:\d\d[^\:]/, "i"), " ");
  if (month < 10) month = "0" + month;

  let currentDateAndTime = month + "/" + day + "/" + year + "      " + time;
  let currentDate = month + "-" + day + "-" + year;

  let auth0Id = req.body.auth0Id;
  let user = req.body.user;

  Comment.create({
    comment: req.body.comment,
    dateOfComment: currentDateAndTime,
    user: user,
    ticketId: req.body.ticketId,
    auth0Id: auth0Id,
  }).then((r) => {
    const newTicketActivity = TicketActivity.create({
      typeOfActivity: "New comment added to ticket",
      ticketId: req.body.ticketId,
      auth0Id: req.body.auth0Id,
      dateOfActivity: currentDate,
      ticketTitle: req.body.ticketTitle,
      projectId: req.body.projectId,
      user: user,
    }).then((r) => {
      res.send();
    });
  });
});

app.post("/Tickets/Details/CommentInfo", (req, res) => {
  let ticketId = req.body.ticketId.toString();
  let auth0Id = req.body.auth0Id;

  const findComments = async () => {
    const comments = await Comment.findAll({
      where: {
        ticketId: ticketId,
      },
    });

    res.send(comments);
  };
  findComments();
});

app.post("/Projects/Details/ProjectTickets", (req, res) => {
  Ticket.findAll({
    where: {
      projectId: req.body.projectId.toString(),
    },
  }).then((r) => {
    res.send(r);
  });
});

app.post("/filesMessage", (req, res) => {
  res.send();
});

app.post("/Tickets/Details/AddAttachment", (req, res) => {
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let time = date.toLocaleTimeString();
  time = time.toString().replace(new RegExp(/\:\d\d[^\:]/, "i"), " ");
  if (month < 10) month = "0" + month;

  let currentDateAndTime = month + "/" + day + "/" + year + "      " + time;
  let currentDate = month + "-" + day + "-" + year;

  let auth0Id = req.body.auth0Id;
  let ticketId = req.body.ticketId;
  let user = req.body.user;

  Attachment.create({
    attachment: req.body.file,
    dateAttachmentAdded: currentDateAndTime,
    ticketId: ticketId,
    auth0Id: auth0Id,
  }).then((r) => {
    const newTicketActivity = TicketActivity.create({
      typeOfActivity: "Attachment added to ticket",
      ticketId: ticketId,
      auth0Id: auth0Id,
      dateOfActivity: currentDate,
      ticketTitle: req.body.ticketTitle,
      projectId: req.body.projectId,
      user: user,
    }).then((r) => {
      Attachment.findAll({ where: { ticketId: ticketId } }).then((r) => {
        res.send(r);
      });
    });
  });
});

app.post("/Tickets/Details/DeleteAttachment", (req, res) => {
  const attachmentId = req.body.id;
  let auth0Id = req.body.auth0Id;
  let ticketId = req.body.ticketId;

  Attachment.destroy({ where: { id: attachmentId, ticketId: ticketId } }).then(
    (r) => {
      Attachment.findAll({ where: { ticketId: ticketId } }).then((r) => {
        res.send(r);
      });
    }
  );
});

app.post("/Tickets/Details/AttachmentInfo", (req, res) => {
  Attachment.findAll({
    where: {
      ticketId: req.body.ticketId.toString(),
    },
  }).then((r) => {
    if (r.length === 0) {
      res.send([]);
    } else {
      let attachments = r;
      res.send(attachments);
    }
  });
});

app.post("/Tickets/Delete", (req, res) => {
  const auth0Id = req.body.auth0Id;
  const ticketId = req.body.ticketId.toString();

  Ticket.destroy({
    where: {
      id: ticketId,
    },
  }).then(() => {
    res.send();
  });
});

app.post("/Projects/Details/DeleteTicket", (req, res) => {
  const auth0Id = req.body.auth0Id;
  const projectId = req.body.projectId;
  const ticketId = req.body.ticketId.toString();

  Ticket.destroy({
    where: {
      id: ticketId,
      projectId: projectId,
    },
  }).then(() => {
    Ticket.findAll({ where: { projectId: projectId } }).then((r) => {
      res.send(r);
    });
  });
});

app.post("/Tickets/Details/DeleteTicket", (req, res) => {
  const auth0Id = req.body.auth0Id;
  const ticketId = req.body.ticketId.toString();

  Ticket.destroy({
    where: {
      id: ticketId,
    },
  }).then(() => {
    Ticket.findAll().then((r) => {
      res.send(r);
    });
  });
});

app.post("/Projects/Delete", (req, res) => {
  Project.destroy({
    where: {
      id: req.body.projectId.toString(),
    },
  }).then((r) => {
    res.send();
  });
});

app.post("/projects/Create", upload.single("image"), (req, res, next) => {
  const base64FromImage = req.body.projectImageBase64;

  const createProject = (async) => {
    const newProject = Project.create({
      projectName: req.body.projectName,
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      priority: req.body.priority,
      projectImage: base64FromImage && base64FromImage,
      projectManager: req.body.projectManager,
      projectManagerEmail: req.body.projectManagerEmail,
      archived: false,
      auth0Id: req.body.auth0Id,
    }).then(() => {
      res.send();
    });
  };
  createProject();
});

app.post("/tickets/Create", (req, res, next) => {
  let auth0Id = req.body.auth0Id;
  let projectId = req.body.projectId;
  let user = req.body.user;

  Project.findAll({ where: { id: projectId } }).then((r) => {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    if (month < 10) month = "0" + month;

    let currentDate = month + "/" + day + "/" + year;
    let currentDateForActivity = month + "-" + day + "-" + year;

    let projectInfo = r[0].dataValues;

    let projectManager = projectInfo.projectManager;

    const createTicket = (async) => {
      const newTicket = Ticket.create({
        title: req.body.title,
        description: req.body.description,
        project: req.body.project,
        ticketType: req.body.ticketType,
        auth0Id: req.body.auth0Id,
        priority: req.body.priority,
        status: req.body.status,
        developer: "Not Assigned",
        archived: false,
        projectId: req.body.projectId,
        projectManager: projectManager,
        created: currentDate,
        createdBy: user,
      }).then((r) => {
        let ticketId = r.dataValues.id;

        const createTicketActivity = (async) => {
          const newTicketActivity = TicketActivity.create({
            typeOfActivity: "New Ticket Created",
            ticketId: ticketId,
            auth0Id: req.body.auth0Id,
            dateOfActivity: currentDateForActivity,
            projectId: req.body.projectId,
            user: user,
          }).then(() => {
            res.send();
          });
        };

        createTicketActivity();
      });
    };
    createTicket();
  });
});

app.post("/Tickets/Create/ProjectInfo", (req, res) => {
  const auth0Id = req.body.id;

  const findProjects = async () => {
    const projects = await Project.findAll();
    res.send(projects);
  };

  findProjects();
});

app.post("/Tickets/Edit/ProjectInfo", (req, res) => {
  const auth0Id = req.body.id;

  const findProjects = async () => {
    const projects = await Project.findAll();
    res.send(projects);
  };

  findProjects();
});

app.post("/Tickets/Edit/InfoFromDetails", (req, res) => {
  ticketInfoFromTicketsTableForEdit = "";

  ticketInfoFromDetails4Edit = req.body;

  res.send();
});

app.get("/Tickets/Edit/InfoFromDetails", (req, res) => {
  res.send(ticketInfoFromDetails4Edit);
});

app.post("/Projects/Edit/InfoFromDetails", (req, res) => {
  projectInfoFromProjectsTableForEdit = "";

  projectInfoFromDetails4Edit = req.body;
  res.send();
});

app.get("/Projects/Edit/InfoFromDetails", (req, res) => {
  res.send(projectInfoFromDetails4Edit);
});

app.post("/projects/archivedStatus", (req, res) => {
  const projectId = req.body.projectId;

  Project.update(
    {
      archived: req.body.archived,
    },
    { where: { id: projectId } }
  ).then((r) => {
    Project.findAll().then((r) => {
      res.send(r);
    });
  });
});

app.post("/Tickets/archivedStatus", (req, res) => {
  const auth0Id = req.body.userId;
  const ticketId = req.body.ticketId;
  const archived = req.body.archived;

  Ticket.update(
    {
      archived: req.body.archived,
    },
    { where: { id: ticketId } }
  ).then((r) => {
    Ticket.findAll().then((r) => {
      res.send(r);
    });
  });
});

app.post("/projects/Archived/ArchivedStatus", (req, res) => {
  const projectId = req.body.projectId;

  Project.update(
    {
      archived: req.body.archived,
    },
    { where: { id: projectId } }
  ).then((r) => {
    Project.findAll({ where: { archived: true } }).then((r) => {
      res.send(r);
    });
  });
});

app.post("/Tickets/Archived/ArchivedStatus", (req, res) => {
  const auth0Id = req.body.userId;
  const ticketId = req.body.ticketId;
  const archived = req.body.archived;

  Ticket.update(
    {
      archived: archived,
    },
    { where: { id: ticketId } }
  ).then((r) => {
    Ticket.findAll({ where: { archived: true } }).then((r) => {
      res.send(r);
    });
  });
});

app.post("/Delete", (req, res) => {
  const ContactID = req.body.ID;
  const deleteContact = async () => {
    await Contact.destroy({ where: { id: ContactID } });
    res.send("deleted");
  };
  deleteContact();
});

app.post("/Tickets/Details/Info", (req, res) => {
  const ticketId = req.body.ticketId;
  const auth0Id = req.body.auth0Id;

  Ticket.findOne({ where: { id: ticketId } }).then((r) => {
    res.send(r);
  });
});

app.post("/Projects/Edit/Info", (req, res) => {
  const projectId = req.body.projectId;
  const auth0Id = req.body.auth0Id;

  Project.findOne({ where: { id: projectId } }).then((r) => {
    res.send(r);
  });
});

app.post("/Projects/Details/Info", (req, res) => {
  const projectId = req.body.projectId;
  const auth0Id = req.body.auth0Id;

  Project.findOne({ where: { id: projectId } }).then((r) => {
    res.send(r);
  });
});

app.post("/Tickets/Edit/Info", (req, res) => {
  const ticketId = req.body.ticketId;
  const auth0Id = req.body.auth0Id;

  Ticket.findOne({ where: { id: ticketId } }).then((r) => {
    res.send(r);
  });
});

let ticketInfoFromTicketsTable;
let ticketInfoFromAssignDev;

app.post("/Tickets/Info", (req, res) => {
  ticketInfoFromAssignDev = "";

  ticketInfoFromTicketsTable = req.body;

  res.send("completed");
});

app.get("/Tickets/Info", (req, res) => {
  res.send(ticketInfoFromTicketsTable);
});

app.post("/Projects/Edit/InfoFromProjectsTable", (req, res) => {
  projectInfoFromDetails4Edit = "";

  projectInfoFromProjectsTableForEdit = req.body;

  res.send("completed");
});

app.get("/Projects/Edit/InfoFromProjectsTable", (req, res) => {
  res.send(projectInfoFromProjectsTableForEdit);
});

app.post("/Tickets/Edit/InfoFromTicketsTable", (req, res) => {
  ticketInfoFromDetails4Edit = "";

  ticketInfoFromTicketsTableForEdit = req.body;

  res.send("completed");
});

app.get("/Tickets/Edit/InfoFromTicketsTable", (req, res) => {
  res.send(ticketInfoFromTicketsTableForEdit);
});

app.post("/Tickets/Details/activityInfo", (req, res) => {
  let ticketIdForActivity = req.body.id.toString();
  let auth0Id = req.body.auth0Id;

  const findTicketActivity = async () => {
    const ticketActivity = await TicketActivity.findAll({
      where: { ticketId: ticketIdForActivity },
    });

    res.send(ticketActivity);
  };
  findTicketActivity();
});

let projectIdForProjectActivity;
let auth0IdForProjectActivity;

app.post("/Projects/Details/activityInfo", (req, res) => {
  projectIdForProjectActivity = req.body.projectId;
  auth0IdForProjectActivity = req.body.auth0Id;

  const findTicketActivity = async () => {
    const ticketActivity = await TicketActivity.findAll({
      where: { projectId: projectIdForProjectActivity },
    });

    res.send(ticketActivity);
  };
  findTicketActivity();
});

app.post("/Tickets/Details/ProjectInfo", (req, res) => {
  let auth0Id = req.body.auth0Id;
  let projectId = req.body.projectId;

  Project.findAll({ where: { id: projectId } }).then((r) => {
    let project = r.length > 0 ? r[0].dataValues : [];
    res.send(project);
  });
});

let ticketInfoToUpdate;
app.post("/Tickets/Edit", (req, res) => {
  let statusChanged = false;
  let devChanged = false;
  let titleChanged = false;
  let priorityChanged = false;

  let user = req.body.user;

  const getCurrentTicketInfo = async () => {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    if (month < 10) month = "0" + month;

    let year = date.getFullYear();
    let currentDate = month + "-" + day + "-" + year;
    let lastUpdatedDate = month + "/" + day + "/" + year;

    let user = req.body.user;

    const currentTicketInfo = await Ticket.findAll({
      where: { id: req.body.ticketId },
    }).then((r) => {
      let currentInfo = r[0].dataValues;

      if (currentInfo.status !== req.body.status) statusChanged = true;
      if (currentInfo.title !== req.body.title) titleChanged = true;
      if (currentInfo.priority !== req.body.priority) priorityChanged = true;

      let projectId = req.body.projectId;

      const createTicketActivity = (async) => {
        if (statusChanged) {
          const newTicketActivity = TicketActivity.create({
            typeOfActivity: "New Ticket Status",
            ticketId: req.body.ticketId,
            auth0Id: req.body.auth0Id,
            dateOfActivity: currentDate,
            previousStatus: currentInfo.status,
            newStatus: req.body.status,
            projectId: req.body.projectId,
            user: user,
          });
        }

        if (titleChanged) {
          const newTicketActivity = TicketActivity.create({
            typeOfActivity: "New Ticket Title",
            ticketId: req.body.ticketId,
            auth0Id: req.body.auth0Id,
            dateOfActivity: currentDate,
            previousTitle: currentInfo.title,
            newTitle: req.body.title,
            projectId: req.body.projectId,
            user: user,
          });
        }
        if (priorityChanged) {
          const newTicketActivity = TicketActivity.create({
            typeOfActivity: "New Ticket Priority",
            ticketId: req.body.ticketId,
            auth0Id: req.body.auth0Id,
            dateOfActivity: currentDate,
            previousPriority: currentInfo.priority,
            newPriority: req.body.priority,
            projectId: req.body.projectId,
            user: user,
          });
        }
      };

      createTicketActivity();

      let auth0Id = req.body.auth0Id;

      Project.findAll({ where: { id: projectId } }).then((r) => {
        let projectInfo = r[0].dataValues;

        let projectManager = projectInfo.projectManager;

        Ticket.update(
          {
            title: req.body.title,
            description: req.body.description,
            project: req.body.project,
            ticketType: req.body.ticketType,
            auth0Id: req.body.auth0Id,
            priority: req.body.priority,
            status: req.body.status,
            archived: req.body.archived && req.body.archived,
            projectId: req.body.projectId,
            projectManager: projectManager,
            lastUpdated: lastUpdatedDate,
          },
          { where: { id: req.body.ticketId } }
        ).then(() => {
          res.send();
        });
      });
    });
  };

  getCurrentTicketInfo();

  ticketInfoToUpdate = req.body;
});

app.post("/Tickets/Activity/AssignDeveloper", (req, res) => {
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  if (month < 10) month = "0" + month;

  let currentDate = month + "-" + day + "-" + year;
  let lastUpdatedDate = month + "/" + day + "/" + year;

  let user = req.body.user;

  let developerChanged;
  Ticket.findAll({ where: { id: req.body.ticketId } }).then((r) => {
    let currentInfo = r[0].dataValues;

    if (currentInfo.developer !== req.body.developer) developerChanged = true;

    let previousDeveloper = currentInfo.developer;

    if (developerChanged) {
      const newTicketActivity = TicketActivity.create({
        typeOfActivity: "New Developer Assigned",
        ticketId: req.body.ticketId,
        auth0Id: req.body.auth0Id,
        dateOfActivity: currentDate,
        newDeveloper: req.body.developer,
        previousDeveloper: previousDeveloper,
        projectId: req.body.projectId,
        user: user,
      });

      Ticket.update(
        {
          developer: req.body.developer,
          lastUpdated: lastUpdatedDate,
        },
        { where: { id: req.body.ticketId } }
      );
    }
  });

  res.send("completed");
});

app.post("/Projects/Edit", upload.single("image"), (req, res) => {
  const base64FromImage = req.body.projectImageBase64;

  const projectNameChanged = req.body.projectNameChanged;

  Project.update(
    {
      projectName: req.body.projectName,
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      priority: req.body.priority,
      projectImage: base64FromImage && base64FromImage,
      projectManager: req.body.projectManager,
      archived: req.body.archived,
      auth0Id: req.body.auth0Id,
      projectManagerEmail: req.body.projectManagerEmail,
    },
    { where: { id: req.body.projectId } }
  ).then(() => {
    if (projectNameChanged) {
      Ticket.update(
        {
          project: req.body.projectName,
        },
        { where: { projectId: req.body.projectId } }
      ).then(() => {
        res.send();
      });
    } else {
      res.send();
    }
  });
});

app.post("/Settings/phoneUpdate", (req, res) => {
  const userID = req.body.userId;
  const updatedPhoneNumber = req.body.updatedPhoneNumber;
  const id = req.body.id;

  req.body.updatedPhoneNumber &&
    auth0.updateUserMetadata(
      { id: id },
      { phoneNumber: updatedPhoneNumber },
      (err, user) => {
        if (err) {
          res.send(err);
        } else {
          res.send(user.user_metadata.phoneNumber);
        }
      }
    );
});

app.post("/Settings/emailUpdate", (req, res) => {
  const userID = req.body.userId;
  const updatedEmail = req.body.updatedEmail;
  const id = req.body.id;

  req.body.updatedEmail &&
    auth0.updateUser({ id: id }, { email: updatedEmail }, (err, user) => {
      if (err) {
        res.send(err);
      } else {
        res.send(user.email);
      }
    });
});

app.post("/Settings", (req, res) => {
  const userID = req.body.userId;
  auth0.getUser({ id: userID }, (err, user) => {
    accountInfo = user;
    res.send(accountInfo);
  });
});

let accountInfoForPassword = {};
let userToken = "";

app.post("/Settings/Password", (req, res) => {
  const userId = req.body.id;
  const newPassword = req.body.newPassword;
  const userEmail = req.body.userEmail;
  const currentPassword = req.body.currentPassword;

  let data = {
    username: userEmail,
    password: currentPassword,
  };

  if (req.body.userEmail) {
    auth0authentication.passwordGrant(data, (err, userData) => {
      userToken = userData && userData.access_token;

      if (userToken) {
        auth0authentication.getProfile(userToken, function (err, userInfo) {
          if (userId === userInfo.sub) {
            auth0.updateUser(
              { id: userId },
              { password: newPassword },
              (err, user) => {
                if (
                  err &&
                  err.originalError.response.res.text ===
                    '{"statusCode":400,"error":"Bad Request","message":"PasswordStrengthError: Password is too weak"}'
                ) {
                  res.write("password is too weak");
                  res.send();
                } else if (!err) {
                  res.write("success");
                  res.send();
                }
              }
            );
          }
        });
      } else {
        res.write("password incorrect");
        res.send();
      }
    });
  } else {
    res.write("password incorrect");
  }
});

app.post("/Settings/Data", (req, res) => {
  const userId = req.body.id;

  auth0.deleteUser({ id: userId });
});

app.post("/manageRoles", (req, res) => {
  auth0.getUsers((err, users) => {
    let allUsers = [];
    users.map((user) => {
      const userId = user.user_id;
      const firstName = user.user_metadata && user.user_metadata.firstName;
      const lastName = user.user_metadata && user.user_metadata.lastName;

      auth0.getUserRoles({ id: userId }, (err, roles) => {
        let userInfo = {
          firstName: firstName,
          lastName: lastName,
          auth0Id: userId,
          email: user.email,
          roles: roles,
        };
        allUsers = [...allUsers, userInfo];

        if (users.length === allUsers.length) {
          allUsers = _.sortBy(allUsers, ["lastName"]);
          res.send(allUsers);
        }
      });
    });
  });
});

app.get("/getDevs", (req, res) => {
  auth0.getUsers((err, users) => {
    let allUsers = [];
    users.map((user) => {
      let includeInAllUsersArray = false;

      const userId = user.user_id;
      const firstName = user.user_metadata && user.user_metadata.firstName;
      const lastName = user.user_metadata && user.user_metadata.lastName;

      auth0.getUserRoles({ id: userId }, (err, roles) => {
        let userInfo = {
          firstName: firstName,
          lastName: lastName,
          auth0Id: userId,
          email: user.email,
          roles: roles,
        };

        allUsers = [...allUsers, userInfo];

        if (users.length === allUsers.length) {
          let allDevs = [];

          allUsers.map((user) => {
            user.roles.map((role) => {
              if (role.name === "Developer") allDevs = [...allDevs, user];
            });
          });

          allDevs = _.sortBy(allDevs, ["lastName"]);

          res.send(allDevs);
        }
      });
    });
  });
});

app.get("/getProjectManagers", (req, res) => {
  auth0.getUsers((err, users) => {
    let allUsers = [];
    users.map((user) => {
      let includeInAllUsersArray = false;

      const userId = user.user_id;
      const firstName = user.user_metadata && user.user_metadata.firstName;
      const lastName = user.user_metadata && user.user_metadata.lastName;

      auth0.getUserRoles({ id: userId }, (err, roles) => {
        let userInfo = {
          firstName: firstName,
          lastName: lastName,
          auth0Id: userId,
          email: user.email,
          roles: roles,
        };

        allUsers = [...allUsers, userInfo];

        if (users.length === allUsers.length) {
          let allManagers = [];

          allUsers.map((user) => {
            user.roles.map((role) => {
              if (role.name === "Project Manager")
                allManagers = [...allManagers, user];
            });
          });

          allManagers = _.sortBy(allManagers, ["lastName"]);
          res.send(allManagers);
        }
      });
    });
  });
});

app.post("/updateRoles", (req, res) => {
  const selectedUsersAuth0Id = req.body.selectedUsersAuth0Id;
  const loggedInUsersAuth0Id = req.body.auth0Id;

  let selectedRoles = req.body.selectedRoles;

  const adminId = "rol_6wcmfqBMJAjijOBv";
  const projectManagerId = "rol_9ZE5IsuCTawpR2pU";

  const devId = "rol_QEdFefepF1AQ33hl";
  const standardUserId = "rol_PLukQJlcL377B6Xv";

  selectedRoles = selectedRoles.map((role) => {
    if (role.includes("Project Manager")) {
      return projectManagerId;
    } else if (role.includes("Administrator")) {
      return adminId;
    } else if (role.includes("Developer")) {
      return devId;
    } else if (role.includes("User")) {
      return standardUserId;
    }
  });

  let RolesToRemoveArray = [adminId, projectManagerId, devId, standardUserId];

  RolesToRemoveArray = RolesToRemoveArray.filter(
    (el) => !selectedRoles.includes(el)
  );

  const params = { id: selectedUsersAuth0Id };
  const data = { roles: selectedRoles };
  selectedRoles.length > 0 &&
    auth0.assignRolestoUser(params, data, function (err, user) {
      if (err) {
      }
    });

  var params4Remove = {
    id: selectedUsersAuth0Id,
  };
  var data4Remove = { roles: RolesToRemoveArray };

  RolesToRemoveArray.length > 0 &&
    auth0.users.removeRoles(params4Remove, data4Remove, function (err, user) {
      if (err) {
      }
    });
});

app.post("/Projects", (req, res) => {
  const auth0Id = req.body.auth0Id;

  const findProjects = async () => {
    fs.readFile("./images/default.jpg", async function (err, data) {
      let defaultImage;

      defaultImage = data.toString("base64");

      const projects = await Project.findAll();

      let projectInfo = {
        projects: projects,
        defaultImage: defaultImage,
      };

      res.send(projectInfo);
    });
  };

  if (auth0Id) findProjects();
});

app.post("/Projects/Archived", (req, res) => {
  const findProjects = async () => {
    fs.readFile("./images/default.jpg", async function (err, data) {
      let defaultImage;

      defaultImage = data.toString("base64");

      const projects = await Project.findAll({
        where: {
          archived: true,
        },
      });
      let projectInfo = {
        projects: projects,
        defaultImage: defaultImage,
      };

      res.send(projectInfo);
    });
  };
  findProjects();
});

app.post("/Tickets", (req, res) => {
  const auth0Id = req.body.auth0Id;

  const findTickets = async () => {
    const tickets = await Ticket.findAll();
    let ticketInfo = {
      tickets: tickets,
    };

    res.send(ticketInfo);
  };

  if (auth0Id) findTickets();
});

app.post("/Tickets/archived", (req, res) => {
  const findTickets = async () => {
    const tickets = await Ticket.findAll({ where: { archived: true } });
    let ticketInfo = {
      tickets: tickets,
    };

    res.send(ticketInfo);
  };
  findTickets();
});

app.post("/Tickets/Unassigned", (req, res) => {
  const findTickets = async () => {
    const tickets = await Ticket.findAll({
      where: { developer: "Not Assigned" },
    });
    let ticketInfo = {
      tickets: tickets,
    };

    res.send(ticketInfo);
  };
  findTickets();
});

app.listen(PORT, () => {});
