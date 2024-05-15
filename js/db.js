import * as mysql from "mysql";

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "files-db"
});
export async function connectToDB(){
    try{
        con.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");
            // var sql = "CREATE TABLE customers (name VARCHAR(255), address VARCHAR(255))";
            // con.query(sql, function (err, result) {
            //     if (err) throw err;
            //     console.log("Table created");
            // });
            // var name = "text.txt"
            // var url = "https://aws.com/ifbgijsadbfpi"
            // var sql1 = "INSERT INTO `files`(name, url) "+"VALUES ('"+name+"', '"+url+"');"
            // con.query(sql1, function (err, result) {
            //     if (err) throw err;
            //     console.log("record added id:"+result.insertId);
            // });
        });
    }catch (err) {
        console.error("Error:"+err)
    }
}


export async function insertIntoDB(filedata) {
    const name = filedata.filename;
    const url = filedata.url;
    const sql = "INSERT INTO `files`(name, url) " + "VALUES ('" + name + "', '" + url + "');";

    return new Promise((resolve, reject) => {
        con.query(sql, function (err, result) {
            if (err) reject(err);
            console.log("record added id:" + result.insertId);
            resolve({ id: result.insertId, filename: name, url: url });
        });
    });
}


export async function editInDB(filedata) {
    const id = filedata.id;
    // console.log(id);
    const name = filedata.filename+"modified";
    const url = filedata.url;
    const sql = "UPDATE `files` SET name ='" + name + "', url = '" + url + "' WHERE id = " + id + ";";
    return new Promise((resolve, reject) => {
        con.query(sql, function (err, result) {
            if (err) reject(err);
            console.log("record modified id:" + id);
            resolve({ id: id, filename: name, url: url });
        });
    });
}

export async function deleteInDB(filedata) {
    const id = filedata.id;
    const name = filedata.filename;
    const url = filedata.url;
    const sql = "DELETE FROM `files` WHERE id = " + id + ";";
    return new Promise((resolve, reject) => {
        con.query(sql, function (err, result) {
            if (err) reject(err);
            console.log("deleted id:" + id);
            resolve({ id: id, filename: name, url: url });
        });
    });
}


async function tests(){
    const filedata = await insertIntoDB({filename: "text.txt", url: "https://aws.com/ifbgijsadbfpi"});
    console.log(filedata);
    const newFileData = await editInDB(filedata);
    console.log(newFileData);
    const deletedData = await deleteInDB(newFileData)
    console.log(deletedData)

}

// connectToDB();
// tests();