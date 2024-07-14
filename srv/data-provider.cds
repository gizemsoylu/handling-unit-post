using {
    HandlingUnits as DBHandlingUnits,
    StorageBins   as DBStorageBins
} from '../db/data-models';

service HandlingUnitPost {
    @cds.redirection.target: true
    entity HandlingUnits as projection on DBHandlingUnits;
    @readonly
    entity VHStatus as select distinct key HUStatus from DBHandlingUnits;

    function getStorageLocation(EWMWarehouse : String) returns array of {
        EWMWarehouse : String;
        EWMStorageBin : String;
        EWMStorageType : String
    }
}
