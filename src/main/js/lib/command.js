'use strict';
/* 
   command management - allow for non-ops to execute approved javascript code.

   command2 stuff is experimental/proposed replacement for command,
   eliminating need for jsp stuff.
*/

var _commands = {},
  _commands2 = {},
  _cmdInterceptors = [];

/*
  execute a JSP command.
*/

var executeCmd = function( args, player ) {
  var name,
    cmd,
    intercepted,
    result = null;

  if ( args.length === 0 ) {
    throw new Error('Usage: jsp command-name command-parameters');
  }
  name = args[0];
  cmd = _commands[name];
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

/* Execute a command */

var isCommand2Known = function (cmdName)
{
  var cmd = _commands2[cmdName];
  if(typeof cmd === 'undefined') {
    return false;
  }
  return true;
}

var executeCmd2 = function( cmdName, args, player ) {
  var name,
    cmd,
    intercepted,
    result = null;

  console.info( 'Doing cmd: ' + cmdName + " with " + JSON.stringify( args ) );
  cmd = _commands2[cmdName];
  if ( typeof cmd === 'undefined' ) {
    console.warn( 'Command %s is not recognised', cmdName );
    return null;
  }
  try { 
    result = cmd.callback( args, player );
  } catch ( e ) {
    console.error( 'Error while trying to execute command: ' + JSON.stringify( args ) );
    throw e;
  }
  return result;
};

/*
  define a new JSP command.
*/
var defineCmd = function( name, func, options, intercepts ) {

  if ( typeof name == 'function'){
    intercepts = options;
    options = func;
    func = name;
    name = func.name;
  }
  
  if ( typeof options == 'undefined' ) {
    options = [];
  }
  _commands[name] = { callback: func, options: options };
  if ( intercepts ) {
    _cmdInterceptors.push(func);
  }
  return func;
};

/*
  define a new command.
*/
var defineCmd2 = function( name, func, options ) {

  if ( typeof options == 'undefined' ) {
    options = [];
  }
  _commands2[name] = { callback: func, options: options };
  __plugin.registerCommand(name);
  return func;
};

exports.command = defineCmd;
exports.command2 = defineCmd2;
exports.commands = _commands;
exports.commands2 = _commands2;
exports.isCommand2Known = isCommand2Known;
exports.exec = executeCmd;
exports.exec2 = executeCmd2;
