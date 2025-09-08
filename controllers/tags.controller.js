const Leads = require("../models/leads.model");
const Tags = require("../models/tag.model");

// ✅ Create and assign tags to a lead
/* exports.createTags = async (req, res) => {
  try {
    const { tags } = req.body;

    // ✅ Validate tags array
    if (!Array.isArray(tags) || tags.length === 0) {
      return res
        .status(400)
        .json({ error: "Tags should be a non-empty array of strings." });
    }

    const tagsId = [];

    // ✅ Process each tag
    for (let tagName of tags) {
      tagName = tagName.trim();
      if (!tagName) continue;

      let tag = await Tags.findOne({ name: tagName });

      // ✅ Create tag if it doesn't exist
      if (!tag) {
        tag = await Tags.create({ name: tagName });
      }

      tagsId.push(tag._id);
    }

    res.status(200).json({ tagIds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; */

exports.createTags = async (req, res) => {
  try {
    let tags = [];

    if (Array.isArray(req.body.tags)) {
      tags = req.body.tags;
    } else if (typeof req.body.name === "string") {
      tags = [req.body.name];
    } else {
      return res
        .status(400)
        .json({ error: "Provide either 'tags' (array) or 'name' (string)." });
    }

    const tagIds = [];

    for (let tagName of tags) {
      tagName = tagName.trim();
      if (!tagName) continue;

      let tag = await Tags.findOne({ name: tagName });

      if (!tag) {
        tag = await Tags.create({ name: tagName });
      }

      tagIds.push(tag._id);
    }

    res.status(200).json({ tagIds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Get all tags
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tags.find().sort({ createdAt: -1 });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign existing tags to a lead
exports.assignTagsToLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { tagIds = [], tagNames = [] } = req.body;

    const lead = await Leads.findById(id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Ensure lead.tags is initialized
    if (!Array.isArray(lead.tags)) {
      lead.tags = [];
    }

    let tagsToAssign = [];

    // Process tagIds
    if (Array.isArray(tagIds) && tagIds.length > 0) {
      const validTags = await Tags.find({ _id: { $in: tagIds } });
      tagsToAssign.push(...validTags.map(tag => String(tag._id)));
    }

    // Process tagNames
    if (Array.isArray(tagNames) && tagNames.length > 0) {
      const namedTags = await Tags.find({ name: { $in: tagNames } });
      tagsToAssign.push(...namedTags.map(tag => String(tag._id)));
    }

    // Merge and deduplicate
    tagsToAssign = [...new Set(tagsToAssign)];
    lead.tags = [...new Set([...lead.tags.map(String), ...tagsToAssign])];

    await lead.save();

    res.status(200).json({
      message: "Tags assigned to lead successfully.",
      lead,
    });
  } catch (error) {
    console.error("Error assigning tags to lead:", error);
    res.status(500).json({ error: "Failed to assign tags to lead." });
  }
};




//Get all leads by a tag
exports.getLeadsByTag = async (req, res) => {
  try {
    const { tag } = req.params;

    const leads = await Tags.findOne({ name: tag }).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
