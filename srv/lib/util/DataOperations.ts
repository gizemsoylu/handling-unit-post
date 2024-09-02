import { IHandlingUnitItems, IHandlingUnitsArray } from "../../types/homepage.types";

export default class DataOperations {
    public formatHUItems(huItems: IHandlingUnitItems): IHandlingUnitItems {
        huItems.QuantityPerHU = huItems.AvailableEWMStockQty ? +huItems.AvailableEWMStockQty : 0;
        huItems.HUNumber = huItems.HandlingUnitNumber.replace(/^0+/, '');
        huItems.SubHUNumber = huItems.HandlingUnitNumber !== huItems.HandlingUnitNumber_1 ? huItems.HandlingUnitNumber_1.replace(/^0+/, '') : "";
        huItems.HUType = huItems.HandlingUnitType;
        huItems.HUStatus = +huItems.AvailableEWMStockQty > 0 ? 'Received' : 'Planned' ;
        huItems.SubEWMWarehouse = huItems.EWMWarehouse_1;
        huItems.EWMWarehouse = huItems.EWMWarehouse;
        huItems.CreationDate = huItems.CreationDateTime || null;
        huItems.EWMStorageBin = huItems.EWMStorageBin_1 || '';
        huItems.EWMStorageType = huItems.EWMStorageType_1 || '';
        huItems.PackagingMaterialType = huItems.PackagingMaterialType || '';
        huItems.PackagingMaterialType = huItems.PackagingMaterialType || '';
        huItems.HandlingUnitTopLevelInd = huItems.HandlingUnitTopLevelInd || '',
        huItems.HandlingUnitBottomInd = huItems.HandlingUnitBottomInd || ''
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
        parentNodeMap: Map<string, { nodeId: number, subNodes: string[] }>,
        huItems: IHandlingUnitItems,
        nodeList: IHandlingUnitsArray,
        nodeId: number
    ): { nodeList: IHandlingUnitsArray, nodeId: number } {

        if(huItems.HUNumber !== huItems.SubHUNumber){
            for (let [parentHU, parentNode] of parentNodeMap.entries()) {
                if (parentNode.subNodes.includes(huItems.HUNumber)) { 
                    const parentStorageBins = nodeList
                        .filter(item => item.NodeID === parentNode.nodeId)
                        .map(item => item.EWMStorageBin);
    
                    const parentStorageTypes = nodeList
                        .filter(item => item.NodeID === parentNode.nodeId)
                        .map(item => item.EWMStorageType);
    
                    const parentProduct = nodeList
                        .filter(item => item.NodeID === parentNode.nodeId)
                        .map(item => {
                            if (+item.AvailableEWMStockQty > 0) {
                                return item.Product;
                            } else {
                                return item.MaterialNumber;
                            }
                        });
    
                    nodeList.push({
                        ...huItems,
                        HUNumber: huItems.HUNumber.replace(/^0+/, ''),
                        PackagingMaterial: huItems.PackagingMaterialType,
                        SubHUNumber: "",
                        NodeID: nodeId,
                        HierarchyLevel: 1,
                        ParentNodeID: parentNode.nodeId,
                        DrillState: "collapse",
                        QuantityPerHU: +huItems.EWMStockQuantityInBaseUnit_1 || 0,
                        EWMStorageBin: parentStorageBins.length ? parentStorageBins[0] : "",
                        EWMStorageType: parentStorageTypes.length ? parentStorageTypes[0] : "",
                        Product: parentProduct.length ? parentProduct[0] : "",
                        ProductionOrder: huItems.ProductionOrder || "",
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
                    const allSameStatus = childNodes.every(child => child.HUStatus === childNodes[0].HUStatus);
                    const allSameProductionOrder = childNodes.every(child => child.ProductionOrder === childNodes[0].ProductionOrder);
                    const allIsCompleted = childNodes.every(child => child.EWMHUProcessStepIsCompleted === childNodes[0].EWMHUProcessStepIsCompleted);
                    node.Product = allSameProduct ? childNodes[0].Product : "Multiple Product";
                    node.ProductionOrder = allSameProductionOrder ? childNodes[0].ProductionOrder : "Multiple Production Order";
                    node.HUStatus = allSameStatus ? childNodes[0].HUStatus : "";
                    node.EWMHUProcessStepIsCompleted = allIsCompleted ? childNodes[0].EWMHUProcessStepIsCompleted : false;
                }
            }
        });
        return nodeList;
    }
}