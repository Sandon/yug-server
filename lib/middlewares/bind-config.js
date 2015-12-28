"use strict";

module.exports = function ( config ) {
    return function *( next ) {
        if( '/favicon.ico' == this.request.url ){
            return ;
        }

        this.request.config = config;

        yield next;
    }
};