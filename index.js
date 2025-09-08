require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./db/db.connect");

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

initializeDatabase();

app.use("/api/v1/", require("./routes/lead.routes"));
app.use("/api/v1/", require("./routes/salesAgent.routes"));
app.use("/api/v1/", require("./routes/comment.routes"));
app.use("/api/v1/", require("./routes/report.routes"));
app.use("/api/v1/", require("./routes/tag.routes"));

app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 Kranti CRM API is live." });
});

app.listen(PORT, () => {
  console.log("Server runing on port:", PORT);
});
