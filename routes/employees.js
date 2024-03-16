var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('sync-request');

/** GET 従業員一覧 */
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/employee_management.html'));
})

router.get('/info', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/employeeinfo.html'));
})

module.exports = router;