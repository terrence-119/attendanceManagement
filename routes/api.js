var express = require('express');
var router = express.Router();

// pool.js 読み込み
const pool = require('../db/pool');

function getCurrentDateTime() {
    const now = new Date();

    // 日付を取得
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    // 時間を取得
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // フォーマットされた日付と時間を返す
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 従業員の一覧取得
 */
router.get('/employees', function(req, res, next) {
    // SELECT
    pool.query('SELECT * FROM employees', function(error, results) {
        // エラーの場合
        if (error) {
            res.status(500).json({
                status: '500 Interval Server Error',
                error: error,
            })
        }

        // 正常なら取得したデータを返却
        res.status(200).json({
            data: results.rows
        });
    });
});

/**
 * 従業員の登録
 */
router.post('/employees', function (req, res, next) {
    // bodyからnameを取得
    const { name } = req.body.employee;

    // nameを引数にして登録
    pool.query('INSERT INTO employees (name) VALUES ($1)', [name], function(error, results) {
        if (error) {
            throw error;
        }

        // 登録完了時
        res.status(201).json({
            status: 'success',
        });
    })
});

/**
 * 従業員の編集
 */
router.put('/employees/:id', function (req, res, next) {
    // クエリパラメータからidを取得
    const { id } = req.params;

    // bodyからnameを取得
    const { name } = req.body.employee;

    const q = "UPDATE employees SET name = $1 WHERE employee_id = $2";
    // データベースを更新する
    pool.query(q, [name, id], function (error, results) {
        if (error) {
            res.status(500).json({
                status: '500 Internal Server Error',
                error: error,
            })
        }
        console.log(results);
        if (results.rowCount === 0) {
            // 更新するデータがなかった場合
            res.status(400).json({
                status: '400 Bad Request',
                message: 'データが存在しません。'
            })
        } else {
            // 更新できたらsuccessを返却
            res.status(200).json({
                status: 'success',
            })
        }
    })
})

/**
 * 従業員の削除
 */
router.delete('/employees/:id', function (req, res, next) {
    // parameterからidを取得
    const id = req.params;

    const q = "DELETE FROM employees WHERE employee_id = $1";

    // データベースから削除する
    pool.query(q, [id], function (error, results) {
        if (error) {
            res.status(500).json({
                status: '500 Interval Server Error',
                message: error,
            })
        }

        if (results.rowCount === 0) {
            res.status(400).json({
                status: '400 Bad Request',
                message: 'データが存在しません。',
            })
        } else {
            // 削除できたらsuccessを返却
            res.status(200).json({
                status: 'success',
            })
        }
    })
})

/**
 * トップページ（当日の出退勤レコード）を取得
 */
router.get('/attendances', function(req, res, next) {
    const q = "SELECT A.emp_id, E.name, A.in_time, A.out_time, A.sum_time, A.status, A.detail FROM employees AS E INNER JOIN attendances AS A ON A.emp_id = E.employee_id WHERE A.date = CURRENT_DATE";

    pool.query(q, function (error, results) {
        // エラー
        if (error) {
            res.status(500).json({
                status: '500 Interval Server Error',
                error: error,
            })
        }
        if (!results) {
            res.status(404).json({
                // メッセエージを画面に表示
                status: '404 Not Found',
                message: 'データが見つかりません。'
            });
        }
        // 正常なら取得したデータを返却
        res.status(200).json({
            data: results.rows,
        })
    })
})

/**
 * 選択した月の全従業員の出退勤データ
 */
//TODO


/**
 * 選択した従業員の全出退勤データを取得
 */
router.get('/attendances/:id', function (req, res, next) {
    // クエリパラメータを取得
    const { id } = req.params;

    const q = "SELECT E.name, A.date, A.in_time, A.out_time, A.sum_time, A.detail FROM employees AS E INNER JOIN attendances AS A ON A.emp_id = E.employee_id WHERE A.emp_id = $1"
    // データベースから取得
    pool.query(q, [id], function (error, results) {
        // エラー
        if (error) {
            res.status(500).json({
                status: '500 Interval Server Error',
                error: error,
            })
        }

        // 正常なら取得したデータを返却
        res.status(200).json({
            data: results.rows
        })
        /**
         * フロントエンド側でdata.nameで名前だけ取り出せるかもしれない
         * 名前は一度だけ取り出す。そしてページトップに使用する。表示するのは名前以外のin_time, out_time, sum_time, detailのみ
         */
    })
})

/**
 * 出勤登録
 */
router.post('/attendances/updates', function (req, res, next) {
    const { id, detail } = req.body.attendance

    const in_time = getCurrentDateTime();

    const q = "INSERT INTO attendances (emp_id, in_time, status, detail) VALUES ($1, $2, '勤務中', $3)";

    // データベースに登録
    pool.query(q, [id, in_time, detail], function (error, results) {
        if (error) {
            res.status(500).json({
                status: '500 Internal Serval Error',
                error: error,
            })
        }
        // 登録完了時successを返却
        res.status(201).json({
            status: 'success',
        })
    },
    )
})

/**
 * 退勤登録
 */
router.put('/attendances/updates', function (req, res, next) {
    //bodyからout_time, current_timestamp, detailを取得
    const { id, detail } = req.body.attendance;

    const out_time = getCurrentDateTime();
    const current_timestamp = getCurrentDateTime();

    const q = "UPDATE attendances SET out_time = $1, sum_time = ($2 - in_time), status = '退勤', detail = $3 WHERE emp_id = $4 AND date = CURRENT_DATE";
    // データベースを更新する
    pool.query(q, [out_time, current_timestamp, detail, id], function (error, results) {
        if (error) {
            res.status(500).json({
                status: '500 Interval Server Error',
                error: error,
            })
        }
        console.log(results);
        if (results.rowCount === 0) {
            // 更新するデータがなかった場合
            res.status(400).json({
                status: '400 Bad Request',
                message: 'データが存在しません。',
            })
        } else {
            // 更新できたらsuccessを返却
            res.status(200).json({
                status: 'success',
            })
        }
    })
})



module.exports = router;