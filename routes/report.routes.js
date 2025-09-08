const express = require('express')
const router = express.Router()
const { getLeadsClosedLastWeek, getTotalLeadsInPipeline, getTotalClosedLeads, closedLeadsByAgents } = require('../controllers/report.controller')

router.get('/report/last-week', getLeadsClosedLastWeek);
router.get('/report/pipeline', getTotalLeadsInPipeline);
router.get('/report/closed', getTotalClosedLeads);
router.get('/report/closed-by-agent', closedLeadsByAgents);

module.exports = router;