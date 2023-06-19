import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { JsonPipe, NgForOf, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LetDirective } from '@ngrx/component';
import { TranslocoModule } from '@ngneat/transloco';

import { BindingTreeNodeComponent } from './binding-tree-node';
import { IoTreeNodeComponent } from './io-tree-node';
import { HubTreeNodeComponent } from './hub-tree-node';
import { ControlSchemeNodeTypes, ControlSchemeViewTreeNode } from '../../../store';
import { VirtualPortTreeNodeComponent } from './virtual-port-tree-node';

@Component({
    standalone: true,
    selector: 'app-control-scheme-view-io-list',
    templateUrl: './control-scheme-view-io-list.component.html',
    styleUrls: [ './control-scheme-view-io-list.component.scss' ],
    imports: [
        NgForOf,
        NgIf,
        MatCardModule,
        MatTreeModule,
        JsonPipe,
        MatButtonModule,
        MatIconModule,
        LetDirective,
        BindingTreeNodeComponent,
        IoTreeNodeComponent,
        HubTreeNodeComponent,
        TranslocoModule,
        VirtualPortTreeNodeComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlSchemeViewIoListComponent {
    public treeControl = new NestedTreeControl<ControlSchemeViewTreeNode, string>(
        (node) => node.children,
        {
            trackBy: this.trackByNodeTypeFn
        }
    );

    public dataSource = new MatTreeNestedDataSource<ControlSchemeViewTreeNode>();

    @Input()
    public set tree(
        v: ControlSchemeViewTreeNode[] | undefined
    ) {
        this.dataSource.data = v ?? [];
        this.treeControl.dataNodes = this.dataSource.data;
        this.treeControl.expandAll();
    }

    public get isEmpty(): boolean {
        return this.dataSource.data.length === 0;
    }

    public trackByNodeTypeFn(item: ControlSchemeViewTreeNode): string {
        switch (item.nodeType) {
            case ControlSchemeNodeTypes.Hub:
                return item.hubId;
            case ControlSchemeNodeTypes.IO:
                return item.portId.toString();
            case ControlSchemeNodeTypes.Binding:
                return `${item.controller?.id}-${item.inputId}`;
            case ControlSchemeNodeTypes.VirtualPort:
                return `${item.ioTypeA}/${item.ioTypeB}`;
        }
    }

    public isHub(_: number, node: ControlSchemeViewTreeNode): boolean {
        return node.nodeType === ControlSchemeNodeTypes.Hub;
    }

    public isPort(_: number, node: ControlSchemeViewTreeNode): boolean {
        return node.nodeType === ControlSchemeNodeTypes.IO;
    }

    public isVirtualPort(_: number, node: ControlSchemeViewTreeNode): boolean {
        return node.nodeType === ControlSchemeNodeTypes.VirtualPort;
    }
}
