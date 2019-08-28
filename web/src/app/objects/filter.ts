import { MatTableDataSource, MatChipInputEvent } from "@angular/material";

const OR = "|";

export enum FilterType {
  For,
  Out,
  General
}

export class Filter {
  ftype: FilterType;
  key: string;
  val: string;

  filter = (data: any): boolean => {
    switch (this.ftype) {
      case FilterType.General: {
        const vals = this.val.split(OR);
        const datastr = Object.keys(data)
          .reduce((currentTerm: string, key: string) => {
            if (!data[key]) {
              return currentTerm;
            }

            return currentTerm + (data as { [key: string]: any })[key] + "◬";
          }, "")
          .toLowerCase();

        return vals.some(val => datastr.includes(val));
        // return datastr.includes(this.val);
      }
      case FilterType.For: {
        if (!data[this.key]) {
          if (!this.val) {
            return true;
          }

          return false;
        }

        const vals = this.val.split(OR);
        const datastr = (data as { [k: string]: any })[this.key]
          .toString()
          .toLowerCase();
        return vals.some(val => datastr.includes(val));
      }
      case FilterType.Out: {
        if (!data[this.key]) {
          if (!this.val) {
            return false;
          }

          return true;
        }

        // TODO add or field to this one

        const datastr = (data as { [k: string]: any })[this.key]
          .toString()
          .toLowerCase();
        return !datastr.includes(this.val);
      }
      default:
        break;
    }
  };

  constructor(ftype: FilterType, key: string, val: string) {
    this.ftype = ftype;
    this.key = key;
    this.val = val
      ? val
          .toString()
          .trim()
          .toLowerCase()
      : val;
  }
}

export class FilterSet<T> {
  _filters: Filter[] = [];
  _dataSource: MatTableDataSource<T>;

  get filters(): Filter[] {
    return this._filters.slice();
  }

  add = (ftype: FilterType, key: string, val: string) => {
    if (key) {
      // check if a filter already exists for key
      const filter = this._filters.find(
        f => f.ftype === ftype && f.key === key
      );

      if (filter) {
        const vals = filter.val.split(OR);
        vals.push(val);

        filter.val = vals.join(OR);
        this.forceFilter();
        return;
      }
    }

    this._filters.push(new Filter(ftype, key, val));
    this.forceFilter();
  };

  remove = (ftype: FilterType, key: string, val: string) => {
    const filter = this.find(ftype, key, val);
    if (filter) {
      const vals = filter.val.split(OR).filter(v => v !== val);

      if (vals.length > 0 && filter.val !== val) {
        filter.val = vals.join(OR);
      } else {
        // just delete it
        const idx = this._filters.indexOf(filter);
        if (idx >= 0) {
          this._filters.splice(idx, 1);
        }
      }
    }

    this.forceFilter();
  };

  toggle = (ftype: FilterType, key: string, val: string) => {
    if (this.exists(ftype, key, val)) {
      this.remove(ftype, key, val);
    } else {
      this.add(ftype, key, val);
    }
  };

  find = (ftype: FilterType, key: string, val: string): Filter => {
    return this._filters.find(f => {
      if (f.ftype !== ftype || f.key !== key) {
        return false;
      }

      const vals = f.val.split(OR);
      return f.val === val || vals.includes(val);
    });
  };

  exists = (ftype: FilterType, key: string, val: string): boolean => {
    return this.find(ftype, key, val) !== undefined;
  };

  addChip = (event: MatChipInputEvent) => {
    const value = event.value.trim();

    let split = value.split(/:(.*)/);
    split = split.filter(s => s); // filter out blank ones
    split = split.map(s => s.trim()); // trim each string

    if (
      split.length === 2 &&
      Object.keys(this._dataSource.data[0]).includes(split[0])
    ) {
      this.add(FilterType.For, split[0], split[1]);
    } else {
      this.add(FilterType.General, undefined, value);
    }

    if (event.input) {
      event.input.value = ""; // reset the input
    }
  };

  forceFilter = () => {
    if (!this._dataSource.filter && this._filters.length > 0) {
      this._dataSource.filter = "◬";
    }

    this._dataSource._filterData(this._dataSource.data);
    this._dataSource._updateChangeSubscription();

    if (this._dataSource.paginator) {
      this._dataSource.paginator.firstPage();
    }
  };

  filterPredicate = (data: T, filter: string): boolean => {
    for (const f of this._filters) {
      if (!f.filter(data)) {
        return false;
      }
    }

    return true;
  };

  constructor(dataSource: MatTableDataSource<T>) {
    this._dataSource = dataSource;
    this._dataSource.filterPredicate = this.filterPredicate;
  }
}
