using {
    HandlingUnits as DBHandlingUnits,
    StorageBins   as DBStorageBins
} from '../db/data-models';

service HandlingUnitPost {
    entity HandlingUnits as projection on DBHandlingUnits;

    function getStorageLocation(EWMWarehouse : String) returns array of {
        EWMWarehouse : String;
        EWMStorageBin : String;
        EWMStorageType : String
    }
}
