/**
 * 基于host资源访问的基本功能
 */

var Path = require('path'),
	mime = require('mime'),
	connect = require('connect'),
	utils = require('../utils');


/**
 * Options:
 *	`root`	根目录
 */
module.exports = function(req, res, next) {
	var config = req.config;
	config.root ? 
		process(req, res, config, next) :
		next();
};


function process(req, res, config, next) {
	req.filepath = Path.join(config.root, req.url.replace(/\?.*$/, ''));
	req.fileext = Path.extname(req.filepath);
	if (['.htm', '.html', '.css'].indexOf(req.fileext) !== -1) {
		var ct = mime.lookup(req.filepath);
		if (config.outputCharset) {
			ct = ct + '; charset=' + config.outputCharset;
		}
		res.setHeader('Content-Type', ct);
	}

	res.setHeader('File-Path', req.filepath);

	var app = connect()
		.use(connect.directory(config.root))
		.use(connect.static(config.root));

	app(req, res, next);
}

