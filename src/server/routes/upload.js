var express = require('express'),
    fs = require('fs'),
    path = require('path');

var router = express.Router();

router.post('/sb', function (req, res) {
    var fstream;

    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);

        var extName = path.extname(filename),
            baseName = path.basename(filename, extName),
            newFileName = baseName + "_" + Math.random() + extName,
            baseDirectory = '/..//public//files//uploaded_files//',
            targetDirectory = path.join(__dirname + baseDirectory + 'sb//'),
            sFullPath = targetDirectory + newFileName;


        if (!fs.exists(targetDirectory)) {
            fs.mkdir(targetDirectory, 0777, function (err) {
                if (err) {
                    if (err.code == 'EEXIST') {
                        console.log("Klasör mevcut");
                    }
                    else {
                        console.log("Klasör oluşturamadım");
                    }
                } else {
                    console.log("Klasör oluştu.");
                }
            });
        }

        fstream = fs.createWriteStream(sFullPath);
        file.pipe(fstream);
        fstream.on('close', function () {
            res.json({Adres: sFullPath, Adi: newFileName});
        });
    });

});


var f_dirname = function () {
    return __dirname.substr(0, __dirname.length - 13);
};

/**
 * İhaleye ait dosyaları getirir
 * @param _ihale_id
 * @returns {Array}
 */
function f_ihaleDosyalari(_ihale_id) {

    var baseDirectory = '/public/files/uploaded_files/',
        targetDirectory = path.join(f_dirname() + baseDirectory + 'ihale/' + _ihale_id + '/'),
        dosyalar = [];
    console.log("targetDirectory");
    console.log(targetDirectory);

    if (fs.existsSync(targetDirectory)) {
        var dizinDosyalari = fs.readdirSync(targetDirectory);

        dizinDosyalari.forEach(function (dosya) {
            dosyalar.push({
                Adres: "/files/uploaded_files/ihale/" + _ihale_id + "/" + dosya,
                Adi: dosya
            });
        });
    } else {
        console.log("Klasör bulunamadı!")
    }
    console.log(JSON.stringify(dosyalar));
    return dosyalar;
}

/**
 * İhale kalemine ait dosyaları getirir.
 * @param {int} _ihale_id
 * @param {int} _kalem_id
 * @returns {Array}
 */
function f_ihaleKalemDosyalari(_ihale_id, _kalem_id) {

    var baseDirectory = '/public/files/uploaded_files/',
        targetDirectory = path.join(f_dirname() + baseDirectory + '/kalem/' + _kalem_id + '/'),
        dosyalar = [];

    if (fs.existsSync(targetDirectory)) {
        var dizinDosyalari = fs.readdirSync(targetDirectory);
        dizinDosyalari.forEach(function (dosya) {
            dosyalar.push(
                {
                    Adres: "/files/uploaded_files/kalem/" + _kalem_id + "/" + dosya,
                    Adi: dosya
                });
        });
    } else {
        console.log("Klasör bulunamadı!")
    }
    return dosyalar;
}

function f_klasorYoksaOlustur(targetDirectory) {
    console.log(targetDirectory);
    if (!fs.exists(targetDirectory)) {
        fs.mkdir(targetDirectory, 0777, function (err) {
            if (err) {
                if (err.code == 'EEXIST') {
                    console.log("Klasör mevcut");
                }
                else {
                    console.log("Klasör oluşturamadım");
                }
            } else {
                console.log("Başardım...!Klasör oluştu.");
            }
        });
    }
}

//İHALEYE BELGE EKLE/SİL/GÖRÜNTÜLE
router.route('/ihaleler/:Ihale_Id/:silinecekDosya')
    .all(function (req, res, next) {
        if (req.params.Ihale_Id) {
            next();
        } else {
            res.send(410, "{\"message\":\"Ihale_Id bulunamadı!\"}");
        }
    })
    .delete(function (req, res) {
        console.log("dosyayı sil");
        var ihale_id = req.params.Ihale_Id,
            dosya = req.params.silinecekDosya;

        var baseDirectory = '/public/files/uploaded_files/',
            targetDirectory = path.join(f_dirname() + baseDirectory + 'ihale/' + ihale_id + '/'),
            sFullPath = targetDirectory + dosya;

        if (!fs.existsSync(targetDirectory)) {
            console.log("Klasör bulunamadı.");
            res.send("Klasör bulunamadı.");

        } else {

            fs.unlinkSync(sFullPath);
            res.send("İhaleye ait dosya Başarıyla silindi.");
        }
    });

