import { OnEventHandler, TypedRequest, connect, operator } from "@sap/cds";
import { IHandlingUnits, IHandlingUnitItems, IHandlingUnitsArray, IWhereClause, IStorageBins, IMoveStorageBins, IOrderByClause, IMoveHUBody } from "../../types/homepage.types";
import FilterOperations from "../util/FilterOperations";
import DataOperations from "../util/DataOperations";

const getHandlingUnits: OnEventHandler = async function (req: TypedRequest<IHandlingUnits>): Promise<IHandlingUnits[]> {
    const handlingCDS = await connect.to("YY1_HUINFOPALLETBOX");
    const { YY1_HUInfoPalletbox_ewm } = handlingCDS.entities;

    let huPallets = await handlingCDS.run(SELECT.from(YY1_HUInfoPalletbox_ewm));

    const dataOperations = new DataOperations();
    const filterOperations = new FilterOperations();

    const parentNodeMap: { [key: string]: number } = {};
    let nodeList: IHandlingUnitsArray = [];
    let nodeId = 1;

    huPallets = huPallets.filter((huItems: IHandlingUnitItems) => 
        huItems.PackagingMaterialType === 'Z001' || huItems.PackagingMaterialType === 'Z002'
    );

    huPallets.forEach((huItems: IHandlingUnitItems) => {

        huItems = dataOperations.formatHUItems(huItems);

        let result = dataOperations.handleParentNode(huItems, parentNodeMap, nodeList, nodeId);
        nodeList = result.nodeList;
        nodeId = result.nodeId;

        result = dataOperations.handleChildNode(huItems, parentNodeMap, nodeList, nodeId);
        nodeList = result.nodeList;
        nodeId = result.nodeId;
    });

    nodeList = dataOperations.updateNodeList(nodeList);

    if (req.query.SELECT?.where) {
        const filters = req.query.SELECT.where as unknown as IWhereClause[];
        nodeList = filterOperations.filterNodeList(nodeList, filters);
    }

    if (req.query.SELECT?.orderBy) {
        const orderBy = req.query.SELECT.orderBy as unknown as IOrderByClause[];
        nodeList = filterOperations.sortNodes(nodeList, orderBy);
    }

    nodeList.$count = nodeList.length;
    return nodeList;
};

const moveHandlingUnits: OnEventHandler = async function (req: TypedRequest<IMoveHUBody>): Promise<void> {
    try {
        const { moveHUs } = req.data;

        await Promise.allSettled(moveHUs.map(async (item) => {
            const { DestinationStorageBin, DestinationStorageType, SourceHandlingUnit, WarehouseProcessType, EWMWarehouse } = item;
            const body = { DestinationStorageBin, DestinationStorageType, SourceHandlingUnit, WarehouseProcessType, EWMWarehouse };
            const warehouseOrderSrv = await connect.to("WAREHOUSEORDER");

            try {
                const response = await warehouseOrderSrv.send("POST", "/WarehouseTask", body);
                return response;
            } catch (error) {
                if (error instanceof Error) {
                    req.error({
                        code: 'Create-Warehouse-Task',
                        message: error.message,
                        target: 'EWMStorageBin',
                        status: 500
                    })
                } else {
                    req.error({
                        code: 'Create-Warehouse-Task',
                        message: "Failed to move handling units due to an unexpected error. Please try again later.",
                        target: 'EWMStorageBin',
                        status: 500
                    })
                }
            }
        }));
    } catch (error) {
        if (error instanceof Error) {
            req.error({
                code: 'Create-Warehouse-Task',
                message: error.message,
                target: 'EWMStorageBin',
                status: 500
            })
        } else {
            req.error({
                code: 'Create-Warehouse-Task',
                message: "Failed to move handling units due to an unexpected error. Please try again later.",
                target: 'EWMStorageBin',
                status: 500
            })
        }
    }
}


/* ======================================================================================================================= */
/* Value Help Operations                                                                                                   */
/* ======================================================================================================================= */

