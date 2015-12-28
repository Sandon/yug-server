'use strict';

module.exports = function( statusCode ){
    return function *( next ){
    	this.res.statusCode = statusCode;
        yield next;
    }
};
