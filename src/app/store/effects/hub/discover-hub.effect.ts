import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, combineLatestWith, map, mergeMap, of, switchMap, takeUntil, tap } from 'rxjs';
import { IHub, MessageLoggingMiddleware, connectHub } from 'rxpoweredup';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { APP_CONFIG, IAppConfig, NAVIGATOR, PrefixedConsoleLoggerFactoryService } from '@app/shared';
import { HUBS_ACTIONS, HUB_STATS_ACTIONS, HubStorageService } from '@app/store';

import { HubCommunicationNotifierMiddlewareFactoryService } from '../../hub-communication-notifier-middleware-factory.service';

export const DISCOVER_HUB_EFFECT = createEffect((
    actions$: Actions = inject(Actions),
    navigator: Navigator = inject(NAVIGATOR),
    communicationNotifierMiddlewareFactory: HubCommunicationNotifierMiddlewareFactoryService = inject(HubCommunicationNotifierMiddlewareFactoryService),
    prefixedConsoleLoggerFactory: PrefixedConsoleLoggerFactoryService = inject(PrefixedConsoleLoggerFactoryService),
    store: Store = inject(Store),
    hubStorage: HubStorageService = inject(HubStorageService),
    config: IAppConfig = inject(APP_CONFIG)
) => {
    return actions$.pipe(
        ofType(HUBS_ACTIONS.startDiscovery),
        mergeMap(() => {
            const incomingLoggerMiddleware = new MessageLoggingMiddleware(prefixedConsoleLoggerFactory.create('<'), 'all');
            const outgoingLoggerMiddleware = new MessageLoggingMiddleware(prefixedConsoleLoggerFactory.create('>'), 'all');
            const communicationNotifierMiddleware = communicationNotifierMiddlewareFactory.create();

            return connectHub(
                navigator.bluetooth,
                {
                    incomingMessageMiddleware: [ incomingLoggerMiddleware, communicationNotifierMiddleware ],
                    outgoingMessageMiddleware: [ outgoingLoggerMiddleware, communicationNotifierMiddleware ],
                    messageSendTimeout: config.messageSendTimeout,
                    maxMessageSendAttempts: config.maxMessageSendAttempts,
                    initialMessageSendRetryDelayMs: config.initialMessageSendRetryDelayMs
                }
            ).pipe(
                switchMap((hub: IHub) => {
                    return of(hub).pipe(
                        combineLatestWith(
                            hub.properties.getPrimaryMacAddress(),
                            hub.properties.getAdvertisingName()
                        )
                    );
                }),
                tap(([ hub, macAddressReply ]) => {
                    communicationNotifierMiddleware.communicationNotifier$.pipe(
                        takeUntil(hub.disconnected)
                    ).subscribe((v) => {
                        store.dispatch(HUB_STATS_ACTIONS.setHasCommunication({ hubId: macAddressReply, hasCommunication: v }));
                    });
                    hubStorage.store(hub, macAddressReply);
                }),
                map(([ , macAddressReply, name ]) => HUBS_ACTIONS.connected({ hubId: macAddressReply, name })),
                catchError((error: Error) => {
                    return of(HUBS_ACTIONS.deviceConnectFailed({ error }));
                })
            );
        })
    );
}, { functional: true });
