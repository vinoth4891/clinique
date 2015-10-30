define(["framework/WidgetWithTemplate"], function() {
    Clazz.createPackage("com.js.offlineStorage");
    Clazz.com.js.offlineStorage = Clazz.extend(Clazz.WidgetWithTemplate, {
        DBName: "moodle_localDB",
        version: "1.0",
        displayName: "MoodleLocalDB",
        maxSize: 5 * 1024 * 1024,
        dataBase: null,
        initialize: function() {
            if (this.isDevice()) {
                this.createDB();
            }
        },
        createDB: function() {
            if (!window.openDatabase) {
                //console.log("Woops, your browser doesn't support Database. Please update/change your browser");
            } else {
                this.dataBase = window.openDatabase(this.DBName, this.version, this.displayName, this.maxSize);
                this.createTable();
            }
        },
        createTable: function() {
            var loginTable = "CREATE TABLE IF NOT EXISTS user_account(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
            "username VARCHAR(100) NOT NULL, password VARCHAR(20) NOT NULL, ref_data VARCHAR(255) NOT NULL default '', added_on DATETIME)";
            var componentTable = "CREATE TABLE IF NOT EXISTS comp_tbl (comp_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, uid INTEGER NOT NULL, component_name VARCHAR(255) NOT NULL default '',ref_data VARCHAR(255) NOT NULL default '', added_on DATETIME)";
            var playerTbl = "CREATE TABLE IF NOT EXISTS player_tbl (player_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, course_id INTEGER NOT NULL, uid INTEGER NOT NULL, ref_data VARCHAR(255) NOT NULL default '', added_on DATETIME)";
            var resrc_news_Tbl = "CREATE TABLE IF NOT EXISTS resrc_news_tbl (resource_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, course_id INTEGER NOT NULL, uid INTEGER NOT NULL, component_name VARCHAR(255) NOT NULL default '', ref_data VARCHAR(255) NOT NULL default '', added_on DATETIME)";
            var courseItemTbl = "CREATE TABLE IF NOT EXISTS courseitem_tbl (courseitem_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, course_id INTEGER NOT NULL, uid INTEGER NOT NULL, ref_data VARCHAR(255) NOT NULL default '', added_on DATETIME)";
            this.executeQuery(loginTable);
            this.executeQuery(componentTable);
            this.executeQuery(playerTbl);
            this.executeQuery(resrc_news_Tbl);
            this.executeQuery(courseItemTbl);
        },
        executeQuery: function(tableQuery) {
            var db = this.dataBase, self = this;
            db.transaction(function(tx) {
                tx.executeSql((tableQuery), [],
                    function(txs, results) {
                        //console.log("table created successfully");
                    },
                    function(txe, error) {
                        //console.info(error);
                    });
            });
        },
        insertRecord: function(userName, password) {
            var db = this.dataBase, self = this;
            if (db !== null) {
                db.transaction(function(tx) {
                    var addedOn = new Date();
                    password = window.btoa(password); /* encode a string */
                    tx.executeSql("INSERT INTO user_account(username, password, added_on) VALUES (?,?,?)",
                        [userName, password, addedOn], self.onSuccess, self.onError);
                });
            }
        },
        insertRecords: function(userName, password, refData) {
            var db = this.dataBase, self = this;
            if (db !== null) {
                db.transaction(function(tx) {
                    var addedOn = new Date();
                    var userDet = JSON.parse(window.localStorage.getItem("USER"));
                    isData = 0;
                    tx.executeSql("SELECT * FROM user_account WHERE username = ? AND password = ?",
                        [userName, password],
                        function (tx, results){
                            isData = results.rows.length;
                            if(isData == 0){
                                tx.executeSql("INSERT INTO user_account(username, password, ref_data, added_on) VALUES (?,?,?,?)",
                                    [userName, password, refData, addedOn], self.onSuccess, self.onError);
                            }else{
                                tx.executeSql("UPDATE user_account SET ref_data = ?, added_on = ? WHERE username = ? AND password = ?",
                                    [refData, addedOn, userName, password], self.onSuccess, self.onError);
                            }
                        }, function (tx, results){
                            ci('Select Error ' + results.message);
                        });
                });
            }
        },
        getRecords: function(query, arg, results) {
            var db = this.dataBase, self = this;
            if (db !== null) {
                db.transaction(function(tx) {
                    tx.executeSql((query), arg, results, self.onError);
                });
            }
        },
        deleteTable: function(tableName) {
            var db = this.dataBase, self = this;
            if (db !== null) {
                db.transaction(function(tx) {
                    tx.executeSql(("DELETE * FROM " + tableName), [], self.onSuccess, self.onError);
                });
            }
        },
        deleteRecords: function(query, arg) {
            query = "DELETE FROM user_account WHERE email=?";
            arg = ["test@test.com"];
            var db = this.dataBase, self = this;
            if (db !== null) {
                db.transaction(function(tx) {
                    tx.executeSql((query), arg, self.onSuccess, self.onError);
                });
            }
        },
        onError: function(tx, er) {
            //console.info("There has been an error: " + er.message);
        },
        onSuccess: function(tx, r) {
            //console.log("Inserted successfully");
        },
        getComp: function (compName){
            var db = this.dataBase, self = this;
            if (db !== null) {
                db.transaction(function(tx) {
                    var userDet = JSON.parse(window.localStorage.getItem("USER"));
                    tx.executeSql("SELECT ref_data FROM comp_tbl WHERE component_name=? AND uid=?",
                        [compName, userDet.id],
                        function (tx, results){
                            localStorage["transferData"] = '0';
                            if(results.rows.length > 0){
                                var resData = results.rows.item(0);
                                localStorage["transferData"] = resData.ref_data;
                            }
                        }, function (tx, results){
                            ci('Select Error ' + results.message);
                        });
                });
            }
        },
        insertComp: function(compName, refData) {
            var db = this.dataBase, self = this;
            if (db !== null) {
                db.transaction(function(tx) {
                    var addedOn = new Date();
                    var userDet = JSON.parse(window.localStorage.getItem("USER"));
                    isData = 0;
                    tx.executeSql("SELECT * FROM comp_tbl WHERE component_name=? AND uid=?",
                        [compName, userDet.id],
                        function (tx, results){
                            isData = results.rows.length;
                            if(isData == 0){
                                tx.executeSql("INSERT INTO comp_tbl(uid, component_name, ref_data, added_on) VALUES (?,?,?,?)",
                                    [userDet.id, compName, refData, addedOn], self.onSuccess, self.onError);
                            }else{
                                tx.executeSql("UPDATE comp_tbl SET ref_data = ?, added_on = ? WHERE component_name = ? AND uid=?",
                                    [refData, addedOn, compName, userDet.id], self.onSuccess, self.onError);
                            }
                        }, function (tx, results){
                            ci('Select Error ' + results.message);
                        });
                });
            }
        },
        insertPlayers: function(courseId, refData) {
            var db = this.dataBase, self = this;
            if (db !== null) {
                db.transaction(function(tx) {
                    var addedOn = new Date();
                    var userDet = JSON.parse(window.localStorage.getItem("USER"));
                    tx.executeSql("SELECT * FROM player_tbl WHERE course_id=? AND uid=?",
                        [courseId, userDet.id],
                        function (tx, results){
                            isData = results.rows.length;
                            if(isData == 0){
                                tx.executeSql("INSERT INTO player_tbl(course_id, uid, ref_data, added_on) VALUES (?,?,?,?)",
                                    [courseId, userDet.id, refData, addedOn], self.onSuccess, self.onError);
                            }else{
                                tx.executeSql("UPDATE player_tbl SET ref_data = ?, added_on = ? WHERE course_id = ? AND uid=?",
                                    [refData, addedOn, courseId, userDet.id], self.onSuccess, self.onError);
                            }
                        }, function (tx, results){
                            ci('Select Error ' + results.message);
                        });
                });
            }
        },
        getPlayerCourse: function (courseId){
            var db = this.dataBase, self = this;
            if (db !== null) {
                db.transaction(function(tx) {
                    var userDet = JSON.parse(window.localStorage.getItem("USER"));
                    tx.executeSql("SELECT ref_data FROM player_tbl WHERE course_id=? AND uid=?",
                        [courseId, userDet.id],
                        function (tx, results){
                            localStorage["transferData1"] = '0';
                            if(results.rows.length > 0){
                                var resData = results.rows.item(0);
                                localStorage["transferData1"] = resData.ref_data;
                            }
                        }, function (tx, results){
                            ci('Select Error ' + results.message);
                        });
                });
            }
        },
        insertResource: function(courseId, refData, compName) {
            var db = this.dataBase, self = this;
            if (db !== null) {
                db.transaction(function(tx) {
                    var addedOn = new Date();
                    var userDet = JSON.parse(window.localStorage.getItem("USER"));
                    tx.executeSql("INSERT INTO resrc_news_tbl(course_id, uid, component_name, ref_data, added_on) VALUES (?,?,?,?,?)",
                        [courseId, userDet.id, compName, refData, addedOn], self.onSuccess, self.onError);
                });
            }
        },
        getResourceCourse: function (compName){
            var db = this.dataBase, self = this;
            if (db !== null) {
                db.transaction(function(tx) {
                    var userDet = JSON.parse(window.localStorage.getItem("USER"));
                    tx.executeSql("SELECT ref_data FROM resrc_news_tbl WHERE uid = ? AND component_name = ?",
                        [userDet.id, compName],
                        function (tx, results){
                            var resData = '', eachData;
                            jQuery(".res_hid_data").empty();
                            for(var chin = 0; chin < results.rows.length; chin++){
                                eachData = results.rows.item(chin);
                                jQuery(".res_hid_data").append("<input type='hidden' value='"+ eachData.ref_data +"' />");
                            }
                        }, function (tx, results){
                            ci('Select Error ' + results.message);
                        });
                });
            }
        },
        deleteResource: function(compName) {
            var db = this.dataBase, self = this;
            if (db !== null) {
                var userDet = JSON.parse(window.localStorage.getItem("USER"));
                db.transaction(function(tx) {
                    tx.executeSql(("DELETE FROM resrc_news_tbl where uid = ? AND component_name = ?"), [userDet.id, compName], self.onSuccess, self.onError);
                });
            }
        },
        insertCourseItems: function (courseId, refData){
            var db = this.dataBase, self = this;
            if (db !== null) {
                db.transaction(function(tx) {
                    var addedOn = new Date();
                    var userDet = JSON.parse(window.localStorage.getItem("USER"));
                    tx.executeSql("SELECT * FROM courseitem_tbl WHERE course_id=? AND uid=?",
                            [courseId, userDet.id],
                            function (tx, results){
                                isData = results.rows.length;
                                if(isData == 0){
                                    tx.executeSql("INSERT INTO courseitem_tbl(course_id, uid, ref_data, added_on) VALUES (?,?,?,?)",
                                    [courseId, userDet.id, refData, addedOn], self.onSuccess, self.onError);
                                }else{
                                    tx.executeSql("UPDATE courseitem_tbl SET ref_data = ?, added_on = ? WHERE course_id = ? AND uid=?",
                                    [refData, addedOn, courseId, userDet.id], self.onSuccess, self.onError);
                                }
                            }, function (tx, results){
                                ci('Select Error ' + results.message);
                            });
                });
            }
        },
        getCourseItems: function (courseId){
            var self = this, db = self.dataBase;
            var db = this.dataBase, self = this;
            if (db !== null) {
                db.transaction(function(tx) {
                    var userDet = JSON.parse(window.localStorage.getItem("USER"));
                    tx.executeSql("SELECT ref_data FROM courseitem_tbl WHERE course_id = ? AND uid = ?",
                            [courseId, userDet.id],
                            function (tx, results){
                                localStorage["transferData"] = '0';
                                if(results.rows.length > 0){
                                    var resData = results.rows.item(0);
                                    localStorage["transferData"] = resData.ref_data;
                                }
                            }, function (tx, results){
                                ci('Select Error ' + results.message);
                            });
                });
            }
        },
        isDevice: function() {
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                return true;
            } else {
                return false;
            }
        },
        isOnline: function() {
            if (navigator.network !== undefined) {
                switch (navigator.network.connection.type) {
                    case Connection.UNKNOWN:
                        return false;
                    case Connection.ETHERNET:
                        return true;
                    case Connection.WIFI:
                        return true;
                    case Connection.CELL_2G:
                        return true;
                    case Connection.CELL_3G:
                        return true;
                    case Connection.CELL_4G:
                        return true;
                    case Connection.NONE:
                        return false;
                    default :
                        return navigator.onLine;
                }
            } else {
                return navigator.onLine ? true : false;
            }
        }
    });
    return Clazz.com.js.offlineStorage;
});