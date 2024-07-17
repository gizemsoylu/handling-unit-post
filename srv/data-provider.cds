using {
    HandlingUnits as DBHandlingUnits,
    StorageBins   as DBStorageBins
} from '../db/data-models';

service HandlingUnitPost {
    /********************************************************************************************************/
    /* Composite or Table Views                                                                             */
    /********************************************************************************************************/

    @cds.redirection.target: true
    entity HandlingUnits as projection on DBHandlingUnits;

    entity StorageBins   as projection on DBStorageBins;

    /********************************************************************************************************/
    /* Action - Function Imports                                                                            */
    /********************************************************************************************************/

    action   moveHUtoBin(EWMWarehouse : String,
                         SourceHandlingUnit : String,
                         WarehouseProcessType : String,
                         DestinationStorageType : String,
                         DestinationStorageBin : String);

    function getStorageBins(EWMWarehouse : String) returns array of {
        EWMWarehouse : String;
        EWMStorageBin : String;
        EWMStorageType : String
    };

    /********************************************************************************************************/
    /* ValueHelp Views                                                                        */
    /********************************************************************************************************/
    @readonly
    entity VHStatus      as select distinct key HUStatus from DBHandlingUnits;

    @readonly
    entity VHWarehouses as select distinct key EWMWarehouse from DBHandlingUnits;
    
    @readonly
    entity VHHUNumbers as select distinct key HUNumber from DBHandlingUnits;

    @readonly
    entity VHMaterials as select distinct key MaterialNumber from DBHandlingUnits;

    @readonly
    entity VHOrders as select distinct key ProductionOrder  from DBHandlingUnits;

}
