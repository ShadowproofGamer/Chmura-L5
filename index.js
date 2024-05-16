const express = require('express');
const multer = require('multer');
const app = express();
const cors = require('cors');

// AWS S3 config
const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const fs = require("fs");
let bucketName = `file-bucket-pwr266886`;

//config mysql
const mysql = require("mysql")
const con = mysql.createConnection({
    host: "localhost", user: "root", password: "", database: "files-db"
});
try {
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
} catch (err) {
    console.error("Error:" + err)
}

// Konfiguracja Multer
const storage = multer.memoryStorage();
const upload = multer({storage: storage});
//{ dest: './uploads' }

//Konfiguracja cors
app.use(cors({
    origin: 'http://localhost:63342' // Replace with your frontend origin
}));






// endpoint for uploading the file
app.post('/upload', upload.single('file'), async (req, res) => {
    console.log("post wykonany ");
    // console.log(req.body);
    // console.log(req.file);
    // console.log(req.file.originalname);
    if (req.file) {
        try {
            const data = await sendData(req.file);
            console.log("success ");
            console.log(req.file);
            // testRetrieve(data.id);  // You can call testRetrieve here with the data
            return res.status(200).json({message: 'Plik przesłany pomyślnie', data});

        } catch (err) {
            console.error("error: ", err);
            return res.status(500).json({message: 'Błąd przesyłania pliku'});
        }
    } else {
        console.log("must include file!");
        res.status(400).json({message: 'Błąd! Wyślij plik ponownie'});
    }
});

//endpoint for deleting the file
app.get('/delete/:id', async (req, res) => {
    console.log("del wykonywany ");
    // console.log(req.params);
    if (req.params.id) {
        try {
            const data = await deleteData(req.params.id);
            console.log("success ");
            // testRetrieve(data.id);  // You can call testRetrieve here with the data
            return res.status(200).json({message: 'Plik usunięty pomyślnie', data: data});

        } catch (err) {
            console.error("error: ", err);
            return res.status(500).json({message: 'Błąd przesyłania pliku'});
        }
    } else {
        console.log("must include file!");
        res.status(400).json({message: 'Błąd! Wyślij plik ponownie'});
    }
});

//endpoint for updating the file
app.get('/update/:id/:newName', async (req, res) => {
    console.log("del wykonywany ");
    // console.log(req.params);
    if (req.params.id && req.params.newName) {
        try {
            const data = await updateData(req.params.id, req.params.newName);
            console.log("success ");
            // testRetrieve(data.id);  // You can call testRetrieve here with the data
            return res.status(200).json({message: 'Plik zmodyfikowany pomyślnie', data: data});

        } catch (err) {
            console.error("error: ", err);
            return res.status(500).json({message: 'Błąd modyfikacji pliku'});
        }
    } else {
        console.log("wrong format!");
        res.status(400).json({message: 'Błąd! Wyślij plik ponownie'});
    }
});

//endpoint for getting the filedata from backend/s3
app.get('/getFile/:id', async (req, res) => {
    console.log("getFile wykonywany ");
    // console.log(req.params);
    if (req.params.id) {
        try {
            const data = await fileDownload(req.params.id);
            console.log(data);
            // testRetrieve(data.id);  // You can call testRetrieve here with the data
            return res.status(200).json({message: 'Plik pobrany pomyślnie', data: data});

        } catch (err) {
            console.error("error: ", err);
            return res.status(500).json({message: 'Błąd modyfikacji pliku'});
        }
    } else {
        console.log("wrong format!");
        res.status(400).json({message: 'Błąd! Wyślij plik ponownie'});
    }
});

app.get('/getAllFiles', async (req, res) => {
    console.log("getFile wykonywany ");
    // console.log(req.params);
    if (req.params.id) {
        try {
            const data = await getAllItems();
            console.log(data);
            return res.status(200).json({message: 'Plik pobrany pomyślnie', data: data});

        } catch (err) {
            console.error("error: ", err);
            return res.status(500).json({message: 'Błąd modyfikacji pliku'});
        }
    } else {
        console.log("wrong format!");
        res.status(400).json({message: 'Błąd! Wyślij plik ponownie'});
    }
});


