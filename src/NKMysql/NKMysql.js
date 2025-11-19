let NKMysql = {};

if ( NK.node ) NKMysql.connect = function( db_name, host = "localhost", user = "root", pass = "" ) {
    
    return new Promise((resolve, reject) => {

        const mysql = require('mysql2');
        let conn = mysql.createConnection({host: host, user: user, password: pass, database: db_name});

        conn.connect((err) => {
            if (err) return reject('Error al conectar con la base de datos: ' + err);
            resolve(conn);
        });

    });

}

if ( NK.node ) NKMysql.query = function( conn, sql, params = [] ) {
    return new Promise((resolve, reject) => {
        conn.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}


if ( NK.node ) NKMysql.insert = function( conn, table_name, data ) {
    return NKMysql.query( conn, `INSERT INTO ?? SET ?`, [table_name, data] );
};


if ( NK.node ) NKMysql.update = function( conn, table_name, data_where, data_set ) {
    const mysql = require('mysql2');
    
    const sql = "UPDATE " + table_name +
    " SET " + Object.keys(data_set).map(k => k + "=" + mysql.escape(data_set[k])).join(", ") +
    " WHERE " + Object.keys(data_where).map(k => k + "=" + mysql.escape(data_where[k])).join(" AND ");

    return NKMysql.query( conn, sql );
};


if ( NK.node ) NKMysql.truncate = function( conn, table_name ) {
    return NKMysql.query( conn, `TRUNCATE TABLE ??`, [table_name] );
};


//Node integration
if ( NK.node ) Object.assign(module.exports, { NKMysql });