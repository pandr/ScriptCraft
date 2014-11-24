'use strict';
/* 
   command management - allow for non-ops to execute approved javascript code.
*/
var _jspcommands = {},
  _cmdInterceptors = [];
/*
  execute a JSP command.
*/
var executeJspCmd = function( args, player ) {
  var name,
    cmd,
    intercepted,
    result = null;

  if ( args.length === 0 ) {
    throw new Error('Usage: jsp command-name command-parameters');
  }
  name = args[0];
  cmd = _jspcommands[name];
  if ( typeof cmd === 'undefined' ) {
    // it's not a global command - pass it on to interceptors
    intercepted = false;
    for ( var i = 0; i < _cmdInterceptors.length; i++ ) {
      if ( _cmdInterceptors[i]( args, player ) )
        intercepted = true;
    }
    if ( !intercepted ) {
      console.warn( 'Command %s is not recognised', name );
    }
  }else{
    try { 
      result = cmd.callback( args.slice(1), player );
    } catch ( e ) {
      console.error( 'Error while trying to execute command: ' + JSON.stringify( args ) );
      throw e;
    }
  }
  return result;
};
/*
  define a new JSP command.
*/
var defineJspCmd = function( name, func, options, intercepts ) {

  if ( typeof name == 'function'){
    intercepts = options;
    options = func;
    func = name;
    name = func.name;
  }
  
  if ( typeof options == 'undefined' ) {
    options = [];
  }
  _jspcommands[name] = { callback: func, options: options };
  if ( intercepts ) {
    _cmdInterceptors.push(func);
  }
  return func;
};

// the next 3 should be renamed to reflect their jsp-ness 
exports.command = defineJspCmd;
exports.commands = _jspcommands;
exports.exec = executeJspCmd;


// New non-jsp commands

var  _commands = {};

var registerCommand = function( name, func )
{
  _commands[name] = { callback: func };
  __plugin.registerCommand([name]);
}

var executeCommand = function(args, player)
{
  var name   = args[0];
  var cmd    = _commands[name];
  var result = null;
  
  if ( typeof cmd === 'undefined' ) {
    console.warn( 'Command %s is not recognised ('+JSON.stringify(args)+')' , name );
    return null;
  }

  try { 
    result = cmd.callback( args.slice(1), player );
  } catch ( e ) {
    console.error( 'Error while trying to execute command: ' + JSON.stringify( args ) );
    throw e;
  }
  return result;
}

exports.registerCommand = registerCommand;
exports.executeCommand = executeCommand;