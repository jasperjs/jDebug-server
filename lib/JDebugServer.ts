import w = require('./Watcher');
import ws = require('ws');
import utils = require('./Utils');
import ide = require('./ide/IIDEConnector');

export interface IJDebugFileHandler {

    /**
     * File mask to watch
     */
    filemasks: string[];

    /**
     * Invokes then file is changed
     * @param info      Info of changed file
     * @returns         true if file processed
     */
    fileChanged?(info:w.IFileInfo): boolean;

    fileAdded?(info:w.IFileInfo): boolean;

    fileRemoved?(info:w.IFileInfo): boolean;
}

export enum FileHandlerScope{
    /**
     *      Jasper application folder
     */
    APP = 1,
    /**
     *  Project folder
     */
    PROJECT = 2,
}

export enum JDebugCommandType {
    TEMPLATECHANGED = 1,
    DEFINITIONCHANGED = 2,
    CTRLCHANGED = 3,
    CSSCHANGED = 4
}

export interface IJDebugCommand {
    type: JDebugCommandType;
    data: any;
}

export class JDebugServer {
    private ideConnectors:ide.IIDEConnector[] = [];
    private ideConnectorId:string;

    private ws:any;

    private defers = {};
    private flushPeriod = 500;

    private handlers:IJDebugFileHandler[];

    constructor(private server:any, wsUrl:string, private appPath:string) {

        // start web sockets:
        this.ws = new ws.Server({
            path: wsUrl,
            server: server
        });

        this.ws.on('connection', (connection) => {
            connection.on('message', (data) => {
                try {
                    var message:IJdebugMessage = JSON.parse(data);
                    this.dispatchClientMessage(message);
                }
                catch (e) {
                    utils.log('Error while process jDebug client message: ' + e);
                }
            });
        });

        this.addIDEConnector(new ide.WebStormIDEConnnector());
        this.useIDEConnector('webstorm');
    }

    watch(appHandlers:IJDebugFileHandler[]) {
        this.handlers = appHandlers;

        var watcher = new w.SaneWatcher();
        watcher.watchFiles({
            glob: this.getFileMasks(appHandlers),
            dir: this.appPath
        }, this.processEvent.bind(this));


    }

    broadcast(command:IJDebugCommand, useDebounce:boolean = false) {
        var payload = JSON.stringify(command);
        var send = () => {
            this.ws.clients.forEach(client => client.send(payload));
            this.defers[payload] = null;
        };

        if (this.defers[payload]) {
            clearTimeout(this.defers[payload]);
        }

        if (useDebounce) {
            this.defers[payload] = setTimeout(()=> send(), this.flushPeriod);
        }
        else {
            send();
        }
    }

    useIDEConnector(id:string) {
        this.ideConnectorId = id;
    }

    addIDEConnector(connector:ide.IIDEConnector) {
        this.ideConnectors.push(connector);
    }

    private getFileMasks(handlers:IJDebugFileHandler[]) {
        var all = [];
        handlers.forEach(h=>all = all.concat(h.filemasks));
        return all;
    }

    private dispatchClientMessage(message:IJdebugMessage) {
        switch (message.type) {
            case 'ide_open':
                var connector = this.getCurrentIDEConnector();
                if (!connector) {
                    utils.log('ide connector not found');
                    return;
                }
                connector.openFile(message.data);
                break;
            default:
                utils.log('unknown command type: ' + message.type);
                break;
        }
    }

    private getCurrentIDEConnector():ide.IIDEConnector {
        for (var i = 0; i < this.ideConnectors.length; i++) {
            if (this.ideConnectors[i].id === this.ideConnectorId) {
                return this.ideConnectors[i];
            }
        }
        return undefined;
    }

    private processEvent(e:w.IWatchEvent) {

        for (var i = 0; i < this.handlers.length; i++) {
            var handler = this.handlers[i];
            try {
                if (e.type === w.WatchEventType.CHANGED
                    && handler.fileChanged
                    && handler.fileChanged(e.file)) {
                    return;
                }
                else if (e.type === w.WatchEventType.REMOVED
                    && handler.fileRemoved
                    && handler.fileRemoved(e.file)) {
                    return;
                }
                else if (e.type === w.WatchEventType.ADDED
                    && handler.fileAdded
                    && handler.fileAdded(e.file)) {
                    return;
                }
            } catch (err) {
                utils.log('error: ' + err);
            }
        }
    }

}

interface IJdebugMessage {
    type: string;
    data: any;
}