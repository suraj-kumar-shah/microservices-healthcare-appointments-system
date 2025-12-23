const express = require("express");
const app = express();
app.use(express.json());

let doctors = [
  { id: 1, name: "Dr. Sharma", specialization: "Cardiologist", availableSlots: 5, consultationFee: 500 },
  { id: 2, name: "Dr. Mehta", specialization: "Dermatologist", availableSlots: 3, consultationFee: 400 },
  { id: 3, name: "Dr. Khan", specialization: "Pediatrician", availableSlots: 4, consultationFee: 300 }
];

app.get("/doctors", (req, res) => {
  res.json(doctors);
});

app.get("/doctors/:id", (req, res) => {
  const doctor = doctors.find(d => d.id == req.params.id);
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  res.json(doctor);
});

app.post("/doctors", (req, res) => {
  doctors.push(req.body);
  res.status(201).json(req.body);
});

app.put("/doctors/:id/slots", (req, res) => {
  const doctor = doctors.find(d => d.id == req.params.id);
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  doctor.availableSlots = req.body.availableSlots;
  res.json(doctor);
});

app.get("/health", (req, res) => {
  res.send("Doctor Service Healthy");
});

app.listen(3001, () => {
  console.log("Doctor Service running on port 3001");
});
