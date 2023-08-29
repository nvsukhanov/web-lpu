import { APP_INITIALIZER, EnvironmentProviders, isDevMode, makeEnvironmentProviders } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { ActionReducer, ActionReducerMap, MetaReducer, Store, provideStore } from '@ngrx/store';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { localStorageSync } from 'ngrx-store-localstorage';
import { Router } from '@angular/router';
import { NAVIGATOR } from '@app/shared';

import { IState } from './i-state';
import {
    ATTACHED_IOS_FEATURE,
    ATTACHED_IO_MODES_FEATURE,
    ATTACHED_IO_PORT_MODE_INFO_FEATURE,
    ATTACHED_IO_PROPS_FEATURE,
    BLUETOOTH_AVAILABILITY_FEATURE,
    CONTROLLERS_FEATURE,
    CONTROLLER_CONNECTION_FEATURE,
    CONTROLLER_INPUT_FEATURE,
    CONTROLLER_SETTINGS_FEATURE,
    CONTROL_SCHEME_FEATURE,
    HUBS_FEATURE,
    HUB_EDIT_FORM_ACTIVE_SAVES_FEATURE,
    HUB_STATS_FEATURE,
    PORT_TASKS_FEATURE,
    SETTINGS_FEATURE,
} from './reducers';
import {
    AttachedIOsEffects,
    AttachedIoModesEffects,
    CONTROLLER_EFFECTS,
    ControllerProfileFactoryService,
    HubAttachedIosStateEffects,
    HubPortModeInfoEffects,
    HubsEffects,
    NotificationsEffects,
    TaskProcessingEffects,
    provideTaskProcessingFactories
} from './effects';
import { bluetoothAvailabilityCheckFactory } from './bluetooth-availability-check-factory';
import { HubStorageService } from './hub-storage.service';
import { RoutesBuilderService } from '../routing';
import { HUB_STATS_ACTIONS } from './actions';
import { HubFacadeService } from './hub-facade.service';

const STORAGE_VERSION = '16';

const REDUCERS: ActionReducerMap<IState> = {
    bluetoothAvailability: BLUETOOTH_AVAILABILITY_FEATURE.reducer,
    controllers: CONTROLLERS_FEATURE.reducer,
    controllerInput: CONTROLLER_INPUT_FEATURE.reducer,
    controllerSettings: CONTROLLER_SETTINGS_FEATURE.reducer,
    controllerConnections: CONTROLLER_CONNECTION_FEATURE.reducer,
    controlSchemes: CONTROL_SCHEME_FEATURE.reducer,
    hubs: HUBS_FEATURE.reducer,
    hubStats: HUB_STATS_FEATURE.reducer,
    attachedIos: ATTACHED_IOS_FEATURE.reducer,
    attachedIoProps: ATTACHED_IO_PROPS_FEATURE.reducer,
    attachedIoModes: ATTACHED_IO_MODES_FEATURE.reducer,
    attachedIoPortModeInfo: ATTACHED_IO_PORT_MODE_INFO_FEATURE.reducer,
    hubEditFormActiveSaves: HUB_EDIT_FORM_ACTIVE_SAVES_FEATURE.reducer,
    portTasks: PORT_TASKS_FEATURE.reducer,
    router: routerReducer,
    settings: SETTINGS_FEATURE.reducer
};

function localStorageSyncReducer(
    reducer: ActionReducer<IState>
): ActionReducer<IState> {
    return localStorageSync({
        keys: [
            { hubs: [ 'ids', 'entities' ] },
            { attachedIos: [ 'ids', 'entities' ] },
            { controllers: [ 'ids', 'entities' ] },
            { controllerSettings: [ 'ids', 'entities' ] },
            { controlSchemes: [ 'ids', 'entities' ] },
            { attachedIoModes: [ 'ids', 'entities' ] },
            { attachedIoPortModeInfo: [ 'ids', 'entities' ] },
            'settings'
        ], // TODO: add types for this
        rehydrate: true,
        storageKeySerializer: (key: string) => `${STORAGE_VERSION}/${key}`,
    })(reducer);
}

const metaReducers: Array<MetaReducer<IState>> = [ localStorageSyncReducer ];

export function provideApplicationStore(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideStore<IState>(REDUCERS, { metaReducers }),
        provideEffects(
            AttachedIOsEffects,
            HubPortModeInfoEffects,
            AttachedIoModesEffects,
            HubsEffects,
            TaskProcessingEffects,
            NotificationsEffects,
            HubAttachedIosStateEffects,
            CONTROLLER_EFFECTS,
        ),
        provideStoreDevtools({
            maxAge: 100,
            logOnly: !isDevMode(),
            autoPause: true,
            trace: true,
            traceLimit: 75,
            actionsBlocklist: [
                HUB_STATS_ACTIONS.setHasCommunication.type,
                HUB_STATS_ACTIONS.rssiLevelReceived.type,
                HUB_STATS_ACTIONS.batteryLevelReceived.type,
                // CONTROLLER_INPUT_ACTIONS.inputReceived.type
            ]
        }),
        {
            provide: APP_INITIALIZER,
            useFactory: bluetoothAvailabilityCheckFactory,
            deps: [
                NAVIGATOR,
                Store,
                Router,
                RoutesBuilderService
            ],
            multi: true
        },
        HubStorageService,
        HubFacadeService,
        ControllerProfileFactoryService,
        provideRouterStore(),
        provideTaskProcessingFactories()
    ]);
}
