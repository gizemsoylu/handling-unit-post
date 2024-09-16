import { OnEventHandler, TypedRequest, connect, operator } from "@sap/cds";
import { IHandlingUnits, IHandlingUnitItems, IHandlingUnitsArray, IWhereClause, IStorageBins, IMoveStorageBins, IOrderByClause, IMoveHUBody } from "../../types/homepage.types";
import FilterOperations from "../util/FilterOperations";
import DataOperations from "../util/DataOperations";

const getHandlingUnits: OnEventHandler = async function (req: TypedRequest<IHandlingUnits>): Promise<IHandlingUnits[]> {
    const handlingCDS = await connect.to("YY1_HUINFOPALLETBOX");
    const { YY1_HUInfoPalletbox_ewm } = handlingCDS.entities;

    let huPallets = await handlingCDS.run(
        SELECT.from(YY1_HUInfoPalletbox_ewm));

    const dataOperations = new DataOperations();
    const filterOperations = new FilterOperations();

    const parentNodeMap = new Map<string, { nodeId: number, subNodes: string[] }>();
    let nodeList: IHandlingUnitsArray = [];
    let nodeId = 1;

    huPallets = huPallets.filter((huItems: IHandlingUnitItems) => huItems.HandlingUnitIndicator !== 'A');

    huPallets.forEach((huItems: IHandlingUnitItems) => {
        huItems = dataOperations.formatHUItems(huItems);
    });

    huPallets.forEach(huItems => {
        const result = dataOperations.handleParentNode(parentNodeMap, huItems, nodeList, nodeId);
        nodeList = result.nodeList;
        nodeId = result.nodeId;
    });

    huPallets.forEach(huItems => {
        const result = dataOperations.handleChildNodes(parentNodeMap, huItems, nodeList, nodeId);
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

            const maxRetries = 3;
            let attempt = 0;
            let success = false;
            let lastErrorMessage = ""; 

            while (attempt < maxRetries && !success) {
                try {
                    const response = await warehouseOrderSrv.send("POST", "/WarehouseTask", body);
                    success = true;
                    return response; 
                } catch (error) {
                    attempt++;

                    if (error instanceof Error) {
                        lastErrorMessage = error.message;

                        if (error.message.includes("blocked") && attempt < maxRetries) {
                            continue; 
                        }
                    } else {
                        lastErrorMessage = "Unknown error has occured.Please contact with your administrator.";
                    }
                }
            }

            if (!success) {
                req.error({
                    code: 'Create-Warehouse-Task',
                    message: lastErrorMessage, 
                    target: 'EWMStorageBin',
                    status: 500
                });
            }
        }));
    } catch (error) {
        if (error instanceof Error) {
            req.error({
                code: 'Create-Warehouse-Task',
                message: error.message,
                target: 'EWMStorageBin',
                status: 500
            });
        } else {
            req.error({
                code: 'Create-Warehouse-Task',
                message: "Unknown error has occured.Please contact with your administrator.",
                target: 'EWMStorageBin',
                status: 500
            });
        }
    }
};

/* ======================================================================================================================= */
/* Value Help Operations                                                                                                   */
/* ======================================================================================================================= */

const getHandlingUnitStatus: OnEventHandler = async function (req: TypedRequest<{ HandlingUnitStatus: string }[]>): Promise<{ HUStatus: string }[]> {
    return [{ HUStatus: "Planned" }, { HUStatus: "Received" }];
}

const getHandlingUnitEWMHouses: OnEventHandler = async function (req: TypedRequest<{ EWMWarehouse: string }[]>): Promise<{ EWMWarehouse: string }[]> {
    const handlingCDS = await connect.to("YY1_HUINFOPALLETBOX");
    const allEWMWarehouses = await handlingCDS.run(SELECT.from('YY1_HUInfoPalletbox_ewm').columns('EWMWarehouse').where({
        PackagingMaterialType: ['Z001', 'Z002']
    }));
    let uniqueEWMWarehouses: { EWMWarehouse: string }[] = [];

    allEWMWarehouses.forEach((item: { EWMWarehouse: string; }) => {
        if (item.EWMWarehouse !== '' && !uniqueEWMWarehouses.some(warehouse => warehouse.EWMWarehouse === item.EWMWarehouse)) {
            uniqueEWMWarehouses.push({ EWMWarehouse: item.EWMWarehouse });
        }
    });

    return uniqueEWMWarehouses;
}

const getHandlingUnitNumbers: OnEventHandler = async function (req: TypedRequest<{ HandlingUnitNumber: string }[]>): Promise<{ HUNumber: string }[]> {
    const handlingCDS = await connect.to("YY1_HUINFOPALLETBOX");
    const allHUs = await handlingCDS.run(SELECT.from('YY1_HUInfoPalletbox_ewm').columns('HandlingUnitNumber').where({
        PackagingMaterialType: ['Z001', 'Z002']
    }));
    let uniqueHUs: { HUNumber: string }[] = [];

    allHUs.forEach((item: { HandlingUnitNumber: string; }) => {
        if (item.HandlingUnitNumber !== '' && !uniqueHUs.some(warehouse => warehouse.HUNumber === item.HandlingUnitNumber)) {
            uniqueHUs.push({ HUNumber: item.HandlingUnitNumber.replace(/^0+/, '') });
        }
    });

    if (req.query.SELECT?.search) {
        const filters = req.query.SELECT.search as unknown as IWhereClause[];
        const searchValues = filters.map(filter => filter.val as string);

        uniqueHUs = uniqueHUs.filter((hu: { HUNumber: string }) =>
            searchValues.some(searchValue => hu.HUNumber.includes(searchValue))
        );
    } else {
        uniqueHUs = uniqueHUs.map(hu => ({ HUNumber: hu.HUNumber }));
    }

    return uniqueHUs;
};

const getProducts: OnEventHandler = async function (req: TypedRequest<{ Product: string }[]>): Promise<{ Product: string }[]> {
    const handlingCDS = await connect.to("YY1_HUINFOPALLETBOX");
    const allProduct = await handlingCDS.run(SELECT.from('YY1_HUInfoPalletbox_ewm').columns('Product'));
    let uniqueProduct: { Product: string }[] = [];

    allProduct.forEach((item: { Product: string; }) => {
        if (item.Product !== '' && !uniqueProduct.some(warehouse => warehouse.Product === item.Product)) {
            uniqueProduct.push({ Product: item.Product });
        }
    });

    return uniqueProduct;
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
    const allStorageTypes = await handlingCDS.run(SELECT.from('YY1_HUInfoPalletbox_ewm').columns('EWMStorageType_1').where({
        PackagingMaterialType: ['Z001', 'Z002']
    }));
    let uniqueStorageTypes: { EWMStorageType: string }[] = [];

    allStorageTypes.forEach((item: { EWMStorageType_1: string; }) => {
        if (item.EWMStorageType_1 !== '' && !uniqueStorageTypes.some(warehouse => warehouse.EWMStorageType === item.EWMStorageType_1)) {
            uniqueStorageTypes.push({ EWMStorageType: item.EWMStorageType_1 });
        }
    });

    return uniqueStorageTypes;
}

const getProductionOrders: OnEventHandler = async function (req: TypedRequest<{ ProductionOrder: string }[]>): Promise<{ ProductionOrder: string }[]> {
    const handlingCDS = await connect.to("YY1_HUINFOPALLETBOX");
    const allOrders = await handlingCDS.run(SELECT.from('YY1_HUInfoPalletbox_ewm').columns('ProductionOrder'));
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
    getVHStorageBins,
    getStorageTypes,
    getProducts
}