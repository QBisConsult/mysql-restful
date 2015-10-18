var dbs = require('./dbcon');

module.exports = {
  mdb: function(rcfg,rcall){
  	function rapidtables(){
			function readstructure(dbnames,loop,next){
				loop = loop + 1
				function rapidstruct(){
					function tblcb(error,message){
					if (error){
					console.log({error:'rapid bases error 2'});
					console.info(' ');
					} else{
						var joker_table = "@xyz"
						message.forEach(function(row){
							if (row.table_name != joker_table){
								joker_table = row.table_name;
								rcfg.mdb.tables.number = rcfg.mdb.tables.number +1;
								rcfg.mdb.tables.names.push(joker_table);
								rcfg.mdb.tables.structures[row.table_name]={};
								rcfg.mdb.tables.db[row.table_name] = db.rapiddb
							}
							rcfg.mdb.tables.structures[row.table_name][row.column_name]=row;
							if (row.pkey){
								rcfg.mdb.tables.keys[row.table_name]=row.column_name;
							};
														
						});
						client.end();
						console.log('\033[33mRAPID database connection/ '+ db.database + ' - OK');
						if (loop == rcfg.mdb.databases.number) {rcall()}else {next(dbnames,loop,next)}
					}
					};
var sqlstat = "SELECT table_schema,table_name,column_name, data_type, character_maximum_length,numeric_precision,numeric_scale,is_nullable,true as is_updatable,ordinal_position,column_key as pkey FROM INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA = ?"
					dbs.runquery(client,sqlstat,[db.database],0,tblcb);		
				};
				function cbconnect (error,message){
					if (error){
						console.log({error:'rapid database connection error'});
						rcall();
					}else{
						rapidstruct();
						
					};
				};						
				var db = rcfg.mdb.databases[dbnames[loop-1]];
				db.database = dbnames[loop-1];
				db.rapiddb = dbnames[loop-1];
				client = dbs.getclient(db);
				client.connect(cbconnect);
			}
			client.end()
			rcfg.mdb.tables = {};
			rcfg.mdb.tables.number = 0;
			rcfg.mdb.tables.names = [];
			rcfg.mdb.tables.keys = {};
			rcfg.mdb.tables.structures = {};
			rcfg.mdb.tables.db = {};
			var dbss = rcfg.mdb.databases.names;
			var loop = 0;
			readstructure(dbss,loop,readstructure);
	};	
  		
  	function rapidredis(){
			if(rcfg.distributeddata==1){
			function qdscb(error,message){
			if (error){
					console.log({error:'rapid bases error 2'});
					//console.info(' ');
					rcall();
				}else{
					rcfg.mdb.redis = {}
					message.forEach(function (item){
						var rname = item.ext;
						rcfg.mdb.redis[rname]={};
						rcfg.mdb.redis[rname].id = item.id;
						rcfg.mdb.redis[rname].host = item.host;
						rcfg.mdb.redis[rname].port = item.port;
						rcfg.mdb.redis[rname].password = item.password;
						rcfg.mdb.redis[rname].isprotected = item.protected;
					});
					console.log('\033[33mRAPID bases config 2 - OK');
					rapidtables();
				}
			}
			tsql = "select * from redis_servers where cfgid='"+rcfg.rapidid+"' order by ext"
			dbs.runquery(client,tsql,[],0,qdscb);
		}else{rapidtables()}};	
  	function rapidservers(){
  		if(rcfg.distributeddata==1){
			function qdscb(error,message){
			if (error){
					console.log({error:'rapid bases error 1'});
					//console.info(' ');
					rcall();
				}else{
					//console.log(message.rows.length);
					rcfg.mdb.connections = {};
					message.forEach(function (item){
						var rname = item.database+'_'+item.extname
						rcfg.mdb.connections[rname]={};
						rcfg.mdb.connections[rname].id = item.id;
						rcfg.mdb.connections[rname].type = item.dbtype;
						rcfg.mdb.connections[rname].host = item.host;
						rcfg.mdb.connections[rname].port = item.port;
						rcfg.mdb.connections[rname].user = item.user_;
						rcfg.mdb.connections[rname].password = item.password;
						rcfg.mdb.connections[rname].database = item.database;
						rcfg.mdb.connections[rname].extname  = item.extname;
					});
					console.log('\033[33mRAPID bases config 1 - OK');
					rapidredis(); // if distributedcache =1 will load redis servers list/properties
				}
			}
			tsql = "select dbs.database,dbs.dbtype,db_servers.* from dbs inner join db_servers on dbs.id= db_servers.dbsid where dbs.cfgid='"+rcfg.rapidid+"'"
			dbs.runquery(client,tsql,[],0,qdscb);
		}else{rapidredis()};
  	};	
  	function rapidsqls(){
  		function qbcb(error,message){
			if (error){
					console.log({error:'rapid loading SQLS'});
					console.info(' ');
					rcall();
				}else{
					rcfg.mdb.sqls ={};
					rcfg.mdb.esqls={};
					message.forEach(function (item){
						if(item.inuse){
						rcfg.mdb.sqls[item.sqlname] = {};
						rcfg.mdb.sqls[item.sqlname].sqlstat = item.sqlstat;
						rcfg.mdb.sqls[item.sqlname].database = item.database;
						rcfg.mdb.sqls[item.sqlname].dbtype = item.dbtype;
						rcfg.mdb.sqls[item.sqlname].id = item.id;
						rcfg.mdb.sqls[item.sqlname].inuse = item.inuse}
						if(!item.inuse){
						rcfg.mdb.esqls[item.sqlname] = {};
						rcfg.mdb.esqls[item.sqlname].sqlstat = item.sqlstat;
						rcfg.mdb.esqls[item.sqlname].database = item.database;
						rcfg.mdb.esqls[item.sqlname].dbtype = item.dbtype;
						rcfg.mdb.esqls[item.sqlname].id = item.id;
						rcfg.mdb.esqls[item.sqlname].inuse = item.inuse}
					});
					console.log('\033[33mRAPID SQLS - OK');
					rapidservers();  // if distributeddata = 1 will load used servers list/properties
				}
			}
			dbs.runquery(client,"select sqls.*,dbs.database,dbs.dbtype from sqls inner join dbs on sqls.dbid = dbs.id where dbs.cfgid='"+rcfg.rapidid+"' and sqls.deleted = false",[],0,qbcb);		//and sqls.inuse = true
  	};
  	function rapidbases(){
  		function qbcb(error,message){
			if (error){
					console.log({error:'rapid bases error 0'});
					console.info(' ');
					rcall();
				}else{
					rcfg.mdb = {};
					rcfg.mdb.databases = {};
					rcfg.mdb.databases.number = message.length;
					rcfg.mdb.databases.names = []
					message.forEach(function (item){
						rcfg.mdb.databases.names.push(item.database);
						rcfg.mdb.databases[item.database] = {}
						rcfg.mdb.databases[item.database].id = item.id
						rcfg.mdb.databases[item.database].type = item.dbtype
						rcfg.mdb.databases[item.database].host = item.host
						rcfg.mdb.databases[item.database].port = item.port
						rcfg.mdb.databases[item.database].user = item.user_
						rcfg.mdb.databases[item.database].password = item.password
						rcfg.mdb.databases[item.database].distributeddata = item.distributeddata
					});
					console.log('\033[33mRAPID bases config 0 - OK');
					rapidsqls();  // if distributeddata = 1 will load used servers list/properties
				}
			}
			dbs.runquery(client,"select * from dbs where cfgid='"+rcfg.rapidid+"'",[],0,qbcb);
  	};	
  	function rapidconfig(){
  		function qccb(error,message){
  			//console.log(error);
			if (error){
				console.log({error:'rapid config error'});
				console.info(' ');
				rcall();
			}else{
				rcfg.distributeddata  = message[0].distributeddata
				rcfg.distributedcache = message[0].distributedcache
				rcfg.usewaterline     = message[0].usewaterline
				console.log('\033[33mRAPID read config - OK');
				rapidbases();   // used databases (structure only if distributeddata=1)
			}
		}
		dbs.runquery(client,"select * from config where id= ?",[rcfg.rapidid],0,qccb);
  	};
	function cbconnect (error,message){
		if (error){
			console.log({error:'rapid database connection error'});
			rcall();
		}else{
			console.log('\033[33mRAPID database connection - OK');
			rapidconfig();    // get the configuration parameters
		};
	};
	//console.log(rcfg);
	
        var client = dbs.getclient(rcfg);
	client.connect(cbconnect);
  }
}

