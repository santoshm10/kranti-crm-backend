const mongoose = require("mongoose");
const validator = require("validator");
const SalesAgent = require("../models/salesAgent.model");

//create sales agent
exports.createAgent = async (req, res) => {
  const { name, email } = req.body;

  if (!name || typeof name !== "string") {
    return res
      .status(400)
      .json({ error: "Invalid input: 'name' must be a string." });
  }

  if (!email || !validator.isEmail(email)) {
    return res
      .status(400)
      .json({ error: "Invalid input: 'email' must be a valid email address." });
  }

  const existing = await SalesAgent.findOne({ email });
  if (existing) {
    return res
      .status(409)
      .json({ error: `Sales agent with email '${email}' already exists.` });
  }

  try {
    const newAgent = new SalesAgent({ name, email });
    await newAgent.save();

    res.status(201).json({
      id: newAgent._id,
      name: newAgent.name,
      email: newAgent.email,
      createdAt: newAgent.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get all agents
exports.getAllAgent = async (req, res) => {
  try {
    const agents = await SalesAgent.find({}, "name email");

    const response = agents.map((agent) => ({
      id: agent._id,
      name: agent.name,
      email: agent.email,
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete agent by id 
exports.deleteAgent = async (req, res) => {
  const {id} = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Agent ID." });
  }

  try {
    const agentDeleted = await SalesAgent.findByIdAndDelete(id)
    if(!agentDeleted) {
      res.status(404).json({ error: `Agent with ID '${id}' not found.` })
    } else {
      res.status(200).json({ message: "Lead deleted successfully." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
