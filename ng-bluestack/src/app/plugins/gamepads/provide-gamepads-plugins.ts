import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ControllerDualshockPluginService } from './dualshock';
import { ControllerDefaultPluginService } from './default';
import { GamepadPluginsService } from './gamepad-plugins.service';
import { GamepadPlugin } from './gamepad-plugin';
import { ControllerXbox260PluginService } from './xbox-360';

export function provideGamepadsPlugins(): EnvironmentProviders {
    return makeEnvironmentProviders([
        { provide: GamepadPlugin, useClass: ControllerDualshockPluginService, multi: true },
        { provide: GamepadPlugin, useClass: ControllerXbox260PluginService, multi: true },
        ControllerDefaultPluginService,
        GamepadPluginsService,
    ]);
}
