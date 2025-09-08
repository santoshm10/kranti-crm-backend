const mongoose = require("mongoose");
const Lead = require("../models/leads.model");
const SalesAgent = require("../models/salesAgent.model");
const Tag = require("../models/tag.model");

const validStatuses = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Closed",
];
const validSources = [
  "Website",
  "Referral",
  "Cold Call",
  "Advertisement",
  "Email",
  "Other",
];
const validPriorities = ["High", "Medium", "Low"];

//create new lead

exports.createLead = async (req, res) => {
  const { name, source, salesAgent, status, tags, timeToClose, priority } =
    req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({
      error: "Invalid input: 'name' is required and must be a string.",
    });
  }

  if (!validSources.includes(source)) {
    return res.status(400).json({
      error:
        "Invalid input: 'source' must be one of " +
        JSON.stringify(validSources),
    });
  }

  if (!mongoose.Types.ObjectId.isValid(salesAgent)) {
    return res
      .status(400)
      .json({ error: "Invalid input: 'salesAgent' must be a valid ObjectId." });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error:
        "Invalid input: 'status' must be one of " +
        JSON.stringify(validStatuses),
    });
  }

  if (!Number.isInteger(timeToClose) || timeToClose <= 0) {
    return res
      .status(400)
      .json({ error: "'timeToClose' must be a positive integer." });
  }

  if (!validPriorities.includes(priority)) {
    return res.status(400).json({
      error: "'priority' must be one of " + JSON.stringify(validPriorities),
    });
  }

  const agent = await SalesAgent.findById(salesAgent);
  if (!agent) {
    return res
      .status(404)
      .json({ error: `Sales agent with ID '${salesAgent}' not found.` });
  }

  // Handle tag conversion
  let tagIds = [];
  if (tags && Array.isArray(tags)) {
    for (const tagName of tags) {
      let tag = await Tag.findOne({ name: tagName });

      if (!tag) {
        tag = await Tag.create({ name: tagName });
      }

      tagIds.push(tag._id);
    }
  } else if (tags) {
    return res
      .status(400)
      .json({ error: "'tags' must be an array of strings." });
  }

  try {
    const newLead = new Lead({
      name,
      source,
      salesAgent,
      status,
      tags: tagIds,
      timeToClose,
      priority,
    });

    await newLead.save();
    const populatedLead = await newLead.populate([
      { path: "salesAgent", select: "name" },
      { path: "tags", select: "name" },
    ]);

    res.status(201).json({ data: populatedLead });
  } catch (error) {
    console.error("Lead creation error:", error);
    res.status(500).json({ error: error.message });
  }
};

//get all leads (with filtering)

exports.getAllLeads = async (req, res) => {
  const { salesAgent, status, source, tags, search, sortBy, sortOrder } = req.query;
  let query = {};

  // Filter: Sales Agent
  if (salesAgent && mongoose.Types.ObjectId.isValid(salesAgent))
    query.salesAgent = salesAgent;

  // Filter: Status
  if (status && validStatuses.includes(status))
    query.status = status;

  // Filter: Source
  if (source && validSources.includes(source))
    query.source = source;

  // Filter: Tags
  const tagsArray = tags ? (Array.isArray(tags) ? tags : tags.split(",")) : [];
  if (tagsArray.length > 0) {
    const tagDocs = await Tag.find({ name: { $in: tagsArray } });
    const tagIds = tagDocs.map(tag => tag._id);
    query.tags = { $in: tagIds };
  }

  // Search by name
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  // Sorting
  const allowedSortFields = [
    "name",
    "source",
    "salesAgent",
    "status",
    "timeToClose",
    "priority",
    "createdAt",
    "updatedAt",
    "closedAt",
  ];

  let sort = {};
  if (sortBy && allowedSortFields.includes(sortBy)) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  }

  try {
    const leads = await Lead.find(query)
      .populate([
        { path: "salesAgent", select: "name" },
        { path: "tags", select: "name" },
      ])
      .sort(sort); // ✅ Sorting applied

    res.status(200).json(leads);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


//upade a lead

exports.updateLead = async (req, res) => {
  const { id } = req.params;
  const { name, source, salesAgent, status, tags, timeToClose, priority } =
    req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid Lead ID." });
  }

  if (!name || typeof name !== "string")
    return res.status(400).json({ error: "'name' is required." });
  if (!validSources.includes(source))
    return res.status(400).json({ error: "'source' must be valid." });
  if (!mongoose.Types.ObjectId.isValid(salesAgent))
    return res
      .status(400)
      .json({ error: "'salesAgent' must be valid ObjectId." });
  if (!validStatuses.includes(status))
    return res.status(400).json({ error: "'status' must be valid." });
  if (!Number.isInteger(timeToClose) || timeToClose <= 0)
    return res
      .status(400)
      .json({ error: "'timeToClose' must be positive integer." });
  if (!validPriorities.includes(priority))
    return res.status(400).json({ error: "'priority' must be valid." });

  const agent = await SalesAgent.findById(salesAgent);
  if (!agent) {
    return res
      .status(404)
      .json({ error: `Sales agent with ID '${salesAgent}' not found.` });
  }

  try {
    const leadUpdated = await Lead.findByIdAndUpdate(
      id,
      { name, source, salesAgent, status, tags, timeToClose, priority },
      { new: true, runValidators: true }
    );

    if (!leadUpdated)
      return res.status(404).json({ error: `Lead with ID '${id}' not found.` });

    const populatedLead = await leadUpdated.populate([
      { path: "salesAgent", select: "name" },
      { path: "tags", select: "name" },
    ]);

    res.status(200).json(populatedLead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//delete a lead

exports.deleteLead = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid Lead ID." });
  }

  try {
    const leadDeleted = await Lead.findByIdAndDelete(id);
    if (!leadDeleted) {
      return res.status(404).json({ error: `Lead with ID '${id}' not found.` });
    } else {
      res.status(200).json({ message: "Lead deleted successfully." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
