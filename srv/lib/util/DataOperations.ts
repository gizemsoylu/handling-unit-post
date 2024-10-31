import { IHandlingUnitItems, IHandlingUnitsArray } from "../../types/homepage.types";

export default class DataOperations {
    public formatHUItems(huItems: IHandlingUnitItems): IHandlingUnitItems {
        huItems.QuantityPerHU = huItems.AvailableEWMStockQty ? +huItems.AvailableEWMStockQty : 0;
        huItems.HUNumber = huItems.HandlingUnitNumber.replace(/^0+/, '');
        huItems.SubHUNumber = huItems.HandlingUnitNumber !== huItems.HandlingUnitNumber_1 ? huItems.HandlingUnitNumber_1.replace(/^0+/, '') : "";
        huItems.HUType = huItems.HandlingUnitType;
        huItems.SubEWMWarehouse = huItems.EWMWarehouse_1;
        huItems.EWMWarehouse = huItems.EWMWarehouse;
        huItems.CreationDate = huItems.CreationDateTime || null;
        huItems.EWMStorageBin = huItems.EWMStorageBin_1 || '';
        huItems.EWMStorageType = huItems.EWMStorageType_1 || '';
        huItems.PackagingMaterialType = huItems.PackagingMaterialType || '';
        huItems.PackagingMaterialType = huItems.PackagingMaterialType || '';
        huItems.HandlingUnitTopLevelInd = huItems.HandlingUnitTopLevelInd || '',
        huItems.HandlingUnitBottomInd = huItems.HandlingUnitBottomInd || '',
        huItems.ProductionOrder = huItems.ProductionOrder
        return huItems;
    }

    public handleParentNode(
        parentNodeMap: Map<string, { nodeId: number, subNodes: string[] }>,
        huItems: IHandlingUnitItems,
        nodeList: IHandlingUnitsArray,
        nodeId: number
    ): { nodeList: IHandlingUnitsArray, nodeId: number } {

        if (huItems.HandlingUnitTopLevelInd) {
            if (!parentNodeMap.has(huItems.HUNumber)) {
                parentNodeMap.set(huItems.HUNumber, {
                    nodeId: nodeId,
                    subNodes: []
                });

                nodeList.push({
                    ...huItems,
                    PackagingMaterial: huItems.PackagingMaterialType,
                    NodeID: nodeId,
                    HierarchyLevel: 0,
                    ParentNodeID: null,
                    DrillState: "expanded",
                    QuantityPerHU: +huItems.AvailableEWMStockQty > 0 ? +huItems.AvailableEWMStockQty : +huItems.QuantityPerHu,
                    EWMStorageBin: huItems.EWMStorageBin_1,
                    EWMStorageType: huItems.EWMStorageType_1,
                    ProductionOrder: huItems.ProductionOrder,
                    Product: +huItems.AvailableEWMStockQty > 0 ? huItems.Product : huItems.MaterialNumber,
                    HUStatus: +huItems.AvailableEWMStockQty > 0 ? 'Received' : 'Planned'
                });

                nodeId++;
            }

            if (huItems.SubHUNumber) {
                const parentHUData = parentNodeMap.get(huItems.HUNumber);
                if (parentHUData) {
                    parentHUData.subNodes.push(huItems.SubHUNumber);
                }
            }
        }

        return { nodeList, nodeId };
    }

    public handleChildNodes(
        parentNodeMap: Map<string, {
            nodeId: number; subNodes: string[];
        }>, huItems: IHandlingUnitItems, nodeList: IHandlingUnitsArray, nodeId: number, huPallets: IHandlingUnitsArray): { nodeList: IHandlingUnitsArray, nodeId: number } {

        if (huItems.HUNumber !== huItems.SubHUNumber) {
            for (let [parentHU, parentNode] of parentNodeMap.entries()) {

                if (parentNode.subNodes.includes(huItems.SubHUNumber)) {
                    const exactSubHU = parentNode.subNodes.filter(subNode => subNode === huItems.SubHUNumber);
                    const parentHUDetail = huPallets.filter(item => item.SubHUNumber == exactSubHU[0]);
                    const childHUDetail = huPallets.filter(item => item.HUNumber == exactSubHU[0]);

                    nodeList.push({
                        ...huItems,
                        HUNumber: childHUDetail[0].HUNumber,
                        SubHUNumber: "",
                        NodeID: nodeId,
                        HierarchyLevel: 1,
                        ParentNodeID: parentNode.nodeId,
                        DrillState: "collapse",
                        QuantityPerHU: +childHUDetail[0].EWMStockQuantityInBaseUnit_1 || 0,
                        EWMStorageBin: parentHUDetail[0].EWMStorageBin || "",
                        EWMStorageType: parentHUDetail[0].EWMStorageType || "",
                        ProductionOrder: parentHUDetail[0].ProductionOrder || "",
                        Product: +parentHUDetail[0].AvailableEWMStockQty > 0 ? parentHUDetail[0].Product : parentHUDetail[0].MaterialNumber,
                        HUStatus: +parentHUDetail[0].AvailableEWMStockQty > 0 ? 'Received' : 'Planned',
                        PackagingMaterial: parentHUDetail[0].PackagingMaterial || ""
                    });

                    nodeId++;
                    break;
                }
            }

        }

        return { nodeList, nodeId };
    }

    public updateNodeList(nodeList: IHandlingUnitsArray): IHandlingUnitsArray {
        nodeList.forEach(node => {
            if (node.HierarchyLevel === 0) {
                const childNodes = nodeList.filter(child => child.ParentNodeID === node.NodeID);
                const hasChild = childNodes.length > 0;
                node.DrillState = hasChild ? "expanded" : "collapse";
                node.SubHUNumber = hasChild ? "" : node.SubHUNumber;

                if (hasChild) {
                    const allSameProduct = childNodes.every(child => child.Product === childNodes[0].Product);
                    // const allSameStatus = childNodes.every(child => child.HUStatus === childNodes[0].HUStatus);
                    // const allSameCreationDate = childNodes.every(child => child.CreationDate === childNodes[0].CreationDate);
                    // const allSameEWMStorageBin = childNodes.every(child => child.EWMStorageBin === childNodes[0].EWMStorageBin);
                    // const allSameEWMStorageType = childNodes.every(child => child.EWMStorageType === childNodes[0].EWMStorageType);
                    const allSameProductionOrder = childNodes.every(child => child.ProductionOrder === childNodes[0].ProductionOrder);
                    node.Product = allSameProduct ? childNodes[0].Product : "Multiple Products";
                    // node.HUStatus = allSameStatus ? childNodes[0].HUStatus : "Multiple Status";
                    // node.CreationDate = allSameCreationDate ? allSameEWMStorageBin[0].CreationDate : "Multiple Dates";
                    // node.EWMStorageBin = allSameEWMStorageBin ? allSameEWMStorageBin[0].EWMStorageBin : "Multiple Storage Bins";
                    // node.EWMStorageType = allSameEWMStorageType ? allSameEWMStorageType[0].EWMStorageType : "Multiple Storage Types";
                    node.ProductionOrder = allSameProductionOrder ? childNodes[0].ProductionOrder : "Multiple Production Orders";
                }
            }
        });
        return nodeList;
    }
}