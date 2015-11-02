import build = require('jasper-build');
import utils = require('./Utils');
/**
 * Object allows to build/rebuild jasper application. Works over jasper-build api
 */
export class ProjectBuilder {

    private buildTmrId:number;
    private debounce:number = 500;

    private rebuildAreasTimers = {};

    constructor(private buildManager:build.BuildManager) {

    }

    /**
     * Updates current build config and rebuild project
     */
    updateConfig(newConfig:build.IJasperBuildConfig) {
        this.buildManager.updateConfig(newConfig);
        this.rebuildProject();
    }

    /**
     * Rebuilds all project
     */
    rebuildProject() {
        //debounce
        if (this.buildTmrId) {
            clearTimeout(this.buildTmrId);
        }

        this.cancelRebuildingAreas();

        this.buildTmrId = setTimeout(()=> {
            this.buildManager.buildProject();
            this.buildTmrId = null;
        }, this.debounce);
    }

    /**
     * Determine area by filename and rebuild this area
     * @param filename      path to file in project
     */
    rebuildAreaByFile(filename:string, rebuildRoutes:boolean = true) {
        if (this.buildTmrId) {
            //full rebuild shedulled allready
            return;
        }

        var areaName = utils.determineAreaName(filename);
        if (!areaName) {
            utils.log(`Unable to determine area for file '${filename}'`);
            return;
        }

        if (this.rebuildAreasTimers[areaName]) {
            clearTimeout(this.rebuildAreasTimers[areaName]);
        }
        this.rebuildAreasTimers[areaName] = setTimeout(()=> {
            this.buildManager.rebuildArea(areaName, rebuildRoutes);
            delete this.rebuildAreasTimers[areaName];
        }, this.debounce);

    }


    private cancelRebuildingAreas() {
        var keys = Object.keys(this.rebuildAreasTimers);
        if (!keys.length) {
            return;// nothing to cancel
        }
        keys.forEach(key=> {
            clearTimeout(this.rebuildAreasTimers[key]);
        });
        this.rebuildAreasTimers = {};
    }

}