const getHandlingUnitStatus: OnEventHandler = async function (req: TypedRequest<{ HandlingUnitStatus: string }[]>): Promise<{ HUStatus: string }[]> {
    const DataOperation = new DataOperations()
    const handlingCDS = await connect.to("HUPalletEWM");
    const { YY1_HUPalletEWM } = handlingCDS.entities;
    let huPallets = await handlingCDS.run(SELECT.from(YY1_HUPalletEWM).columns('HandlingUnitStatus'));
    const uniqueStatuses = [...new Set<string>(huPallets.map((item: { HandlingUnitStatus: string; }) => item.HandlingUnitStatus))];
    const formattedStatuses = uniqueStatuses.map(status => ({ HUStatus: DataOperation.convertStatus(status) }));

    return formattedStatuses;
}

const getHandlingUnitEWMHouses: OnEventHandler = async function (req: TypedRequest<{ EWMWarehouse: string }[]>): Promise<{ EWMWarehouse: string }[]> {
    const handlingCDS = await connect.to("HUPalletEWM");
    const allEWMWarehouses = await handlingCDS.run(SELECT.from('YY1_HUPalletEWM').columns('EWMWarehouse'));
    let uniqueEWMWarehouses: { EWMWarehouse: string }[] = [];

    allEWMWarehouses.forEach((item: { EWMWarehouse: string; }) => {
        if (item.EWMWarehouse !== '' && !uniqueEWMWarehouses.some(warehouse => warehouse.EWMWarehouse === item.EWMWarehouse)) {
            uniqueEWMWarehouses.push({ EWMWarehouse: item.EWMWarehouse });
        }
    });

    return uniqueEWMWarehouses;
}

const getHandlingUnitNumbers: OnEventHandler = async function (req: TypedRequest<{ HandlingUnitNumber: string }[]>): Promise<{ HUNumber: string }[]> {
    const handlingCDS = await connect.to("HUPalletEWM");
    const allHUs = await handlingCDS.run(SELECT.from('YY1_HUPalletEWM').columns('HandlingUnitNumber'));
    let uniqueHUs: { HUNumber: string }[] = [];

    allHUs.forEach((item: { HandlingUnitNumber: string; }) => {
        if (item.HandlingUnitNumber !== '' && !uniqueHUs.some(warehouse => warehouse.HUNumber === item.HandlingUnitNumber)) {
            uniqueHUs.push({ HUNumber: item.HandlingUnitNumber.replace(/^0+/, '') });
        }
    });

    return uniqueHUs;
}

const getMaterials: OnEventHandler = async function (req: TypedRequest<{ MaterialNumber: string }[]>): Promise<{ MaterialNumber: string }[]> {
    const handlingCDS = await connect.to("HUPalletEWM");
    const allMaterials = await handlingCDS.run(SELECT.from('YY1_HUPalletEWM').columns('MaterialNumber'));
    let uniqueMaterials: { MaterialNumber: string }[] = [];

    allMaterials.forEach((item: { MaterialNumber: string; }) => {
        if (item.MaterialNumber !== '' && !uniqueMaterials.some(warehouse => warehouse.MaterialNumber === item.MaterialNumber)) {
            uniqueMaterials.push({ MaterialNumber: item.MaterialNumber });
        }
    });

    return uniqueMaterials;
}

const getVHStorageBins: OnEventHandler = async function (req: TypedRequest<{ EWMStorageBin_1: string }[]>): Promise<{ EWMStorageBin: string }[]> {
    const handlingCDS = await connect.to("YY1_HUINFOPALLETBOX");
    const allStorageBins = await handlingCDS.run(SELECT.from('YY1_HUInfoPalletbox_ewm').columns('EWMStorageBin_1'));
    let uniqueStorageBins: { EWMStorageBin: string }[] = [];

    allStorageBins.forEach((item: { EWMStorageBin_1: string; }) => {
        if (item.EWMStorageBin_1 !== '' && !uniqueStorageBins.some(warehouse => warehouse.EWMStorageBin === item.EWMStorageBin_1)) {
            uniqueStorageBins.push({ EWMStorageBin: item.EWMStorageBin_1 });
        }
    });

    return uniqueStorageBins;
}

