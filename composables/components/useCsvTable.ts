import { ref, computed, h } from "vue";
import type {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  SortingState,
  VisibilityState,
} from "@tanstack/vue-table";
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { valueUpdater } from "../../lib/utils";
import { useStore } from "../../store/useStore";
import { ArrowUpDown } from "lucide-vue-next";
import { Button, Checkbox } from "@/components/ui"; // Import UI components

// Dynamic data structure
interface DynamicRecord {
  [key: string]: any;
  id: string;
}

export function useCsvTable(initialCsvData?: string) {
  const store = useStore();

  const parsedCsvData = computed<DynamicRecord[]>(() => {
    const csvContent = initialCsvData || store.csv1;
    if (!csvContent) return [];

    const rows = csvContent.split("\n");
    const { headers, startIndex } = store.getValidHeaders(rows);

    return rows
      .slice(startIndex)
      .filter((row) => row.trim())
      .map((row, index) => {
        const values = row.split(",").map((v) => v.trim());
        const record: DynamicRecord = { id: `row-${index}` };

        headers.forEach((header, i) => {
          const value = values[i];
          const numberValue = Number(value);
          record[header] = isNaN(numberValue) ? value : numberValue;
        });

        return record;
      });
  });

  const createColumnHeader = (header: string) => {
    return h(
      Button,
      {
        variant: "ghost",
        onClick: () =>
          table.value
            .getColumn(header)
            ?.toggleSorting(
              table.value.getColumn(header)?.getIsSorted() === "asc"
            ),
      },
      () => [header, h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
    );
  };

  const createCellContent = (row: DynamicRecord, header: string) => {
    const value = row.getValue(header);
    if (typeof value === "number") {
      return h(
        "div",
        { class: "text-right font-medium" },
        new Intl.NumberFormat().format(value)
      );
    }
    return h("div", {}, value as string);
  };

  const tableColumns = computed<ColumnDef<DynamicRecord>[]>(() => {
    const csvContent = initialCsvData || store.csv1;
    if (!csvContent) return [];

    const { headers } = store.getValidHeaders(csvContent.split("\n"));

    const columns: ColumnDef<DynamicRecord>[] = [
      {
        id: "select",
        header: ({ table }) =>
          h(Checkbox, {
            modelValue:
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate"),
            "onUpdate:modelValue": (value) =>
              table.toggleAllPageRowsSelected(!!value),
            ariaLabel: "Select all",
          }),
        cell: ({ row }) =>
          h(Checkbox, {
            modelValue: row.getIsSelected(),
            "onUpdate:modelValue": (value) => row.toggleSelected(!!value),
            ariaLabel: "Select row",
          }),
        enableSorting: true,
        enableHiding: true,
      },
    ];

    headers.forEach((header) => {
      columns.push({
        accessorKey: header,
        header: () => createColumnHeader(header),
        cell: ({ row }) => createCellContent(row, header),
      });
    });

    return columns;
  });

  const sorting = ref<SortingState>([]);
  const columnFilters = ref<ColumnFiltersState>([]);
  const columnVisibility = ref<VisibilityState>({});
  const rowSelection = ref({});
  const expanded = ref<ExpandedState>({});

  const table = ref(
    useVueTable({
      get data() {
        return parsedCsvData.value;
      },
      get columns() {
        return tableColumns.value;
      },
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      onSortingChange: (updaterOrValue) =>
        valueUpdater(updaterOrValue, sorting),
      onColumnFiltersChange: (updaterOrValue) =>
        valueUpdater(updaterOrValue, columnFilters),
      onColumnVisibilityChange: (updaterOrValue) =>
        valueUpdater(updaterOrValue, columnVisibility),
      onRowSelectionChange: (updaterOrValue) =>
        valueUpdater(updaterOrValue, rowSelection),
      onExpandedChange: (updaterOrValue) =>
        valueUpdater(updaterOrValue, expanded),
      state: {
        get sorting() {
          return sorting.value;
        },
        get columnFilters() {
          return columnFilters.value;
        },
        get columnVisibility() {
          return columnVisibility.value;
        },
        get rowSelection() {
          return rowSelection.value;
        },
        get expanded() {
          return expanded.value;
        },
      },
    })
  );

    // Filter input ref for first column (if any exists)
  const filterColumnKey = computed(() => {
    const columns = tableColumns.value;
    if (columns.length > 1) {
      const column = columns[1] as ColumnDef<DynamicRecord> & {
        accessorKey?: string;
      };
      return column.accessorKey;
    }
    return undefined;
  });

  return {
    table,
    tableColumns,
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    expanded,
    filterColumnKey,
    parsedCsvData,
    createCellContent,
    createColumnHeader
  };
} 