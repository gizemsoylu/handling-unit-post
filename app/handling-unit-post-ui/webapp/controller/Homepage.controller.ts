
import BaseController from "./BaseController";
import formatter from "../model/formatter"
import { Button$ClickEvent } from "sap/ui/webc/main/Button";
import BusyIndicator from "sap/ui/core/BusyIndicator";
import EntryCreateCL from "ui5/antares/entry/v2/EntryCreateCL";
import MessageBox from "sap/m/MessageBox";
import { IStorageBins, IMoveHUtoBin } from "../types/global.types";
import ResponseCL from "ui5/antares/entry/v2/ResponseCL";
import MessageToast from "sap/m/MessageToast";
import { ISubmitResponse } from "ui5/antares/types/entry/submit";
import { FormTypes } from "ui5/antares/types/entry/enums";
import TreeTable from "sap/ui/table/TreeTable";
import Context from "sap/ui/model/Context";
import ODataCreateCL from "ui5/antares/odata/v2/ODataCreateCL";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { smartfield } from "sap/ui/comp/library";
import { Table$RowSelectionChangeEvent } from "sap/ui/table/Table";

/**
 * @namespace com.ndbs.handlingunitpostui.controller
 */
export default class Homepage extends BaseController {
    public formatter = formatter;
    private entry: EntryCreateCL;
    private EWMWarehouse: string;
    private HUNumber: string;

    /* ======================================================================================================================= */
    /* Lifecycle methods                                                                                                       */
    /* ======================================================================================================================= */

    public onInit(): void {

    }

    /* ======================================================================================================================= */
    /* Event Handlers                                                                                                          */
    /* ======================================================================================================================= */

    public onMoveHandlingUnit(event: Button$ClickEvent) {
        const selectesIndex = (this.byId("uiTreeHandlingUnit") as TreeTable).getSelectedIndices() as number[];
        if (!selectesIndex.length) {
            MessageBox.error(this.getResourceBundleText("noSelectedItem"));
        } else {
            BusyIndicator.show(1);

            this.EWMWarehouse = (((this.byId("uiTreeHandlingUnit") as TreeTable)
                .getContextByIndex(selectesIndex[0]) as Context).getObject() as { EWMWarehouse: string }).EWMWarehouse
            this.HUNumber = (((this.byId("uiTreeHandlingUnit") as TreeTable)
                .getContextByIndex(selectesIndex[0]) as Context).getObject() as { HUNumber: string }).HUNumber

            this.entry = new EntryCreateCL<IStorageBins[]>(this, "StorageBins");
            this.entry.setBeginButtonText(this.getResourceBundleText("moveHU"));
            this.entry.setEndButtonText(this.getResourceBundleText("cancel"));
            this.entry.setFormTitle(this.getResourceBundleText("selectBin"));
            this.entry.setReadonlyProperties(["EWMWarehouse"])
            this.entry.setMandatoryProperties(["EWMStorageBin"]);
            this.entry.setExcludedProperties(["EWMStorageType"]);
            this.entry.setTextInEditModeSource([{
                propertyName: "EWMStorageBin",
                textInEditModeSource: smartfield.TextInEditModeSource.ValueList
            }]);
            this.entry.setUseMetadataLabels(true);
            this.entry.setDisableAutoClose(true);
            this.entry.setAutoMandatoryCheck(true);
            this.entry.setFormType(FormTypes.SMART);
            this.entry.registerManualSubmit(this.onMoveHUManualSubmit, this);
            this.entry.attachSubmitCompleted(this.onMoveHUSubmitCompleted, this);

            this.entry.createNewEntry({
                EWMWarehouse: this.EWMWarehouse
            });

            BusyIndicator.hide();
        }
    }

    /* ======================================================================================================================= */
    /* Internal Handlers                                                                                                       */
    /* ======================================================================================================================= */

    private onMoveHUSubmitCompleted(response: ResponseCL<ISubmitResponse>) {
        MessageToast.show(this.getResourceBundle().getText("successMessage") as string);
        this.entry.closeAndDestroyEntryDialog();
    }

    private async onMoveHUManualSubmit(entry: EntryCreateCL) {
        const odata = new ODataCreateCL<IMoveHUtoBin>(this, "moveHUtoBin");
        const path = (entry.getEntryContext() as Context).getPath();
        const EWMStorageBin = (this.getODataModel() as ODataModel).getProperty(path).EWMStorageBin;

        odata.setData({
            EWMWarehouse: this.EWMWarehouse,
            SourceHandlingUnit: this.HUNumber,
            DestinationStorageBin: EWMStorageBin,
            DestinationStorageType: "S910",
            WarehouseProcessType: "S400",
        });

        await odata.create();
        this.entry.closeAndDestroyEntryDialog();
    }

    private async onHUSelectionChange(event: Table$RowSelectionChangeEvent) {
        const rowContext = event.getParameter("rowContext") as Context;
        const level = (rowContext.getObject() as { HierarchyLevel: number }).HierarchyLevel;
        const path = rowContext.getPath();
    }
}
