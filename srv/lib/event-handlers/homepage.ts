import { OnEventHandler, TypedRequest, connect, operator } from "@sap/cds";
import { IHandlingUnits, IHandlingUnitItems, IHandlingUnitsArray, IWhereClause, IStorageBins, IMoveStorageBins } from "../../types/homepage.types";
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

    nodeList.$count = nodeList.length;
    return nodeList;
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


const getHandlingUnitStatus: OnEventHandler = async function (req: TypedRequest<{ HandlingUnitStatus: string }[]>): Promise<{ HUStatus: string }[]> {
    const DataOperation = new DataOperations()
    const handlingCDS = await connect.to("HUPalletEWM");
    const { YY1_HUPalletEWM } = handlingCDS.entities;
    let huPallets = await handlingCDS.run(SELECT.from(YY1_HUPalletEWM).columns('HandlingUnitStatus'));
    const uniqueStatuses = [...new Set<string>(huPallets.map((item: { HandlingUnitStatus: string; }) => item.HandlingUnitStatus))];
    const formattedStatuses = uniqueStatuses.map(status => ({ HUStatus: DataOperation.convertStatus(status) }));

    return formattedStatuses;
}

const moveHandlingUnits: OnEventHandler = async function (req: TypedRequest<IMoveStorageBins>): Promise<void> {
    try {
        const { DestinationStorageBin, DestinationStorageType, SourceHandlingUnit, WarehouseProcessType, EWMWarehouse } = req.data;
        const body = { DestinationStorageBin, DestinationStorageType, SourceHandlingUnit, WarehouseProcessType, EWMWarehouse };
        const warehouseOrderSrv = await connect.to("WAREHOUSEORDER");
        const response = await warehouseOrderSrv.send("POST", "/WarehouseTask", body);
        return response

    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`${error.message}`);
        } else {
            throw new Error("Failed to move handling units due to an unexpected error. Please try again later.");
        }
    }
}


export {
    getHandlingUnits,
    getStorageBins,
    getEWMWarehouseBins,
    getHandlingUnitStatus,
    moveHandlingUnits
}