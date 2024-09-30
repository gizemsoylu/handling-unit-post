import ResourceBundle from "sap/base/i18n/ResourceBundle";
import UIComponent from "sap/ui/core/UIComponent";
import Controller from "sap/ui/core/mvc/Controller";
import Router from "sap/ui/core/routing/Router";
import Model from "sap/ui/model/Model";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import { ApplicationModels, DefaultMessages } from "../types/global.types";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import View from "sap/ui/core/mvc/View";
import Button, { Button$PressEvent } from "sap/m/Button";
import FragmentCL from "ui5/antares/ui/FragmentCL";
import Messaging from "sap/ui/core/Messaging";

/**
 * @namespace com.ndbs.handlingunitpostui.controller
 */
export default class BaseController extends Controller {

    private messagePopover: FragmentCL;

    /* ======================================================================================================================= */
    /* Global Methods                                                                                                          */
    /* ======================================================================================================================= */

    public getODataModel(modelName?: ApplicationModels): ODataModel {
        return (this.getView() as View).getModel(modelName) as ODataModel;
    }

    public getComponentModel(modelName?: ApplicationModels): ODataModel {
        return (this.getOwnerComponent() as UIComponent).getModel(modelName) as ODataModel;
    }

    public getRouter(): Router {
        return (this.getOwnerComponent() as UIComponent).getRouter();
    }

    public getModel(modelName?: ApplicationModels): Model {
        return this.getView()?.getModel(modelName)!;
    }

    public setModel(oModel: Model, modelName?: string): void {
        this.getView()?.setModel(oModel, modelName);
    }

    public getResourceBundle(): ResourceBundle {
        return (((this.getOwnerComponent() as UIComponent).getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle);
    }

    public getResourceBundleText(key: string, parameters?: any[]): string {
        const resourceBundle = this.getResourceBundle();
        return resourceBundle.getText(key, parameters, true) || DefaultMessages.NO_I18N_TEXT;
    }

    public openMessagePopover(): void {
        const view = this.getView() as View;
        (view.byId("btnMessages") as Button).firePress();
    }

    public openMessagePopoverAutoClose(): void {
        ((this.getView() as View).byId("btnMessages") as Button).firePress();
        setTimeout(() => {
            this.messagePopover.closeAndDestroy();
        }, 3000);
    }

    public onMessagePopoverPress(event: Button$PressEvent): void {
            this.messagePopover = new FragmentCL(this, "com.ndbs.handlingunitpostui.fragments.MessagePopover", event.getSource());
            this.messagePopover.setAutoDestroyOnESC(true);
            this.messagePopover.openAsync(true);  
    }

    public onClearMessages(): void {
        Messaging.removeAllMessages();
    }
} 