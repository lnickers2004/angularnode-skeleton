var rad = function(x) {
  return x * Math.PI / 180;
};

var getDistance = function(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat - p1.lat);
  var dLong = rad(p2.lng - p1.lng);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};

var getBestLL = function(ip,fn){
  // check first if we already have a better IP in our database,
  geoipFileContents = JSON.parse(fs.readFileSync(app.basedir+'/data/geoip.json'));
  if ( geoipFileContents.hasOwnProperty(ip) )
    fn(geoipFileContents[ip]);
  // if not, get a better read from the internet (UNRELIABLE!)
   request('http://freegeoip.net/json/'+ip,function(e,r,b){
    geoipFileContents = JSON.parse(fs.readFileSync(app.basedir+'/data/geoip.json'));
    
    if ( geoipFileContents == null )
      geoipFileContents = {};

    geoipFileContents[ip] = b;
    b = JSON.parse(b);
    fn(b);
    fs.writeFileSync(app.basedir+'/data/geoip.json',JSON.stringify(geoipFileContents,null,2));
   });
}

var checkGeofenceDist  = function(ip,point,fn) {
  request('http://localhost:9002/json/'+ip,function(e,r,b){
    geo = JSON.parse(b);
    p1  = {'lat':geo.latitude,'lng':geo.longitude};
    p2  = {'lat':point['lat'],'lng':point['lng']};

    dist  = getDistance(p1,p2)*0.000621371;
    fn(dist);
  });
}

f = app.get('documentroot')+'/geofence.json';
if ( fs.existsSync(f) ) {
  gf  = JSON.parse(fs.readFileSync(f));
  // if geofence flags false, send them to public server
  if ( gf == null )
    gf  = {"distance": 50, "points": []};

  for ( var i in gf.points ) {
    if ( Array.isArray(gf.points[i]) || typeof gf.points[i] == "object" )
      continue;
    else{
      (function(idx){
        request("https://maps.googleapis.com/maps/api/geocode/json?address="+gf.points[idx],function(error,response,body){
          ll  = JSON.parse(body).results[0].geometry.location;
          ll.address  = gf.points[idx];
          gf.points[idx]  = ll;
          fs.writeFileSync(f,JSON.stringify(gf,null,2));
        });
      })(i)
    }
  }
}

var geoip   = require('geoip-lite');
app.all('*',function(req,res,next){
  if ( req.originalUrl.substr(0,"/tao/guard/PHP".length) == "/tao/guard/PHP" ) {
    console.log('nogeo due to special URL');
    req.nogeofence  = true;
    next();
    return;
  }

  body  = "";
  req.on('data',function(d){
    body  += d;
  })
  req.on('end', function() {
    console.log('end');
    req.body  = body;
    while (req.body.substr(req.body.length-1,1) == "&" || req.body.substr(req.body.length-1,1) == " " )
      req.body  = req.body.substr(0,req.body.length-1);
    if ( req.body.length == 0 )
      req.body = {};
    else
      req.body  = JSON.parse('{"' + decodeURIComponent(req.body).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    if ( req.query.hasOwnProperty('passcode') || req.body.hasOwnProperty('passcode') ) {
      if ( req.query.hasOwnProperty('passcode') )
        p = req.query.passcode;
      else
        p = req.body.passcode;
      request('http://localhost:'+app.get('port')+'/tao/guard/PHP/?cmd=announce&passcode='+p,function(e,r,b){
        if ( JSON.parse(b)['access-level'] > 0 )
          req.nogeofence  = true;
        else
          req.nogeofence  = false;
        next();
      });
    }
    else
      next();
  });
})
app.all('*',function(req,res,next){
  f = app.get('documentroot')+'/geofence.json';
  req.withinFence = false;
  req.checkedNum  = 0;
  req.sent  = false;

  if ( req.nogeofence ){
    console.log('bypassing geofence');
    next();
    return
  }
  if ( fs.existsSync(f) ) {
    gf  = JSON.parse(fs.readFileSync(f));
    // if geofence flags false, send them to public server
    if ( gf == null )
      gf  = {"distance": 50, "points": [], "redirect": "http://spiritway.co"};

    fn  = function(){
      var ip  = req.connection.remoteAddress;
      if ( (ip == "::1" || ip == "127.0.0.1" || ip == "::ffff:127.0.0.1") && !req.headers.hasOwnProperty('remote_addr') )
        return true;
      if ( typeof req.cookies.hasOwnProperty != "function" || !req.cookies.hasOwnProperty('ambassador-ipv6') )
        gf.redirect = "http://spiritway.co/panels/spiritway-beta-checkin";
      if ( (typeof req.cookies.hasOwnProperty != "function" || !req.cookies.hasOwnProperty('ambassador-ipv6')) || (req.checkedNum == gf.points.length && !req.withinFence) ) {
        // ok, we aren't in the fence, redirect!
        if ( req.hasOwnProperty('itv') )
          clearInterval(req.itv);

        if ( req.sent == false && gf.hasOwnProperty('redirect') ) {
          req.sent = true;
          res.redirect(gf.redirect);
        }
        else if ( req.sent == false ) {
          req.sent = true;
          res.send(200);
        }

        return false;
      }
      return true;
    }
    if ( !fn() )
      return;
    req.itv = setInterval(fn,10);
    for ( var i in gf.points ) {
      if ( !Array.isArray(gf.points[i]) && typeof gf.points[i] != "object" ) 
        continue;

      var ip  = req.cookies['ambassador-ipv6'];

     // not running through a proxy
      console.log('testing geofence');
     if ( (req.connection.remoteAddress == "::1" || req.connection.remoteAddress == "127.0.0.1" || req.connection.remoteAddress == "::ffff:127.0.0.1") && !req.headers.hasOwnProperty('remote_addr') ) {
        clearInterval(req.itv);
        req.checkedNum = 0;
        req.sent = true;
        req.withinFence = true;
        next();
        break;
      }
      else {
        checkGeofenceDist(ip,gf.points[i],function(d){
          req.checkedNum++;
          if ( d < gf.distance && !req.withinFence ) {
            // within fence distance
            req.checkedNum = 0;
            req.sent = true;
            req.withinFence = true;
            clearInterval(req.itv);
            next();
          }
        })
      }
    }
  }
  else
    next(); // no geofence file!
});