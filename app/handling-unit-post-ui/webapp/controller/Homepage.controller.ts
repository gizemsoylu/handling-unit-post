
import BaseController from "./BaseController";
import formatter from "../model/formatter"
import { Button$ClickEvent } from "sap/ui/webc/main/Button";
import BusyIndicator from "sap/ui/core/BusyIndicator";
import EntryCreateCL from "ui5/antares/entry/v2/EntryCreateCL";
import MessageBox from "sap/m/MessageBox";
import { IStorageBins } from "../types/global.types";
import ResponseCL from "ui5/antares/entry/v2/ResponseCL";
import MessageToast from "sap/m/MessageToast";
import { ISubmitResponse } from "ui5/antares/types/entry/submit";
import { FormTypes } from "ui5/antares/types/entry/enums";
import ValueHelpCL from "ui5/antares/ui/ValueHelpCL";
import JSONModel from "sap/ui/model/json/JSONModel";
import TreeTable from "sap/ui/table/TreeTable";
import Context from "sap/ui/model/Context";
import ValidationLogicCL from "ui5/antares/ui/ValidationLogicCL";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import { Input$ValueHelpRequestEvent } from "sap/m/Input";


/**
 * @namespace com.ndbs.handlingunitpostui.controller
 */
export default class Homepage extends BaseController {
    public formatter = formatter;
    private entry: EntryCreateCL;

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

            const EWMWarehouse = (((this.byId("uiTreeHandlingUnit") as TreeTable)
                .getContextByIndex(selectesIndex[0]) as Context).getObject() as { EWMWarehouse: string }).EWMWarehouse

            this.entry = new EntryCreateCL<IStorageBins[]>(this, "StorageBins");
            this.entry.setBeginButtonText(this.getResourceBundleText("moveHU"));
            this.entry.setEndButtonText(this.getResourceBundleText("cancel"));
            this.entry.setFormTitle(this.getResourceBundleText("selectBin"));
            this.entry.setReadonlyProperties(["EWMWarehouse"])
            this.entry.setMandatoryProperties(["EWMStorageBin"]);
            this.entry.setExcludedProperties(["EWMStorageType"]);
            this.entry.setUseMetadataLabels(true);
            this.entry.setDisableAutoClose(true);
            this.entry.setAutoMandatoryCheck(true);
            this.entry.setFormType(FormTypes.SMART);
            this.entry.attachSubmitCompleted(this.onMoveHUSubmitCompleted, this);
      
            this.entry.createNewEntry({
                EWMWarehouse: EWMWarehouse
            });

            BusyIndicator.hide();
        }
    }

    /* ======================================================================================================================= */
    /* Private Handlers                                                                                                        */
    /* ======================================================================================================================= */
    private onMoveHUSubmitCompleted(response: ResponseCL<ISubmitResponse>) {
        MessageToast.show(this.getResourceBundle().getText("successMessage") as string);
        this.entry.closeAndDestroyEntryDialog();
    }
}
