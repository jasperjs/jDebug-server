import jServer = require('./lib/JDebugServer');
import utils = require('./lib/Utils');
// handlers:

import tsHandler = require('./lib/handlers/TypeScriptHandler');
import cssHandler = require('./lib/handlers/CssHandler');
import templatesHandler = require('./lib/handlers/TemplatesHandler');
import definitionHandler = require('./lib/handlers/DefinitionHandler');

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

        handlers.forEach(i => jDebugServer.addHandler(i));

        utils.log('server started at: ' + jDebugUrl);
    }

    app.jDebugServer = createServer;

}

export = jDebugServer;
