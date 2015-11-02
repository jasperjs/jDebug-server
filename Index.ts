import jServer = require('./lib/JDebugServer');
import utils = require('./lib/Utils');
import project = require('./lib/ProjectBuilder');
// handlers:
import tsHandler = require('./lib/handlers/TypeScriptHandler');
import cssHandler = require('./lib/handlers/CssHandler');
import templatesHandler = require('./lib/handlers/TemplatesHandler');
import definitionHandler = require('./lib/handlers/DefinitionHandler');
import build = require('jasper-build');

function jDebugServer(app, server, configFile: string = 'jasper.json') {

    var buildConfig: build.IJasperBuildConfig = utils.readJSON(configFile);

    if (!buildConfig || !buildConfig.jDebugEnabled) {
        return;
    }

    // debug enabled in config file? todo: extends
    var jDebugUrl = '/jdebug';
    var builder = new project.ProjectBuilder(new build.BuildManager(buildConfig));
    function createServer() {
        var jDebugServer = new jServer.JDebugServer(server, jDebugUrl, buildConfig.appPath);
        // list of default handlers
        var handlers = [
            new tsHandler(jDebugServer),
            new cssHandler(jDebugServer),
            new templatesHandler(jDebugServer),
            new definitionHandler(jDebugServer, builder)
        ];

        jDebugServer.watch(handlers);

        utils.log('server started at: ' + jDebugUrl);

        return jDebugServer;
    }

    builder.rebuildProject();

    app.jDebugServer = createServer;

}

export = jDebugServer;
