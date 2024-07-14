import { ApplicationService } from "@sap/cds";
import { getHandlingUnits, getStorageBins } from "./lib/event-handlers/homepage";

export default class HandlingUnitPost extends ApplicationService {
    async init(): Promise<void> {

        /* ======================================================================================================================= */
        /* On Handling                                                                                                             */
        /* ======================================================================================================================= */

        this.on("READ", "HandlingUnits", getHandlingUnits);
        this.on("getStorageLocation", getStorageBins);

        return super.init();
    }
}