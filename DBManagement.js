const csvtojson = require('csvtojson');
//cmd창에 npm install csvtojson입력하여 설치해야한다. 
const fs = require('fs');
const mysql = require('mysql2');
/*cmd창에 npm install mysql을 입력하여 설치해야한다.
 mysql로 할경우 Error: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MySQL client 
 오류가 발생한다. 해결 방법으로는
 1. ALTER USER ‘root’@’localhost’ IDENTIFIED WITH mysql_native_password BY ‘사용할패스워드’을 SQL Command line에 입력
 2. npm install mysql2를 설치하여 require('mysql2')를 이용 
 
 */
const Promise = require('promise');
const sleep = require('./sleep');

class DataBaseManagement{
    constructor(){       
        this._hostname = "localhost",
        this._username = "root",
        this._password = "1234",
        this._databasename = "caselawDB"
  
        this._connection = null;
    }

    setConnectionProperty = function(host, user, pass, db){
        this._hostname = host,
        this._username = user,
        this._password = pass,
        this._databasename = db
    }

    getConnectionProperty = function(){
        this.property = [this._hostname, this._username, this._password, this._databasename]

        return this.property;
    }

    connect = function(){
        this._connection = mysql.createConnection({
            host: this._hostname,
            user: this._username,
            password: this._password,
            database: this._databasename,
        }); 

    }
    disconnect = function(){
        this._connection.end();
    }

    update(callback){
        
        var deleteSql = `delete from caselaw2`;
        this._connection.query(deleteSql, (error) => {
            if(error) console.log(error);
            return 0;
        });

        const fileName = "C:/Users/ASUS/Desktop/nodejs/clean_prec_data.csv";
        //현재 내 컴퓨터에 cases3.csv가 존재하는 절대 위치 경로
        //상대 경로로 해도 상관은 없음

        csvtojson().fromFile(fileName).then(source => {
        for(var i = 0; i < source.length;i++){
            var 판례일련번호 = source[i]["판례일련번호"],
                사건명 = source[i]["사건명"],
                사건번호 = source[i]["사건번호"],
                선고일자 = source[i]["선고일자"],
                선고 = source[i]["선고"],
                법원명 = source[i]["법원명"],
                법원종류코드 = source[i]["법원종류코드"],
                사건종류명 = source[i]["사건종류명"],
                사건종류코드 = source[i]["사건종류코드"],
                판결유형 = source[i]["판결유형"],
                판시사항 = source[i]["판시사항"],
                판결요지 = source[i]["판결요지"],
                참조조문 = source[i]["참조조문"],
                참조판례 = source[i]["참조판례"],
                판례내용 = source[i]["판례내용"]
                
                var insertSql = `insert into caselaw2 values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                var attr = [판례일련번호, 사건명, 사건번호, 선고일자, 선고, 
                            법원명, 법원종류코드, 사건종류명, 사건종류코드, 
                            판결유형, 판시사항, 판결요지, 참조조문, 참조판례, 판례내용];
                //insert와 속성들
                    
                try {
                    this._connection.query(insertSql,attr)
                    }
                catch (exception) {
                    console.log(i);
                    continue;
                    
                    //중복데이터, null값등 데이터 입력시 오류가 존재하는 데이터 제거위함
                    }
                
                }

            });

    }
    selectBoard = function(where_condition){
        var selectSql = "select 사건명, 사건번호, 선고일자, 사건종류명 from caselaw2 where 사건번호='" + where_condition +"'"
        this._connection.query(selectSql, function(error, results, fields){
            if(error) throw error;
            console.log(`사건명 : ${results[0].사건명}, 사건번호 : ${results[0].사건번호}, 선고일자 : ${results[0].선고일자}, 사건종류명 : ${results[0].사건종류명}`);
            //이 부분을 넘겨 주어야한다.
        });

    }

    selectDetail = function(where_condition){
        var selectSql = "select * from caselaw2 where 사건번호='" + where_condition +"'" 
        // select문 조건 설정(사건번호가 기본키로 생각)
        this._connection.query(selectSql, function(error, results, fields){
            if(error) throw error;
           
            console.log(`사건명 : ${results[0].사건명}, 사건번호 : ${results[0].사건번호}, 선고일자 : ${results[0].선고일자}, 사건종류명 : ${results[0].사건종류명}`);
            console.log(`판례일련번호 : ${results[0].판례일련번호}, 선고 : ${results[0].선고}, 법원명 : ${results[0].법원명}, 법원종류코드 : ${results[0].법원종류코드}`);
            console.log(`사건종류코드 : ${results[0].사건종류코드}, 판결유형 : ${results[0].판결유형}`);
            console.log(`판시사항 : ${results[0].판시사항}`);
            console.log(`판결요지 : ${results[0].판결요지}`);
            console.log(`참조조문 : ${results[0].참조조문}`);
            console.log(`참조판례 : ${results[0].참조판례}`);
            console.log(`판례내용 : ${results[0].판례내용}`); //이 부분을 넘겨 주어야한다.
        });

    }

}

var db = new DataBaseManagement();
db.connect();
db.update();





/*
db.connect();
db.selectBoard("2017다265884");
db.disconnect();
에서는 오류가 없으나, 


db.connect();
db.update();
db.disconnect();
에서 nodejs의 비동기 처리로 인하여 연결해제가 더빨리 진행되어 오류가 발생한다.*/
