import { OnEventHandler, TypedRequest, connect, operator } from "@sap/cds";
import { IHandlingUnits, IHandlingUnitItems, IHandlingUnitsArray, IWhereClause, IStorageBins } from "../../types/homepage.types";
import FilterOperations from "../util/FilterOperations";

const getHandlingUnits: OnEventHandler = async function (req: TypedRequest<IHandlingUnits>): Promise<IHandlingUnits[]> {
    const handlingCDS = await connect.to("HUPalletEWM");
    const { YY1_HUPalletEWM } = handlingCDS.entities;
    let huPallets = await handlingCDS.run(SELECT.from(YY1_HUPalletEWM));

    const parentNodeMap: { [key: string]: number } = {};
    let nodeList: IHandlingUnitsArray = [];
    let nodeId = 1;

    huPallets.forEach((huItems: IHandlingUnitItems) => {
        huItems.QuantityPerHU = huItems.QuantityPerHu ? +huItems.QuantityPerHu : 0;
        huItems.HUNumber = huItems.HandlingUnitNumber.replace(/^0+/, '');
        huItems.SubHUNumber = huItems.HandlingUnitNumber_1.replace(/^0+/, '');
        huItems.HUType = huItems.HandlingUnitType;
        huItems.HUStatus = convertStatus(huItems.HandlingUnitStatus);
        huItems.SubEWMWarehouse = huItems.EWMWarehouse_1;
        huItems.EWMWarehouse = huItems.EWMWarehouse;
        huItems.CreationDate = huItems.CreationDateTime ? huItems.CreationDateTime : null;

        if (!parentNodeMap[huItems.HUNumber]) {
            parentNodeMap[huItems.HUNumber] = nodeId;
            nodeList.push({
                ...huItems,
                ProductionOrder:"",
                PackagingMaterial: "PALLET",
                NodeID: nodeId,
                HierarchyLevel: 0,
                ParentNodeID: null,
                DrillState: "expanded"
            });
            nodeId++;
        }

        if (huItems.SubHUNumber) {
            if (!nodeList.some(node => node.HUNumber === huItems.SubHUNumber && node.ParentNodeID === parentNodeMap[huItems.HUNumber])) {
                nodeList.push({
                    ...huItems,
                    HUNumber: huItems.SubHUNumber.replace(/^0+/, ''),
                    SubHUNumber: "",
                    NodeID: nodeId,
                    HierarchyLevel: 1,
                    ParentNodeID: parentNodeMap[huItems.HUNumber],
                    DrillState: "collapse"
                });
                parentNodeMap[huItems.SubHUNumber] = nodeId;
                nodeId++;
            }
        }
    });

    nodeList.forEach(node => {
        if (node.HierarchyLevel === 0) {
            const childNodes = nodeList.filter(child => child.ParentNodeID === node.NodeID);
            const hasChild = childNodes.length > 0;
            node.DrillState = hasChild ? "expanded" : "collapse";
            node.SubHUNumber = hasChild ? "" : node.SubHUNumber;
            node.CreationDate = hasChild ? null : node.CreationDate;

            if (hasChild) {
                const allSameMaterial = childNodes.every(child => child.MaterialNumber === childNodes[0].MaterialNumber);
                const allSameStatus = childNodes.every(child => child.HUStatus === childNodes[0].HUStatus);
                if (allSameMaterial) {
                    node.MaterialNumber = childNodes[0].MaterialNumber;
                    node.QuantityPerHU = childNodes.reduce((sum, child) => sum + (child.QuantityPerHU || 0), 0);
                } else {
                    node.MaterialNumber = "Multiple Materials";
                    node.QuantityPerHU = null;
                }
                if (allSameStatus) {
                    node.HUStatus = childNodes[0].HUStatus;
                } else {
                    node.HUStatus = "";
                }
            }
        }
    });

    if (req.query.SELECT?.where) {
        const filters = req.query.SELECT.where as unknown as IWhereClause[];
        const filteredNodeList: IHandlingUnitsArray = nodeList.filter(node => {
            const field = filters[0].ref[0];
            const value = filters[2].val;
            switch (filters[1] as unknown as string) {
                case '=':
                    return node[field] == value;
                default:
                    return true;
            }
        });
        filteredNodeList.$count = filteredNodeList.length;
        return filteredNodeList;
    }

    nodeList.$count = nodeList.length;
    return nodeList;
};


const getStorageBins: OnEventHandler = async function (req: TypedRequest<{ EWMWarehouse: string }>): Promise<IStorageBins[]> {
    const EWMWarehouse = req.data.EWMWarehouse;
    const storageService = await connect.to("WAREHOUSESTORAGEBIN");
    const { WarehouseStorageBin } = storageService.entities;
    let storageBins: [IStorageBins];
    storageBins = await storageService.run(SELECT.from(WarehouseStorageBin).where({ EWMWarehouse: EWMWarehouse }));
    return storageBins;
}

const getHandlingUnitStatus: OnEventHandler = async function (req: TypedRequest<{ HandlingUnitStatus: string }[]>): Promise<{ HUStatus: string }[]> {
    const handlingCDS = await connect.to("HUPalletEWM");
    const { YY1_HUPalletEWM } = handlingCDS.entities;
    let huPallets = await handlingCDS.run(SELECT.from(YY1_HUPalletEWM).columns('HandlingUnitStatus'));
    const uniqueStatuses = [...new Set<string>(huPallets.map((item: { HandlingUnitStatus: string; }) => item.HandlingUnitStatus))];
    const formattedStatuses = uniqueStatuses.map(status => ({ HUStatus: convertStatus(status) }));

    return formattedStatuses;
}

const convertStatus = (status: string): string => {
    switch (status) {
        case 'A':
            return 'Planned';
        case 'B':
            return 'Received';
        case 'C':
            return 'Shipped';
        default:
            return '';
    }
};

export {
    getHandlingUnits,
    getStorageBins,
    getHandlingUnitStatus
}