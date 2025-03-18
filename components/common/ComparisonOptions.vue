<script setup lang="ts">
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useTabs } from '@/composables/components/useTabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const store = useStore();
const { tabs, addResultsTab } = useTabs();
const newColumnName = ref('');
const selectedColumns = ref<string[]>([]);

const availableColumns = computed(() => {
  if (!store.csv1 || !store.csv2) return [];
  const rows1 = store.csv1.split('\n');
  const rows2 = store.csv2.split('\n');
  const { headers: headers1 } = store.getValidHeaders(rows1);
  const { headers: headers2 } = store.getValidHeaders(rows2);
  return [...new Set([...headers1, ...headers2])];
});

const addMergeColumn = () => {
  if (!newColumnName.value || selectedColumns.value.length === 0) return;
  
  store.setComparisonOptions({
    mergeColumns: [
      ...(store.comparisonOptions.mergeColumns || []),
      {
        sourceColumns: selectedColumns.value,
        targetColumn: newColumnName.value,
        separator: ' '
      }
    ]
  });
  
  // Reset form
  newColumnName.value = '';
  selectedColumns.value = [];
};

const options = [
  { id: 'caseSensitive', label: 'Case Sensitive' },
  { id: 'normalizeWhitespace', label: 'Normalize Whitespace' }
] as const;

const selectedOptions = computed(() => {
  return options
    .filter(opt => store.comparisonOptions[opt.id])
    .map(opt => opt.id);
});

const updateOptions = (values: string[]) => {
  store.setComparisonOptions({
    ...store.comparisonOptions,
    caseSensitive: values.includes('caseSensitive'),
    normalizeWhitespace: values.includes('normalizeWhitespace')
  });
};

const handleCompare = () => {
  if (store.selectedTargets.target1 && store.selectedTargets.target2) {
    addResultsTab();
  }
};
</script>

<template>
  <Card>
    <CardContent class="p-4">
      <div class="space-y-4">
        <!-- Comparison Selection and Controls -->
        <div v-if="tabs.length === 2" class="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Select Files</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Select CSVs</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                v-for="tab1 in tabs"
                :key="tab1.id"
                @click="store.setSelectedTargets(tab1.target, tabs.find(t => t.id !== tab1.id)?.target ?? null)"
              >
                {{ tab1.name }} <ArrowRight class="inline-block w-4 h-4 mx-1" /> {{ tabs.find((t) => t.id !== tab1.id)?.name }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ToggleGroup
            type="multiple"
            :model-value="selectedOptions"
            @update:model-value="updateOptions"
            class="inline-flex"
            size="sm"
          >
            <ToggleGroupItem
              v-for="option in options"
              :key="option.id"
              :value="option.id"
            >
              {{ option.label }}
            </ToggleGroupItem>
          </ToggleGroup>
          <Button 
            @click="handleCompare" 
            :disabled="!store.selectedTargets.target1 || !store.selectedTargets.target2"
            size="sm"
          >
            Compare
          </Button>
        </div>

        <!-- Column Merging -->
        <div class="flex items-center gap-2">
          <Select
            v-model="selectedColumns"
            multiple
            class="flex-1"
          >
            <SelectTrigger class="h-8">
              <SelectValue placeholder="Select columns to merge" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="column in availableColumns"
                :key="column"
                :value="column"
              >
                {{ column }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Input
            v-model="newColumnName"
            placeholder="New column name"
            class="w-40 h-8"
          />
          <Button 
            variant="outline" 
            size="sm"
            @click="addMergeColumn"
            :disabled="!newColumnName || selectedColumns.length === 0"
          >
            Merge
          </Button>
        </div>

        <!-- Active Merges -->
        <div v-if="store.comparisonOptions.mergeColumns?.length" class="text-sm space-y-1">
          <div 
            v-for="(merge, index) in store.comparisonOptions.mergeColumns" 
            :key="index"
            class="flex items-center gap-1 text-muted-foreground"
          >
            <span>{{ merge.sourceColumns.join(' + ') }}</span>
            <ArrowRight class="w-3 h-3" />
            <span class="font-medium text-foreground">{{ merge.targetColumn }}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template> 