router.route('/ihaleler/:Ihale_Id')
    .all(function (req, res, next) {
        if (req.params.Ihale_Id) {
            next();
        } else {
            res.send(410, "{\"message\":\"Ihale_Id bulunamadı!\"}");
        }
    })
    .get(function (req, res) {
        var ihale_id = req.params.Ihale_Id;
        res.json(f_ihaleDosyalari(ihale_id));
    })
    .post(function (req, res) {

        var fstream,
            ihale_id = req.params.Ihale_Id;

        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            var extName = path.extname(filename),
                baseName = path.basename(filename, extName),
                newFileName = baseName + "_" + (new Date()).getTime() + extName,
                baseDirectory = '/public//files/uploaded_files/',
                targetDirectory = path.join(f_dirname() + baseDirectory + 'ihale/' + ihale_id + '/'),
                sFullPath = targetDirectory + newFileName;

            f_klasorYoksaOlustur(targetDirectory);

            fstream = fs.createWriteStream(sFullPath);
            file.pipe(fstream);
            fstream.on('close', function () {
                res.json(f_ihaleDosyalari(ihale_id))
            });
        });
    });


//KALEME BELGE EKLE/SİL/GÖRÜNTÜLE
router.route('/ihaleler/:Ihale_Id/kalemler/:Kalem_Id/:silinecekDosya')
    .all(function (req, res, next) {
        if (req.params.Ihale_Id && req.params.Kalem_Id) {
            next();
        } else {
            res.send(410, "{\"message\":\"Ihale ve Kalem Id bulunamadı!\"}");
        }
    })
    .delete(function (req, res) {
        console.log("kaleme ait dosyayı sil");
        var ihale_id = req.params.Ihale_Id,
            kalem_id = req.params.Kalem_Id,
            dosya = req.params.silinecekDosya;

        var baseDirectory = '/public/files/uploaded_files/',
            targetDirectory = path.join(f_dirname() + baseDirectory + '//kalem/' + kalem_id + '/'),
            sFullPath = targetDirectory + dosya;

        if (!fs.existsSync(targetDirectory)) {
            console.log("Klasör bulunamadı.");
            res.send("Klasör bulunamadı.");

        } else {
            fs.unlinkSync(sFullPath);
            res.send("Kaleme ait dosya Başarıyla silindi.");
        }
    });

router.route('/ihaleler/:Ihale_Id/kalemler/:Kalem_Id')
    .all(function (req, res, next) {
        if (req.params.Ihale_Id && req.params.Kalem_Id) {
            next();
        } else {
            res.send(410, "{\"message\":\"Ihale ve Kalem Id bulunamadı!\"}");
        }
    })
    .get(function (req, res) {
        var ihale_id = req.params.Ihale_Id,
            kalem_id = req.params.Kalem_Id;

        res.json(f_ihaleKalemDosyalari(ihale_id, kalem_id));
    })
    .post(function (req, res) {

        var fstream,
            ihale_id = req.params.Ihale_Id,
            kalem_id = req.params.Kalem_Id;

        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            var extName = path.extname(filename),
                baseName = path.basename(filename, extName),
                newFileName = baseName + "_" + (new Date()).getTime() + extName,
                baseDirectory = '/public/files/uploaded_files/',
                targetDirectory = path.join(f_dirname() + baseDirectory + 'kalem/' + kalem_id + '/'),
                sFullPath = targetDirectory + newFileName;

            f_klasorYoksaOlustur(targetDirectory);


            fstream = fs.createWriteStream(sFullPath);
            file.pipe(fstream);
            fstream.on('close', function () {
                res.json(f_ihaleKalemDosyalari(ihale_id, kalem_id))
            });

        });
    });

module.exports = router;