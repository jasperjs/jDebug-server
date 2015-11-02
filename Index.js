var jServer = require('./lib/JDebugServer');
var utils = require('./lib/Utils');
var project = require('./lib/ProjectBuilder');
// handlers:
var tsHandler = require('./lib/handlers/TypeScriptHandler');
var cssHandler = require('./lib/handlers/CssHandler');
var templatesHandler = require('./lib/handlers/TemplatesHandler');
var definitionHandler = require('./lib/handlers/DefinitionHandler');
var build = require('jasper-build');
function jDebugServer(app, server, configFile) {
    if (configFile === void 0) { configFile = 'jasper.json'; }
    var buildConfig = utils.readJSON(configFile);
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
module.exports = jDebugServer;