const getStorageTypes: OnEventHandler = async function (req: TypedRequest<{ EWMStorageType_1: string }[]>): Promise<{ EWMStorageType: string }[]> {
    const handlingCDS = await connect.to("YY1_HUINFOPALLETBOX");
    const allStorageTypes = await handlingCDS.run(SELECT.from('YY1_HUInfoPalletbox_ewm').columns('EWMStorageType_1'));
    let uniqueStorageTypes: { EWMStorageType: string }[] = [];

    allStorageTypes.forEach((item: { EWMStorageType_1: string; }) => {
        if (item.EWMStorageType_1 !== '' && !uniqueStorageTypes.some(warehouse => warehouse.EWMStorageType === item.EWMStorageType_1)) {
            uniqueStorageTypes.push({ EWMStorageType: item.EWMStorageType_1 });
        }
    });

    return uniqueStorageTypes;
}

const getProductionOrders: OnEventHandler = async function (req: TypedRequest<{ ProductionOrder: string }[]>): Promise<{ ProductionOrder: string }[]> {
    const handlingCDS = await connect.to("HUPalletEWM");
    const allOrders = await handlingCDS.run(SELECT.from('YY1_HUPalletEWM').columns('ProductionOrder'));
    let uniqueOrders: { ProductionOrder: string }[] = [];

    allOrders.forEach((item: { ProductionOrder: string; }) => {
        if (item.ProductionOrder !== '' && !uniqueOrders.some(warehouse => warehouse.ProductionOrder === item.ProductionOrder)) {
            uniqueOrders.push({ ProductionOrder: item.ProductionOrder });
        }
    });

    return uniqueOrders;
}

const getAvailabilityQuantity: OnEventHandler = async function (req: TypedRequest<{ AvailableEWMStockQty: string }[]>): Promise<{ QuantityAvailability: string }[]> {
    const handlingCDS = await connect.to("YY1_HUINFOPALLETBOX");
    const allQuantities = await handlingCDS.run(SELECT.from('YY1_HUInfoPalletbox_ewm').columns('AvailableEWMStockQty'));
    let uniqueQuantities: { QuantityAvailability: string }[] = [];
    let quantityAvailabilitySet = new Set<string>();

    allQuantities.forEach((item: { AvailableEWMStockQty: string }) => {
        let quantityAvailability = parseFloat(item.AvailableEWMStockQty) === 0 ? 'No' : 'Yes';

        if (!quantityAvailabilitySet.has(quantityAvailability)) {
            quantityAvailabilitySet.add(quantityAvailability);
            uniqueQuantities.push({ QuantityAvailability: quantityAvailability });
        }
    });

    return uniqueQuantities;
};

const getEWMWarehouseBins: OnEventHandler = async function (req: TypedRequest<{ EWMWarehouse: string }>): Promise<IStorageBins[]> {
    const EWMWarehouse = req.data.EWMWarehouse;
    const storageService = await connect.to("WAREHOUSESTORAGEBIN");
    const { WarehouseStorageBin } = storageService.entities;
    let storageBins: [IStorageBins];
    storageBins = await storageService.run(SELECT.from(WarehouseStorageBin).where({ EWMWarehouse: EWMWarehouse }));
    return storageBins;
}

const getStorageBins: OnEventHandler = async function (req: TypedRequest<IStorageBins[]>): Promise<IStorageBins[]> {
    const storageService = await connect.to("WAREHOUSESTORAGEBIN");
    const { WarehouseStorageBin } = storageService.entities;
    let storageBins: IStorageBins[];

    if (req.query.SELECT?.where) {
        storageBins = await storageService.run(SELECT.from(WarehouseStorageBin).where(req.query.SELECT.where));
    } else {
        storageBins = await storageService.run(SELECT.from(WarehouseStorageBin));
    }

    return storageBins;
};



export {
    getHandlingUnits,
    getStorageBins,
    getEWMWarehouseBins,
    getHandlingUnitStatus,
    moveHandlingUnits,
    getHandlingUnitEWMHouses,
    getHandlingUnitNumbers,
    getProductionOrders,
    getAvailabilityQuantity,
    getVHStorageBins,
    getStorageTypes,
    getMaterials
}