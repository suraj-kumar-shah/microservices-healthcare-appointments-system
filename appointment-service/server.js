const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

let appointments = [];
let counter = 1;

const DOCTOR_SERVICE = process.env.DOCTOR_SERVICE_URL;
const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE_URL;

app.post("/appointments", async (req, res) => {
  try {
    const { doctorId, patientName, patientEmail, appointmentDate, appointmentTime } = req.body;

    const doctorRes = await axios.get(`${DOCTOR_SERVICE}/doctors/${doctorId}`);
    const doctor = doctorRes.data;

    if (doctor.availableSlots <= 0) {
      return res.status(400).json({ message: "No slots available" });
    }

    await axios.put(`${DOCTOR_SERVICE}/doctors/${doctorId}/slots`, {
      availableSlots: doctor.availableSlots - 1
    });

    const appointment = {
      id: counter++,
      doctorId,
      doctorName: doctor.name,
      patientName,
      patientEmail,
      appointmentDate,
      appointmentTime,
      status: "confirmed",
      consultationFee: doctor.consultationFee
    };

    appointments.push(appointment);

    await axios.post(`${NOTIFICATION_SERVICE}/notify`, {
      appointmentId: appointment.id,
      patientEmail,
      message: "Appointment Confirmed",
      type: "confirmation"
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: "Appointment booking failed" });
  }
});

app.get("/appointments", (req, res) => {
  res.json(appointments);
});

app.get("/appointments/:id", (req, res) => {
  const appointment = appointments.find(a => a.id == req.params.id);
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  res.json(appointment);
});

app.put("/appointments/:id/cancel", async (req, res) => {
  const appointment = appointments.find(a => a.id == req.params.id);
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });

  appointment.status = "cancelled";

  const doctorRes = await axios.get(`${DOCTOR_SERVICE}/doctors/${appointment.doctorId}`);
  await axios.put(`${DOCTOR_SERVICE}/doctors/${appointment.doctorId}/slots`, {
    availableSlots: doctorRes.data.availableSlots + 1
  });

  await axios.post(`${NOTIFICATION_SERVICE}/notify`, {
    appointmentId: appointment.id,
    patientEmail: appointment.patientEmail,
    message: "Appointment Cancelled",
    type: "cancellation"
  });

  res.json(appointment);
});

app.get("/health", (req, res) => {
  res.send("Appointment Service Healthy");
});

app.listen(3002, () => {
  console.log("Appointment Service running on port 3002");
});
