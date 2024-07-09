using { HandlingUnits as DBHandlingUnits } from '../db/data-models';

service HandlingUnitPost {
    entity HandlingUnits as projection on DBHandlingUnits;
}
