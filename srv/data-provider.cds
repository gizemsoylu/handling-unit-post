using {
    HandlingUnits as DBHandlingUnits,
    StorageBins   as DBStorageBins,
    moveHU        as TypeMoveHU
} from '../db/data-models';


@requires: 'authenticated-user'
service HandlingUnitPost {
    /********************************************************************************************************/
    /* Composite or Table Views                                                                             */
    /********************************************************************************************************/

    @cds.redirection.target: true
    entity HandlingUnits          as projection on DBHandlingUnits;

    entity StorageBins            as projection on DBStorageBins;

    /********************************************************************************************************/
    /* Action - Function Imports                                                                            */
    /********************************************************************************************************/

    action   moveHUtoBin(moveHUs : array of TypeMoveHU);

    function getStorageBins(EWMWarehouse : String) returns array of {
        EWMWarehouse : String;
        EWMStorageBin : String;
        EWMStorageType : String
    };

    /********************************************************************************************************/
    /* ValueHelp Views                                                                        */
    /********************************************************************************************************/
    @readonly
    entity VHStatus               as select distinct key HandlingUnitStatus from DBHandlingUnits;

    @readonly
    entity VHWarehouses           as select distinct key EWMWarehouse from DBHandlingUnits;

    @readonly
    entity VHHUNumbers            as select distinct key HandlingUnitNumber from DBHandlingUnits;

    @readonly
    entity VHProducts             as select distinct key Product from DBHandlingUnits;

    @readonly
    entity VHOrders               as select distinct key ProductionOrder from DBHandlingUnits;

    @readonly
    entity VHStorageBins          as select distinct key EWMStorageBin from DBHandlingUnits;

    @readonly
    entity VHStorageTypes         as select distinct key EWMStorageType from DBHandlingUnits;

    @readonly
    entity VHAvailabilityQuantity as select distinct key QuantityAvailability from DBHandlingUnits;
}
