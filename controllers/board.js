var validator = require('validator');

var at           = require('../common/at');
var User         = require('../proxy').User;
var Board        = require('../proxy').Board;
var EventProxy   = require('eventproxy');
var tools        = require('../common/tools');
var store        = require('../common/store');
var config       = require('../config');
var _            = require('lodash');
var cache        = require('../common/cache');
var logger = require('../common/logger');

/**
 * Board page
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */