using {
    HandlingUnits as DBHandlingUnits,
    StorageBins   as DBStorageBins
} from '../db/data-models';

service HandlingUnitPost {
    @cds.redirection.target: true
    entity HandlingUnits as projection on DBHandlingUnits;

    entity StorageBins   as projection on DBStorageBins;

    @readonly
    entity VHStatus      as select distinct key HUStatus from DBHandlingUnits;

    function getStorageBins(EWMWarehouse : String) returns array of {
        EWMWarehouse : String;
        EWMStorageBin : String;
        EWMStorageType : String
    }
}
