var jServer = require('./lib/JDebugServer');
var utils = require('./lib/Utils');
// handlers:
var tsHandler = require('./lib/handlers/TypeScriptHandler');
var cssHandler = require('./lib/handlers/CssHandler');
var templatesHandler = require('./lib/handlers/TemplatesHandler');
var definitionHandler = require('./lib/handlers/DefinitionHandler');
function jDebugServer(app, server) {
    var options = utils.readJSON('jasper.json');
    if (!options) {
        return;
    }
    // debug enabled in config file? todo: extends
    var jDebugEnabled = options.jDebug ? !!options.jDebug.enabled : false;
    var jDebugUrl = options.jDebug ? options.jDebug.wsUrl || '/jdebug' : '/jdebug';
    function createServer() {
        if (!jDebugEnabled) {
            return;
        }
        var jDebugServer = new jServer.JDebugServer(server, jDebugUrl);
        // list of default handlers
        var handlers = [
            new tsHandler(jDebugServer),
            new cssHandler(jDebugServer),
            new templatesHandler(jDebugServer),
            new definitionHandler(jDebugServer)
        ];
        handlers.forEach(function (i) { return jDebugServer.addHandler(i); });
        utils.log('server started at: ' + jDebugUrl);
        return jDebugServer;
    }
    app.jDebugServer = createServer;
}
module.exports = jDebugServer;
