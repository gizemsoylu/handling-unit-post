import { ApplicationService } from "@sap/cds";
import {
    getHandlingUnits, getStorageBins, getEWMWarehouseBins,
    getHandlingUnitStatus, moveHandlingUnits, getHandlingUnitEWMHouses,
    getHandlingUnitNumbers, getProducts, getProductionOrders,
    getVHStorageBins, getStorageTypes, getAvailabilityQuantity
} from "./lib/event-handlers/homepage";

export default class HandlingUnitPost extends ApplicationService {
    async init(): Promise<void> {

        /* ======================================================================================================================= */
        /* On Handling                                                                                                             */
        /* ======================================================================================================================= */

        this.on("READ", "VHWarehouses", getHandlingUnitEWMHouses);
        this.on("READ", "VHHUNumbers", getHandlingUnitNumbers);
        this.on("READ", "VHStatus", getHandlingUnitStatus);
        this.on("READ", "VHOrders", getProductionOrders);
        this.on("READ", "VHProducts", getProducts);
        this.on("READ", "VHStorageBins", getVHStorageBins);
        this.on("READ", "VHStorageTypes", getStorageTypes);
        this.on("READ", "VHAvailabilityQuantity", getAvailabilityQuantity);

        this.on("CREATE", "StorageBins", moveHandlingUnits);
        this.on("READ", "HandlingUnits", getHandlingUnits);
        this.on("READ", "StorageBins", getStorageBins);
        this.on("getStorageBins", getEWMWarehouseBins);
        this.on("moveHUtoBin", moveHandlingUnits);

        return super.init();
    }
}