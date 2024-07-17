import { OnEventHandler, TypedRequest, connect, operator } from "@sap/cds";
import { IHandlingUnits, IHandlingUnitItems, IHandlingUnitsArray, IWhereClause, IStorageBins, IMoveStorageBins, IOrderByClause } from "../../types/homepage.types";
import FilterOperations from "../util/FilterOperations";
import DataOperations from "../util/DataOperations";

const getHandlingUnits: OnEventHandler = async function (req: TypedRequest<IHandlingUnits>): Promise<IHandlingUnits[]> {
    const handlingCDS = await connect.to("HUPalletEWM");
    const { YY1_HUPalletEWM } = handlingCDS.entities;
    let huPallets = await handlingCDS.run(SELECT.from(YY1_HUPalletEWM));

    const dataOperations = new DataOperations();
    const filterOperations = new FilterOperations();

    const parentNodeMap: { [key: string]: number } = {};
    let nodeList: IHandlingUnitsArray = [];
    let nodeId = 1;

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
        const orderBy = req.query.SELECT.orderBy as unknown as IOrderByClause;
        nodeList = filterOperations.sortNodes(nodeList, orderBy);
    }

    nodeList.$count = nodeList.length;
    return nodeList;
};


const moveHandlingUnits: OnEventHandler = async function (req: TypedRequest<IMoveStorageBins>): Promise<void> {
    try {
        const { DestinationStorageBin, DestinationStorageType, SourceHandlingUnit, WarehouseProcessType, EWMWarehouse } = req.data;
        const body = { DestinationStorageBin, DestinationStorageType, SourceHandlingUnit, WarehouseProcessType, EWMWarehouse };
        const warehouseOrderSrv = await connect.to("WAREHOUSEORDER");
        const response = await warehouseOrderSrv.send("POST", "/WarehouseTask", body);
        req.reply(response);

    } catch (error) {
        if (error instanceof Error) {
            req.error(`${error.message}`);
        } else {
            req.error("Failed to move handling units due to an unexpected error. Please try again later.");
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
            uniqueHUs.push({ HUNumber: item.HandlingUnitNumber.replace(/^0+/, '')});
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
    getMaterials
}