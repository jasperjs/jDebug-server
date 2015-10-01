import utils = require('../Utils');
import path = require('path');
import shell = require('shelljs');

declare var process: any;
declare var exec: any;

export interface IIDEConnector{
    id: string;
    openFile(filepath: string);
}

export class WebStormIDEConnnector implements IIDEConnector{
    id: string = 'webstorm';

    openFile(filepath: string){

        var fullpath = path.join(process.cwd(), filepath);

        var isWin = /^win/.test(process.platform);
        var commandToExec = isWin ? 'webstorm ' + fullpath + ' nosplash': 'open -a Webstorm ' + fullpath;

        var resultCode = shell.exec(commandToExec, {silent: true}).code;
        if (resultCode !== 0 && resultCode !== 6) {
            utils.log('Configure path for webstorm. Failed to exec: ' + commandToExec + '. Result code: ' + resultCode);
        }
    }

}