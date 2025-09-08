const Lead = require('../models/leads.model');

// ✅ Get leads closed in the last 7 days
exports.getLeadsClosedLastWeek = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const closedLeads = await Lead.find({
      status: "Closed",
      updatedAt: { $gte: oneWeekAgo }
    })
      .populate("salesAgent", "name")
      .sort({ updatedAt: -1 }); // ✅ sort by closure time

    const formatted = closedLeads.map(lead => ({
      id: lead._id,
      name: lead.name,
      salesAgent: lead.salesAgent?.name || "N/A",
      closedAt: lead.updatedAt // ✅ consistent with filter
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Get all closed leads 
exports.getTotalClosedLeads = async (req, res) => {
    try {
        const total = await Lead.countDocuments({status: "Closed"})
        res.status(200).json({totalClosedLeads: total})
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// ✅ Get total unclosed leads (in pipeline)
exports.getTotalLeadsInPipeline = async (req, res) => {
    try {
        const total = await Lead.countDocuments({ status: { $ne: "Closed" } });
        res.status(200).json({ totalLeadsInPipeline: total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /report/closed-by-agent
exports.closedLeadsByAgents = async (req, res) => {
  try {
    // 1. Get all leads that are closed
    const closedLeads = await Lead.find({ status: "Closed" }).populate("salesAgent", "name");

    // 2. Group by salesAgent using reduce
    const counts = closedLeads.reduce((acc, lead) => {
      const agentId = lead.salesAgent?._id?.toString();
      const agentName = lead.salesAgent?.name || "Unknown";

      if (agentId) {
        if (!acc[agentId]) {
          acc[agentId] = { agentId, agentName, closedCount: 0 };
        }
        acc[agentId].closedCount += 1;
      }
      return acc;
    }, {});

    // 3. Convert object to array
    const result = Object.values(counts);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

