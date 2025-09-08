const express = require('express')
const router = express.Router()
const { createAgent, getAllAgent} = require('../controllers/salesAgent.controller')

router.post('/agents', createAgent);
router.get('/agents', getAllAgent);

module.exports = router;