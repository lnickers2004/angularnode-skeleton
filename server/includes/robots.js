module.exports  = (function(){
    this.Callbacks  = {};
    this.OnetimeCallbacks   = {};
    this.PanelCallbacks  = {};
    this.numRegistered  = 0;
    //this.currentPanel   = -1;
    this.lastRegistration   = [];    
    this.numAsyncCallbacks  = 0;
    this.asyncData  = {};

    var obj = this;
    this.clear  = function(signal) {
        this.Clear(signal);
    }
    this.Clear  = function(signal) {
        if ( Array.isArray(obj.Callbacks[signal]) ) {
            obj.Callbacks[signal]   = [];
            delete obj.Callbacks[signal];
        }
    }

    this.wait   = function() {
        return "robots-async-signal-"+(++this.numAsyncCallbacks);
    }

    this.finish    = function(id,data) {
        // should now end 
        Robots.relay(id,data);
    }

    this.Finished   = function() {
        var obj = this;
        return this.finished.apply(obj,arguments);
    }

    this.finished   = function(obj,cb){
        cin = 0;
        cout= 0;
        for ( var i in obj ) {
            if ( typeof obj[i] == "string" && obj[i].substr(0,"robots-async-signal-".length) == "robots-async-signal-" ) {
                cin++;
                (function(o,idx,c){
                    Robots.registerOnce(o[idx],function(d){
                        o[idx]  = d;
                        cout++;
                        if ( cout >= cin )
                            cb();
                    });
                })(obj,i);
            }
        }

        if ( cin == 0 )
            cb();
    }

    this.clearSignalById  = function(arr) {
        this.ClearSignalById(arr);
        delete arr;
    }

    this.ClearSignalById    = function(arr) {
        if ( arr[2] )
            obj.OnetimeCallbacks[arr[0]].splice(arr[1],1);
        else
            obj.Callbacks[arr[0]].splice(arr[1],1);

        delete arr;
    }

    this.clearPanel = function(id,name) {
        /*
            if ( onetimes[i] > 0 && onetimes[i] < cbs.length-1)
                cbs   = cbs.slice(0,onetimes[i]).concat(cbs.slice(onetimes[i]+1));
            else if( onetimes[i] == 0 && cbs.length > 1)
                cbs   = cbs.slice(onetimes[i]+1);
            else
                cbs   = cbs.slice(0,onetimes[i]);
            
        */

        var cbarr   = {};
        //console.log(id);
        if ( typeof obj.PanelCallbacks[id] == "object" )
            for ( var i in obj.PanelCallbacks[id] ) {
                for ( var j in obj.PanelCallbacks[id][i] ) {

                    if ( obj.PanelCallbacks[id][i][j][0] == true )
                        cbarr   = obj.OnetimeCallbacks;
                    else
                        cbarr   = obj.Callbacks;

                    if ( cbarr == undefined )
                        continue;

                    if ( obj.PanelCallbacks[id][i][j][1] == 0 )
                        cbarr[i].shift();
                    else if ( obj.PanelCallbacks[id][i][j][1] == cbarr.length-1 )
                        cbarr[i].pop();
                    else
                        cbarr[i]   = cbarr[i].slice(0,obj.PanelCallbacks[id][i][j][1]).concat(cbarr[i].slice(obj.PanelCallbacks[id][i][j][1]+1));

                    Robots.numRegistered--;
                }
            }
        console.log("clearing"+id);
    }

    this.registerOnce   = function(signal, callback) {
        var obj = this;
        return this.RegisterOnce.apply(obj,arguments);
    }

    this.RegisterOnce   = function(signal, callback) {
        if ( !Array.isArray(obj.OnetimeCallbacks[signal]) )
            obj.OnetimeCallbacks[signal]   = [];

        var cb = {'onetime':true,'fn':callback};
        /*
        if ( Robots.currentPanel != -1 )
            cb.panel    = Robots.currentPanel;
        */
        obj.OnetimeCallbacks[signal].push(cb);
        /*
        if ( Robots.currentPanel != -1 ) {
            if ( typeof obj.PanelCallbacks[Robots.currentPanel] != "object" ) 
                obj.PanelCallbacks[Robots.currentPanel] = {};
            if ( Array.isArray(obj.PanelCallbacks[Robots.currentPanel][signal]) ) 
                obj.PanelCallbacks[Robots.currentPanel][signal].push([true,obj.OnetimeCallbacks[signal].length-1]);
            else
                obj.PanelCallbacks[Robots.currentPanel][signal] = [[true,obj.OnetimeCallbacks[signal].length-1]];

            Robots.lastRegistration = []; // clear out global registers and event-triggered registers
        }
        else */{
            // is either a global register or a event-triggered register
            Robots.lastRegistration = [true, signal, obj.OnetimeCallbacks[signal].length-1];
        }

        Robots.numRegistered++;
        return [signal,obj.OnetimeCallbacks[signal].length-1,true];
    }

    this.answer     = function(signal) {
        var obj = this;
        return this.Answer.apply(obj,arguments);
    }

    this.Answer     = function(signal) {
        var obj = this;
        var results = Robots.Relay.apply(this,arguments);
        if ( results.length==0 )
            return -1;
        var result = results.pop()
        return result;
    }

    this.register   = function(signal, callback) {
        var obj = this;
        return this.Register.apply(obj,arguments);
    }
    this.Register   = function(signal, callback) {
        if ( Array.isArray(signal) ) {
            for ( var i in signal )
                this.register(signal[i], callback);
            return;
        }
        if ( !Array.isArray(obj.Callbacks[signal]) )
            obj.Callbacks[signal]   = [];

        var cb = {'onetime':false,'fn':callback};
        /*
        if ( Robots.currentPanel != -1 ) 
            cb.panel    = Robots.currentPanel;
        */

        obj.Callbacks[signal].push(cb);

        /*
        if ( Robots.currentPanel != -1 ) {
            if ( typeof obj.PanelCallbacks[Robots.currentPanel] != "object" ) 
                obj.PanelCallbacks[Robots.currentPanel] = {};
            if ( Array.isArray(obj.PanelCallbacks[Robots.currentPanel][signal]) ) 
                obj.PanelCallbacks[Robots.currentPanel][signal].push([false,obj.Callbacks[signal].length-1]);
            else
                obj.PanelCallbacks[Robots.currentPanel][signal] = [[false,obj.Callbacks[signal].length-1]];

            Robots.lastRegistration = []; // clear out global registers and event-triggered registers
        }
        else */{
            // is either a global register or a event-triggered register
            Robots.lastRegistration = [false, signal, obj.Callbacks[signal].length-1];
        }

        Robots.numRegistered++;
        return [signal,obj.Callbacks[signal].length-1,false];
    }

    // echo one signal to another
    this.echo   = function(signal,signal2) {
        var obj = this;
        this.Echo.apply(obj,arguments);
    }

    this.Echo   = function(signal,signal2) {
        var obj = this;
        if ( arguments.length > 2 && typeof arguments[2] == "function" )
            fn  = arguments[2];
        else
            fn  = function(){return true;}
        Robots.register(signal, function(){
            args    = Array.prototype.slice.call(arguments,0);
            if ( !fn.apply(obj,args) )
                return;
            args.unshift(signal2);
            Robots.relay.apply(obj,args);
        })
    }

    this.relay  = function(signal){
        var obj = this;
        return this.Relay.apply(obj,arguments);
    }
    this.Relay  = function(signal) {
        //oldCurrentPanel = Robots.currentPanel;
        if ( signal != 'robots-signal-relayed' )
            Robots.relay('robots-signal-relayed', Robots.currentPanel, signal, Array.prototype.slice.call(arguments,1));

        if ( !Array.isArray(obj.Callbacks[signal]) && !Array.isArray(obj.OnetimeCallbacks[signal]) )
            return [];

        var results = [];

        if ( Array.isArray(obj.OnetimeCallbacks[signal]) ) {
            var onetimes   = obj.OnetimeCallbacks[signal];
            while ( onetimes.length > 0 ) {
                var onetime = onetimes.pop();
                //lastCurrentPanel    = Robots.currentPanel;
                try {
                    //if ( onetime.hasOwnProperty('panel') )
                    //    Robots.currentPanel = onetime['panel'];
                    results.push(onetime['fn'].apply(this,Array.prototype.slice.call(arguments,1)));
                    //Robots.currentPanel    = lastCurrentPanel;
                } catch(e) {
                    console.log("Current signal: "+signal);
                    console.log(e.message);
                    try {
                        if ( $ != undefined ) 
                           console.log("Current Panel: "+$(builder.getPanelById(onetime['panel'])).attr('name'));
                   } catch(e) {

                   }
                    //console.log(e.toSource());
                }
                delete onetime;
                Robots.numRegistered--;
            }
        }

        if ( Array.isArray(obj.Callbacks[signal]) ) {
            var cbs = obj.Callbacks[signal];
            for ( var i in cbs ) {
                try {
                    try {
                        /*
                        $_oldjq   = $;
                        if ( cbs[i].hasOwnProperty('panel') && $('*').context != document )
                            $   = jQuery    = $_originalJquery;
                        if ( cbs[i].hasOwnProperty('panel') && builder.getPanelById(cbs[i]['panel']) != null ) {
                            instance    = builder.getPanelById(cbs[i]['panel']);
                            jQuery.noConflict(); // keep the real jQuery for now
                            $ = function( selector, context ){
                              return new jQuery.fn.init( selector, context || instance );
                            };
                            $.fn = $.prototype = jQuery.fn;
                            jQuery.extend( $, jQuery ); // copy static method

                            // Then override default jQuery
                            jQuery = $;
                            window.el   = instance;
                        }
                        */
                    }catch(e){}
                   // lastCurrentPanel    = Robots.currentPanel;
                    //if ( cbs[i].hasOwnProperty('panel') )
                    //    Robots.currentPanel = cbs[i]['panel'];
                    results.push(cbs[i]['fn'].apply({},Array.prototype.slice.call(arguments,1)));
                    //Robots.currentPanel    = lastCurrentPanel;
                    try {
                       //$ = jQuery.sub(); // = $_oldjq; // problems 5/2/15
                    } catch(e) {}
                } catch(e) {
                    console.log("Current signal: "+signal);
                    console.log(e.message);
                    try {
                        //if ( $ != undefined ) 
                        //    console.log("Current Panel: "+$(builder.getPanelById(cbs[i]['panel'])).attr('name'));
                        //console.log(e.toSource());
                    } catch(e) {

                    }
                }
            }
        }

        //Robots.currentPanel = oldCurrentPanel;
        return results;
    }

    return this;
})();