async function sendData(filedata) {
    const params = {
        Bucket: bucketName, Key: filedata.originalname, Body: filedata.buffer
    };
    console.log(params);

    try {
        const {Location} = await S3.upload(params).promise(); // Use promise() for async/await

        const sql = `INSERT INTO files(name, url)
                     VALUES ('${filedata.originalname}', '${Location}');`;

        return await new Promise((resolve, reject) => {
            con.query(sql, function (err, result) {
                if (err) reject(err);
                console.log("record added id:" + result.insertId);
                resolve({id: result.insertId, filename: filedata.originalname, url: Location});
            });
        });
    } catch (err) {
        console.error('Error:', err);
        // You can also throw the error to be handled by the caller.
        // throw err;
    }
}


async function deleteData(id) {
    const sql = "SELECT * FROM `files` WHERE id = " + id;

    const params = {
        Bucket: bucketName, Key: await new Promise((resolve, reject) => {
            con.query(sql, function (err, result) {
                if (err) reject(err);
                console.log(result[0]);
                resolve(result[0].name);
            });
        }),
    };
    console.log(params);


    try {
        await S3.deleteObject(params).promise(); // Use promise() for async/await
        const sql = "DELETE FROM `files` WHERE id = " + id + ";";
        return new Promise((resolve, reject) => {
            con.query(sql, function (err, result) {
                if (err) reject(err);
                console.log(result);
                console.log("deleted id:" + id);
                resolve(id);
            });
        });

    } catch (err) {
        console.error('Error:', err);
    }
}


async function updateData(id, newName) {
    const sql = "SELECT * FROM `files` WHERE id = " + id;

    const params = {
        Bucket: bucketName, Key: await new Promise((resolve, reject) => {
            con.query(sql, function (err, result) {
                if (err) reject(err);
                console.log(result[0]);
                resolve(result[0].name);
            });
        }),
    };
    console.log(params);
    const databuffer = await S3.getObject(params).promise();
    console.log(databuffer.Body);

    try {
        await S3.deleteObject(params).promise(); // Use promise() for async/await

        const params2 = {
            Bucket: bucketName, Key: newName, Body: databuffer.Body
        };

        const {Location} = await S3.upload(params2).promise(); // Use promise() for async/await

        const sql2 = `UPDATE files
                      SET name='${newName}',
                          url='${Location}'
                      WHERE id = ${id}`;
        // const sql3 = `INSERT INTO files(name, url) VALUES ('${newName}', '${Location}');`;

        return await new Promise((resolve, reject) => {
            con.query(sql2, function (err, result) {
                if (err) reject(err);
                console.log("record updated id:" + result.updateId);
                resolve({id: result.updateId, filename: newName, url: Location});
            });
        });
    } catch (err) {
        console.error('Error:', err);
        // You can also throw the error to be handled by the caller.
        // throw err;
    }
}

async function fileDownload(id) {
    const sql = "SELECT * FROM `files` WHERE id = " + id;
    const filedata = await new Promise((resolve, reject) => {
        con.query(sql, function (err, result) {
            if (err) reject(err);
            console.log("retrieve:")
            console.log(result[0]);
            resolve(result[0]);
        });
    });

    // const databuffer = filedata.url;
    const params = {
        Bucket: bucketName, Key: filedata.name
    }
    console.log()
    console.log(params);
    const databuffer = await S3.getObject(params).promise();
    //res.attach
    //res.type
    //res.data
    console.log(databuffer);
    return databuffer;
}

async function getAllItems(){
    const sql = "SELECT * FROM `files`";
    const [results] = await new Promise((resolve, reject) => {
        con.query(sql, function (err, result) {
            if (err) reject(err);
            console.log("retrieve:")
            console.log(result);
            resolve(result);
        });
    });
    return results.map(file => ({
        id: file.id,
        filename: file.name
    }));
}

app.listen(3000, () => console.log('Serwer uruchomiony na porcie 3000'));