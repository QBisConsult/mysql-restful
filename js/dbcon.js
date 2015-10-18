var mysql = require('mysql');
var utils = require('./fgen.js');

module.exports = {
	getdbdist: function(dbname,username){
		return dbname + '_' + utils.hash(username.toLowerCase(),1).toLowerCase()
	},
	getclient: function(pars){
		if (!pars.database){pars.database = pars.rapiddb}
		return mysql.createConnection(pars);
 	},
	transaction: function(client,action,qcb) {
		client.query(action,function(err,tresult) {
		if(err) {
      			qcb({error:err},'');
    			} else {
			qcb('',tresult);
			}
		})
	},
	getsql: function(client,sqlstat,qp,limit,offset,qcb){
		//console.log(sqlstat);
		//console.log(qp);
		if (limit == 0) {} else {
			sqlstat = sqlstat + ' limit ' + limit;
			if (offset == 0){} else {sqlstat = sqlstat + ' offset ' + offset};
		};
		client.query(sqlstat,qp,function(err,tresult) {
			if (err) {
				qcb({error:err},'');
			} else {
				qcb('',tresult);
			};
		});
	},
	runquery: function(client,query,query_values,returntype,qcb){
		client.query(query,query_values,function(err,tresult) {   
		if(err) {
      			qcb({error:err},'');
    			} else {
			qcb('',tresult);
			}
		})
	},
	insert: function(client_MYI,table_MYI,values_MYI,returntype,qcb){
		//console.log('insert:',values_MYI);
		var fields_MYI = ""
		var fldsvalues_MYI = []
		var hascoma_MYI = ""
		var has_delimiter = ''
		for (var fldname_MYI in values_MYI){
			if (fields_MYI.length>0){hascoma_MYI=','}
			fields_MYI = fields_MYI + hascoma_MYI +'`'+fldname_MYI+'` = ?'
			fldsvalues_MYI.push(values_MYI[fldname_MYI])
		};
		
		var tsql_string = 'INSERT INTO ' + table_MYI +' set ' +fields_MYI
		client_MYI.query(tsql_string,fldsvalues_MYI,function(err,tresult){   
		if(err) {
      			qcb({error:err},'');
    			} else {
    			var response = {};
    			response.rows = [];
    			response.rows.push(values_MYI);
    			response.msg = tresult;
			qcb('',response);
			}
		})
	},
	update: function(client_MYI,table_MYI,primary_key,key_value,values_MYI,returntype,qcb){
		//console.log('update:',values_MYI);
		var fields_MYI = ""
		var flds_MYI = ""
		var fldsvalues_MYI = []
		var hascoma_MYI = ""
		var has_delimiter = ''
		for (var fldname_MYI in values_MYI){
			if (fldname_MYI != primary_key){
				if (fields_MYI.length>0){hascoma_MYI=','}
				fields_MYI = fields_MYI + hascoma_MYI +'`'+fldname_MYI+'` = ?'
				fldsvalues_MYI.push(values_MYI[fldname_MYI])};
		}
			
		fldsvalues_MYI.push(key_value)
		var tsql_string = 'UPDATE ' + table_MYI +' set ' +fields_MYI + ' where '+primary_key+'=?'

		client_MYI.query(tsql_string,fldsvalues_MYI,function(err,tresult){   
		if(err) {
      			qcb({error:err},'');
    			} else {
    				values_MYI[primary_key] = key_value;
				var response = {};
	    			response.rows = [];
	    			response.rows.push(values_MYI);
	    			response.msg = tresult;
				qcb('',response);
			}
		})
	},
	get_fields: function(table_structure,primary_key,irequest,ck_insert,table_name){
		//console.log(irequest);
		var table_flddet = process.rapidcfg.mdb.tables.structures[table_name]
		if (!irequest[primary_key]){
			if (table_flddet[primary_key].data_type=='int'){
				irequest[primary_key]="is_autonumber";
			} else {irequest[primary_key]=utils.uuid()}
		}
		if (table_structure.updatedAt){
			var date_PGI = new Date();
			irequest.updatedAt = date_PGI.toISOString()};				
		if (table_structure.deleted){irequest.deleted = false};	
		var check_names_error = 'error'
		for (var fldname in irequest){
			if (!table_structure[fldname]){ check_names_error = check_names_error +'/'+fldname + ' - not a table field'};
		}
		if (check_names_error != 'error') {return {error:'Insert request error',rapidinsertfields_error:{error:check_names_error}}}
		if (ck_insert==1){
		if (table_structure.createdAt){
			var date_PGI = new Date();
			irequest.createdAt = date_PGI.toISOString()};
		var check_mandatory_error = 'error'		
		for (var fldname in table_structure){
			if (table_flddet[fldname].is_nullable == 'NO') {
			if (irequest[fldname] == undefined){ check_mandatory_error = check_mandatory_error +'/<'+fldname+'> - required field(!null)'}
			};

		}
		if (check_mandatory_error != 'error') {return {error:'Insert request error',rapidinsertfields_error:check_mandatory_error}}
		}
		//console.log(irequest);
		return irequest
	}
}
