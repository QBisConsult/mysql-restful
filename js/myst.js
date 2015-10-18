var utils = require('./fgen.js')

module.exports = {
	init:function(options,cdata,next){
		var mysql      = require('mysql');
		var con = Object.assign({}, options)
		//con.database = cdata;
		console.log(con);
		function insertnewvalues(){
			console.log("INSERT values");
			sqlstat = "insert into config (id,distributeddata,distributedcache,usewaterline,usr,pwd) values ('default',0,0,0,'administrator','admin');";
					 sqlstat = sqlstat + 'insert into dbs (id,cfgid,`database`,dbtype,host, port,user_,password,createdAt, updatedAt,distributeddata)';
					 sqlstat = sqlstat + " values ('db1','default','"+cdata+"','mysql','"+options.host+"',"+options.port+",'"+ options.user+"','"+options.password+"','" + utils.timeymd() +"','"+utils.timeymd()+"',0)";
					 console.log(sqlstat);
					 client.query(sqlstat,function(err, result){
						if (err) {
							return next({dbconf:"error",error:"can not insert defaults",errmsg:err});
						};
						client.end();
						return next(false,result);
					 });
		}
		function createtables(){
			var sqlstat = 'CREATE TABLE config (id character varying(32) NOT NULL,distributeddata integer, distributedcache integer,usewaterline integer,usr character varying(128),pwd character varying(128),CONSTRAINT cfgid PRIMARY KEY (id)); CREATE TABLE db_servers (id character varying(32) NOT NULL,  dbsid character varying(32),extname character varying(32),host character varying(128), user_ character varying(128), password character varying(128), createdAt varchar(45), updatedAt varchar(45),port integer, CONSTRAINT srvid PRIMARY KEY (id)); CREATE TABLE dbs (id character varying(32) NOT NULL,cfgid character varying(32),`database` character varying(24),dbtype character varying(15),host character varying(128),port integer,user_ character varying(128),password character varying(128),createdAt varchar(45), updatedAt varchar(45), distributeddata integer,CONSTRAINT dbsid PRIMARY KEY (id));CREATE TABLE redis_servers (id character varying(32) NOT NULL,cfgid character varying(32), ext character varying(14),host character varying(128), port integer, protected integer,password character varying(128),createdAt varchar(45),updatedAt varchar(45), CONSTRAINT rdsid PRIMARY KEY (id)); CREATE TABLE sqls (id character varying(32) NOT NULL,sqlname character varying(32),sqlstat text,samplerequest text,inuse boolean,createdAt varchar(45), updatedAt varchar(45),deleted boolean,dbid character varying(32),CONSTRAINT sqlid PRIMARY KEY (id)); CREATE TABLE tokens (id character varying(32) NOT NULL, tname character varying(66),token text, createdAt varchar(45),updatedAt varchar(45),CONSTRAINT tokenid PRIMARY KEY (id));'
			client.query(sqlstat,function(err,rows,fields){
				if(err){return next({dbconf:"error",error:"can not create rcfg tables",errmsg:err})}
				insertnewvalues();
			});
		}
		function connectrcfg(){
			con.database = 'rcfg';
			con.multipleStatements = true;
			client = mysql.createConnection(con);
			client.connect(function(err){
				if(err){return next({dbconf:"error",error:"can not create databases rcfg",errmsg:err})}
				createtables();
			});
		};
		function createdata(){
			console.log('create data');
			delete con.database;
			client = mysql.createConnection(con);
			client.connect()
			client.query("CREATE DATABASE IF NOT EXISTS rcfg",function(err,rows,fields){
				client.end();
				if(err){return next({dbconf:"error",error:"can not create databases rcfg",errmsg:err})}
				connectrcfg();
			})
		};
		function cbn(err){
			if(err){return checkerr(err)};
			next(false,'OK');
		};
		function checkrcfg(){
			client.end();
			con.database = 'rcfg';
			client = mysql.createConnection(con);
			client.connect(cbn);
		};
		function checkerr(err){
			console.log(err);
			if (err.code){
				if (err.code == 'ER_ACCESS_DENIED_ERROR'){
					//console.log("Invalid password or username");
					return next({dbconf:"error",error:"Invalid password or username",errmsg:err});
				};
				if (err.code == 'ENOTFOUND'){
					return next({dbconf:"error",error:"Invalid address IP",errmsg:err});
				};
				if (err.code == 'ECONNREFUSED'){
					//console.log("Invalid address");
					return next({dbconf:"error",error:"Invalid address port",errmsg:err});
				};
				if (err.code == 'ER_BAD_DB_ERROR'){
					createdata();
				};
			};
		};
		function cb(err){
			//console.log('con:',err);
			if(err){
				if(err.code == 'ER_BAD_DB_ERROR'){return next({dbconf:"error",error:"Invalid start database",errmsg:err})};
				return checkerr(err)
			};		
			checkrcfg();
		};
		con.database = cdata;
		var client = mysql.createConnection(con)
		client.connect(cb);
	}
}

