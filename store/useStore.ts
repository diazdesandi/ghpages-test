import { defineStore } from 'pinia'
import type { Target } from '@/interfaces/csv.interface';
import type { ComparisonOptions } from '@/store/types';

// Create store for handling two csv files

interface StoreState {
  csv1: string | null;
  csv2: string | null;
  comparisonInfo: {
    target1: Target | null;
    target2: Target | null;
  } | null;
  selectedTargets: {
    target1: Target | null;
    target2: Target | null;
  };
  comparisonOptions: ComparisonOptions;
}

export const useStore = defineStore('store', {
  state: (): StoreState => ({
    csv1: null,
    csv2: null,
    comparisonInfo: null,
    selectedTargets: {
      target1: null,
      target2: null,
    },
    comparisonOptions: {
      caseSensitive: false,
      normalizeWhitespace: true,
      mergeColumns: []
    } as ComparisonOptions
  }),
  
  actions: {
    /**
     * Load a CSV file and store its content
     * @param file - The CSV file to load
     * @param target - Which store slot to use (csv1 or csv2)
     * @returns Promise that resolves when file is loaded
     */
    loadCsv(file: File, target: Target): Promise<void> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (text) {
            this[target] = text;
            resolve();
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };
        
        reader.readAsText(file);
      });
    },
    
    /**
     * Get valid headers from CSV rows
     * @param rows - CSV rows
     * @returns Object containing headers and startIndex for data
     */
    getValidHeaders(rows: string[]): { headers: string[], startIndex: number } {
      let headerIndex = 0;

      // Iterate through rows to find the first non-empty row with comma-separated values
      while (headerIndex < rows.length) {
        const rowContent = rows[headerIndex]?.trim();

        // Check if the row is not empty, does not consist only of periods, and contains commas
        if (rowContent && rowContent !== '.' && !/^\.+$/.test(rowContent) && rowContent.includes(',')) {
          break;
        }
        headerIndex++;
      }

      // If we couldn't find a valid header, use an empty array
      const headers = headerIndex < rows.length ? rows[headerIndex].split(',') : [];

      return {
        headers,
        startIndex: headerIndex + 1 // Data starts after the header row
      };
    },
    
    normalizeValue(value: string): string {
      if (!value) return '';
      let normalized = value;
      
      // Apply case sensitivity
      if (!this.comparisonOptions.caseSensitive) {
        normalized = normalized.toLowerCase();
      }
      
      // Apply whitespace handling
      if (this.comparisonOptions.normalizeWhitespace) {
        // Replace multiple spaces with a single space and trim
        normalized = normalized.replace(/\s+/g, ' ').trim();
      } else {
        // Remove all whitespace when normalization is disabled
        normalized = normalized.replace(/\s+/g, '');
      }
      
      return normalized;
    },

    processRow(row: string, headers: string[]): Record<string, string> {
      // Split by comma but preserve whitespace for normalization
      const values = row.split(',');
      const record: Record<string, string> = {};
      
      // Map regular columns
      headers.forEach((header, i) => {
        record[header] = this.normalizeValue(values[i] || '');
      });
      
      // Handle merged columns
      this.comparisonOptions.mergeColumns?.forEach(({ sourceColumns, targetColumn, separator = ' ' }) => {
        const mergedValue = sourceColumns
          .map(col => values[headers.indexOf(col)] || '')
          .filter(Boolean)
          .map(v => this.normalizeValue(v))
          .join(separator);
        
        record[targetColumn] = mergedValue;
      });
      
      return record;
    },

    /**
     * Compare two CSV files and return differences
     * @param target1 - First target to compare
     * @param target2 - Second target to compare
     * @returns Array of differences between CSV1 and CSV2
     */
    compareCsv(target1: Target, target2: Target) {
      if (!this[target1] || !this[target2]) {
        return null;
      }

      const rows1 = this[target1].split('\n');
      const rows2 = this[target2].split('\n');
      
      const { headers: headers1, startIndex: startIndex1 } = this.getValidHeaders(rows1);
      const { headers: headers2, startIndex: startIndex2 } = this.getValidHeaders(rows2);
      
      // Add merged column headers to both sets of headers
      const mergedHeaders1 = [...headers1];
      const mergedHeaders2 = [...headers2];
      this.comparisonOptions.mergeColumns?.forEach(({ targetColumn }) => {
        if (!mergedHeaders1.includes(targetColumn)) {
          mergedHeaders1.push(targetColumn);
        }
        if (!mergedHeaders2.includes(targetColumn)) {
          mergedHeaders2.push(targetColumn);
        }
      });

      // Process data without headers
      const data1 = rows1
        .slice(startIndex1)
        .filter(row => row.trim())
        .map(row => this.processRow(row, headers1));
      
      const data2 = rows2
        .slice(startIndex2)
        .filter(row => row.trim())
        .map(row => this.processRow(row, headers2));
      
      // Compare based on merged/normalized values
      const onlyInCsv1 = data1.filter(row1 => 
        !data2.some(row2 => this.areRowsEqual(row1, row2))
      );
      
      const onlyInCsv2 = data2.filter(row2 => 
        !data1.some(row1 => this.areRowsEqual(row1, row2))
      );
      
      return {
        onlyInCsv1: [mergedHeaders1.join(','), ...onlyInCsv1.map(row => 
          mergedHeaders1.map(header => row[header] || '').join(',')
        )],
        onlyInCsv2: [mergedHeaders2.join(','), ...onlyInCsv2.map(row => 
          mergedHeaders2.map(header => row[header] || '').join(',')
        )]
      };
    },

    areRowsEqual(row1: Record<string, string>, row2: Record<string, string>): boolean {
      // Compare all columns, including merged ones
      const allColumns = [...new Set([...Object.keys(row1), ...Object.keys(row2)])];
      
      return allColumns.every(column => {
        const value1 = this.normalizeValue(row1[column] || '');
        const value2 = this.normalizeValue(row2[column] || '');
        return value1 === value2;
      });
    },

    /**
     * Get the intersection between two CSV files
     * @param target1 - First target to compare
     * @param target2 - Second target to compare
     * @returns Array of rows common to both CSV files
     */
    getIntersection(target1: Target, target2: Target) {
      if (!this[target1] || !this[target2]) {
        return null;
      }

      const rows1 = this[target1].split('\n');
      const rows2 = this[target2].split('\n');

      const { headers, startIndex: startIndex1 } = this.getValidHeaders(rows1);
      const { startIndex: startIndex2 } = this.getValidHeaders(rows2);

      // Extract data without headers
      const data1 = rows1.slice(startIndex1).filter(row => row.trim());
      const data2 = rows2.slice(startIndex2).filter(row => row.trim());

      // Find rows in csv1 that exist in csv2
      const intersection = data1.filter(row1 => data2.some(row2 => row1 === row2));

      return {
        headers,
        intersection
      };
    },
    setSelectedTargets(target1: Target, target2: Target) {
      this.selectedTargets = { target1, target2 };
      this.comparisonInfo = { target1, target2 };
    },
    setComparisonOptions(options: Partial<ComparisonOptions>) {
      this.comparisonOptions = {
        ...this.comparisonOptions,
        ...options
      };
    }
  }
})

// Function to compare two csv files
function compareCsv(csv1: string, csv2: string) {
  const rows1 = csv1.split('\n')
  const rows2 = csv2.split('\n')
}

// Function to get the difference between two csv files
function getDifference(csv1: string, csv2: string) {
  const rows1 = csv1.split('\n')
  const rows2 = csv2.split('\n')
}

// Function to get the intersection between two csv files
function getIntersection(csv1: string, csv2: string) {
  const rows1 = csv1.split('\n')
  const rows2 = csv2.split('\n')
}

