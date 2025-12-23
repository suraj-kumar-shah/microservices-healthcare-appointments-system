const express = require("express");
const app = express();
app.use(express.json());

let notifications = [];

app.post("/notify", (req, res) => {
  const notification = {
    id: notifications.length + 1,
    ...req.body,
    sentAt: new Date()
  };

  notifications.push(notification);
  console.log("Notification Log:", notification);

  res.status(201).json(notification);
});

app.get("/notifications", (req, res) => {
  res.json(notifications);
});

app.get("/notifications/patient/:email", (req, res) => {
  const result = notifications.filter(n => n.patientEmail === req.params.email);
  res.json(result);
});

app.get("/health", (req, res) => {
  res.send("Notification Service Healthy");
});

app.listen(3003, () => {
  console.log("Notification Service running on port 3003");
});
