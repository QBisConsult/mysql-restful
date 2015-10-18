
function gms(hobj,req,auth,next){
   headers = {'Content-Type': "application/json; charset=utf-8"};
   if (auth) {headers.Authorization = auth};
   req.headers = headers;
   hobj(req).then(function(response){
     return next(false,response);
     }, function (x) {return next(x)}	
   );
};
