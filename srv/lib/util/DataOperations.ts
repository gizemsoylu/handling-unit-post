import { IHandlingUnitItems, IHandlingUnitsArray } from "../../types/homepage.types";

export default class DataOperations {
    public convertStatus(HandlingUnitStatus: string): string {
        switch (HandlingUnitStatus) {
            case 'A':
                return 'Planned';
            case 'B':
                return 'Received';
            case 'C':
                return 'Shipped';
            default:
                return '';
        }
    }

    public formatHUItems(huItems: IHandlingUnitItems): IHandlingUnitItems {
        huItems.QuantityPerHU = huItems.QuantityPerHu ? +huItems.QuantityPerHu : 0;
        huItems.HUNumber = huItems.HandlingUnitNumber.replace(/^0+/, '');
        huItems.SubHUNumber = huItems.HandlingUnitNumber_1.replace(/^0+/, '');
        huItems.HUType = huItems.HandlingUnitType;
        huItems.HUStatus = this.convertStatus(huItems.HandlingUnitStatus);
        huItems.SubEWMWarehouse = huItems.EWMWarehouse_1;
        huItems.EWMWarehouse = huItems.EWMWarehouse;
        huItems.CreationDate = huItems.CreationDateTime || null;
        huItems.EWMStorageBin = huItems.EWMStorageBin || '';
        huItems.EWMStorageType = huItems.EWMStorageType || '';
        return huItems;
    }

    public handleParentNode(
        huItems: IHandlingUnitItems,
        parentNodeMap: { [key: string]: number },
        nodeList: IHandlingUnitsArray,
        nodeId: number,
        huDetails: IHandlingUnitItems[]
    ): { nodeList: IHandlingUnitsArray, nodeId: number } {
        if (!parentNodeMap[huItems.HUNumber]) {
            const details = huDetails.find(detail => detail.HandlingUnitNumber.replace(/^0+/, '') === huItems.HUNumber);
            const quantity = details ? details.AvailableEWMStockQty  : 0;
            
            parentNodeMap[huItems.HUNumber] = nodeId;
            nodeList.push({
                ...huItems,
                QuantityAvailability: quantity === 0 ? 'No' : 'Yes',
                ProductionOrder: "",
                PackagingMaterial: "PALLET",
                NodeID: nodeId,
                HierarchyLevel: 0,
                ParentNodeID: null,
                DrillState: "expanded",
                QuantityPerHU: quantity
            });
            nodeId++;
        }
        return { nodeList, nodeId };
    }

    public handleChildNode(
        huItems: IHandlingUnitItems,
        parentNodeMap: { [key: string]: number },
        nodeList: IHandlingUnitsArray,
        nodeId: number,
        huDetails: IHandlingUnitItems[]
    ): { nodeList: IHandlingUnitsArray, nodeId: number } {
        if (huItems.SubHUNumber) {
            parentNodeMap[huItems.SubHUNumber] = nodeId;
            nodeList.push({
                ...huItems,
                QuantityAvailability: huItems.QuantityPerHU === 0 ? 'No' : 'Yes',
                HUNumber: huItems.SubHUNumber.replace(/^0+/, ''),
                SubHUNumber: "",
                NodeID: nodeId,
                HierarchyLevel: 1,
                ParentNodeID: parentNodeMap[huItems.HUNumber],
                DrillState: "collapse",
                QuantityPerHU: huItems.QuantityPerHU
            });
            nodeId++;
        }
        return { nodeList, nodeId };
    }

    public updateNodeList(nodeList: IHandlingUnitsArray, huDetails: IHandlingUnitItems[]): IHandlingUnitsArray {
        nodeList.forEach(node => {
            if (node.HierarchyLevel === 0) {
                const childNodes = nodeList.filter(child => child.ParentNodeID === node.NodeID);
                const hasChild = childNodes.length > 0;
                node.DrillState = hasChild ? "expanded" : "collapse";
                node.SubHUNumber = hasChild ? "" : node.SubHUNumber;
    
                if (hasChild) {
                    const allSameMaterial = childNodes.every(child => child.MaterialNumber === childNodes[0].MaterialNumber);
                    const allSameStatus = childNodes.every(child => child.HUStatus === childNodes[0].HUStatus);
                    const allIsCompleted = childNodes.every(child => child.EWMHUProcessStepIsCompleted === childNodes[0].EWMHUProcessStepIsCompleted);
                    node.MaterialNumber = allSameMaterial ? childNodes[0].MaterialNumber : "Multiple Materials";
                    node.HUStatus = allSameStatus ? childNodes[0].HUStatus : "";
                    node.EWMHUProcessStepIsCompleted = allIsCompleted ? childNodes[0].EWMHUProcessStepIsCompleted : false;
                }
            }
        });
        return nodeList;
    }
}