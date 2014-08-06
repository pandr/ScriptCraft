/*************************************************************************
## Example Plugin #8 - Making a 'real' command

Showing how to use command2() to create commands

### Usage: 

At the in-game prompt type ...
  
    /foobar

... and a message `Indeed {player-name}, foobar` will appear
(where {player-name} is replaced by your own name).
  
This example demonstrates the basics of adding new functionality
which is usable all players or those with the scriptcraft.proxy
permission.  By default, all players are granted this permission.
  
***/

command2(
  'foobar',
  function ( parameters, player ) {
    player.sendMessage( 'Indeed Foobar ' + player.name + ',' + JSON.stringify(parameters));
  },
  ['foo','bar','baz']
);
