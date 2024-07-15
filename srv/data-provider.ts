import { ApplicationService } from "@sap/cds";
import { getHandlingUnits, getStorageBins, getEWMWarehouseBins, getHandlingUnitStatus, moveHandlingUnits } from "./lib/event-handlers/homepage";

export default class HandlingUnitPost extends ApplicationService {
    async init(): Promise<void> {

        /* ======================================================================================================================= */
        /* On Handling                                                                                                             */
        /* ======================================================================================================================= */

        this.on("CREATE", "StorageBins", moveHandlingUnits);
        this.on("READ", "HandlingUnits", getHandlingUnits);
        this.on("READ", "VHStatus", getHandlingUnitStatus);
        this.on("READ", "StorageBins", getStorageBins);
        this.on("getStorageBins", getEWMWarehouseBins);

        return super.init();
    }
}