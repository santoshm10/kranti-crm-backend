const Comment = require("../models/comment.model");
const Lead = require("../models/leads.model");
const SalesAgent = require("../models/salesAgent.model");
const mongoose = require("mongoose");

// Add a comment to a lead
exports.addCommentToLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const { commentText, authorId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({ error: "Invalid lead ID format." });
    }

    if (!commentText || typeof commentText !== "string") {
      return res
        .status(400)
        .json({ error: "commentText is required and must be a string." });
    }

    const leadExists = await Lead.findById(leadId);
    if (!leadExists) {
      return res
        .status(404)
        .json({ error: `Lead with ID '${leadId}' not found.` });
    }

    const agent = await SalesAgent.findById(authorId);
    if (!agent) {
      return res.status(404).json({ error: "Sales agent not found." });
    }

    const comment = new Comment({
      lead: leadId,
      commentText,
      author: authorId,
    });

    const saved = await comment.save();

    res.status(201).json({
      id: saved._id,
      commentText: saved.commentText,
      author: agent.name,
      createdAt: saved.createdAt,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to add comment.", details: error.message });
  }
};

// Get all comments for a lead
exports.getCommentsForLead = async (req, res) => {
  try {
    const leadId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({ error: "Invalid lead ID format." });
    }

    const comments = await Comment.find({ lead: leadId })
      .populate("author", "name")
      .sort({ createdAt: -1 });

    const formatted = comments.map((c) => ({
      id: c._id,
      commentText: c.commentText,
      author: c.author.name,
      createdAt: c.createdAt,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch comments.", details: error.message });
  }
};
