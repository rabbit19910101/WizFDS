import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';

import { Main } from '@services/main/main';
import { Fds } from '@services/fds-object/fds-object';
import { UiState } from '@services/ui-state/ui-state';
import { Library } from '@services/library/library';
import { Isof } from '@services/fds-object/output/isof';
import { quantities } from '@enums/fds/enums/fds-enums-quantities';
import { Quantity } from '@services/fds-object/primitives';
import { Spec } from '@services/fds-object/specie/spec';
import { MainService } from '@services/main/main.service';
import { UiStateService } from '@services/ui-state/ui-state.service';
import { LibraryService } from '@services/library/library.service';
import { IdGeneratorService } from '@services/id-generator/id-generator.service';

import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { map, filter, includes, find, findIndex, cloneDeep, set } from 'lodash';
import { SnackBarService } from '@services/snack-bar/snack-bar.service';

@Component({
  selector: 'app-isosurface',
  templateUrl: './isosurface.component.html',
  styleUrls: ['./isosurface.component.scss']
})
export class IsosurfaceComponent implements OnInit, OnDestroy {

  // Global objects
  main: Main;
  fds: Fds;
  ui: UiState;
  lib: Library;

  // Component objects
  isofs: Isof[];
  libIsofs: Isof[];
  isof: Isof;
  isofOld: Isof;
  objectType: string = 'current'; // Lib or current

  mainSub;
  uiSub;
  libSub;

  // Scrolbars containers
  @ViewChild('isofScrollbar', {static: false}) isofScrollbar: PerfectScrollbarComponent;
  @ViewChild('isofLibScrollbar', {static: false}) isofLibScrollbar: PerfectScrollbarComponent;

  // Enums
  QUANTITIES = map(filter(quantities, function (o) { return includes(o.type, 'i') }), function (o) { return new Quantity(JSON.stringify(o)) });
  SPECIES: Spec[];

  constructor(
    private mainService: MainService,
    private uiStateService: UiStateService,
    private libraryService: LibraryService,
    private snackBarService: SnackBarService,
  ) { }

  ngOnInit() {
    console.clear();
    // Subscribe main object
    this.mainSub = this.mainService.getMain().subscribe(main => this.main = main);
    this.uiSub = this.uiStateService.uiObservable.subscribe(uiObservable => this.ui = uiObservable);
    this.libSub = this.libraryService.getLibrary().subscribe(lib => this.lib = lib);

    // Assign to local variables
    this.fds = this.main.currentFdsScenario.fdsObject;
    this.isofs = this.main.currentFdsScenario.fdsObject.output.isofs;
    this.libIsofs = this.lib.isofs;
    this.SPECIES = this.main.currentFdsScenario.fdsObject.specie.specs;

    // Activate last element
    this.isofs.length > 0 ? this.isof = this.isofs[this.ui.output['isof'].elementIndex] : this.isof = undefined;
  }

  ngAfterViewInit() {
    // Set scrollbars position y after view rendering and set last selected element
    this.isofScrollbar.directiveRef.scrollToY(this.ui.output['isof'].scrollPosition);
    this.isofs.length > 0 && this.activate(this.isofs[this.ui.output['isof'].elementIndex].id);
  }

  ngOnDestroy() {
    this.mainSub.unsubscribe();
    this.uiSub.unsubscribe();
    this.libSub.unsubscribe();
  }

  /** Activate element on click */
  public activate(id: string, library?: boolean) {
    if (!library) {
      this.objectType = 'current';
      this.isof = find(this.fds.output.isofs, function (o) { return o.id == id; });
      this.ui.output['isof'].elementIndex = findIndex(this.isofs, { id: id });
      this.isofOld = cloneDeep(this.isof);
    }
    else {
      this.objectType = 'library';
      this.isof = find(this.lib.isofs, function (o) { return o.id == id; });
      this.ui.output['libIsof'].elementIndex = findIndex(this.libIsofs, { id: id });
      this.isofOld = cloneDeep(this.isof);
    }
  }

  /** Push new element */
  public add(library?: boolean) {
    // Create new isof object with unique id
    if (!library) {
      let element = { id: 'ISOF' + this.mainService.getListId(this.isofs, 'isof') };
      this.isofs.push(new Isof(JSON.stringify(element), this.fds.specie.specs, this.fds.particle.parts));
      this.activate(element.id);
    }
    else {
      let element = { id: 'ISOF' + this.mainService.getListId(this.libIsofs, 'isof') };
      this.libIsofs.push(new Isof(JSON.stringify(element), this.lib.specs)); // Add parts ... !!!
      this.activate(element.id, true);
    }
  }

  /** Delete element */
  public delete(id: string, library?: boolean) {
    if (!library) {
      let index = findIndex(this.isofs, { id: id });
      this.isofs.splice(index, 1);
      if (index != 0) {
        this.isofs.length == 0 ? this.isof = undefined : this.activate(this.isofs[index - 1].id);
      }
      else {
        this.isofs.length == 0 ? this.isof = undefined : this.activate(this.isofs[index].id);
      }
    }
    else {
      let index = findIndex(this.libIsofs, { id: id });
      this.libIsofs.splice(index, 1);
      if (index != 0) {
        this.libIsofs.length == 0 ? this.isof = undefined : this.activate(this.libIsofs[index - 1].id, true);
      }
      else {
        this.libIsofs.length == 0 ? this.isof = undefined : this.activate(this.libIsofs[index].id, true);
      }
    }
  }

  /** Update scroll position */
  public scrollbarUpdate(element: string) {
    set(this.ui.output, element + '.scrollPosition', this[element + 'Scrollbar'].directiveRef.isofs().y);
  }

  /** Toggle library */
  public toggleLibrary() {
    this.ui.output['isof'].lib == 'closed' ? this.ui.output['isof'].lib = 'opened' : this.ui.output['isof'].lib = 'closed';
  }

  /** Import from library */
  public importLibraryItem(id: string) {
    let idGeneratorService = new IdGeneratorService;
    let libIsof = find(this.lib.isofs, function (o) { return o.id == id; });
    let isof = cloneDeep(libIsof);
    isof.uuid = idGeneratorService.genUUID()
    this.isofs.push(isof);
  }

  /** Import from library */
  public mergeLibraryItem(id: string) {
    let libIsof = find(this.lib.isofs, function (o) { return o.id == id; });
    if (this.isof != undefined) {
      this.isof.quantity = libIsof.quantity;
      this.isof.values = libIsof.values;
    }
    else {
        this.snackBarService.notify('warning', 'Select current isof before merging');
    }
  }

  // COMPONENT METHODS
  public showSpecs(): boolean {
    if(this.isof.quantity != undefined) {
      let show = this.isof.quantity.quantity != '' ? this.isof.quantity.spec : false;
      return show;
    }
    return false;
  }

  public showParts(): boolean {
    if(this.isof.quantity != undefined) {
      let show = this.isof.quantity.quantity != '' ? this.isof.quantity.part : false;
      return show;
    }
    return false;
  }

}
